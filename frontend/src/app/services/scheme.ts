import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { Scheme } from '../models/scheme';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

interface BackendScheme extends Omit<Scheme, 'id'> {
  _id: string;
}

function toScheme(s: BackendScheme): Scheme {
  const { _id, ...rest } = s;
  return { id: _id, ...rest };
}

export interface SchemeMatch {
  scheme: Scheme;
  matchedCriteria: string[];
  totalCriteria: number;
}

export interface CriteriaMatch extends SchemeMatch {
  missingCriteria: string[];
}

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/schemes`;

  // Cached list so components that need synchronous-ish access (eligibility checker)
  // can reuse the same fetch instead of hitting the API repeatedly.
  private cached$: Observable<Scheme[]> | null = null;

  getAll(): Observable<Scheme[]> {
    if (!this.cached$) {
      this.cached$ = this.http
        .get<{ success: boolean; data: BackendScheme[] }>(this.apiUrl)
        .pipe(
          map((res) => res.data.map(toScheme)),
          shareReplay(1)
        );
    }
    return this.cached$;
  }

  getById(id: string): Observable<Scheme | undefined> {
  return this.http
    .get<{ success: boolean; data: BackendScheme }>(`${this.apiUrl}/${id}`)
    .pipe(
      map((res) => toScheme(res.data)),
      catchError((err) => {
        if (err?.status !== 404) {
          console.error(`SchemeService.getById(${id}) failed:`, err);
        }
        return of(undefined);
      })
    );
}
  // Matches schemes to the logged-in user's profile via the backend endpoint.
  getMatches(user: User | null): Observable<SchemeMatch[]> {
    if (!user) return of([]);
    return this.http
      .get<{ success: boolean; data: { scheme: BackendScheme; matchedCriteria: string[]; totalCriteria: number }[] }>(
        `${this.apiUrl}/match/me`
      )
      .pipe(
        map((res) =>
          res.data.map((m) => ({
            scheme: toScheme(m.scheme),
            matchedCriteria: m.matchedCriteria,
            totalCriteria: m.totalCriteria,
          }))
        )
      );
  }

  // Pure client-side matching against the cached scheme list (used by the Eligibility Checker,
  // which is an anonymous "what schemes might fit these numbers" tool, not tied to a logged-in profile).
  matchByCriteria(criteria: {
    businessType: string;
    investment: number;
    age: number;
    isFirstGen: boolean;
    isWomenOwned: boolean;
  }): Observable<CriteriaMatch[]> {
    return this.getAll().pipe(
      map((schemes) =>
        schemes.map((scheme) => {
          const checks: { label: string; passed: boolean }[] = [];

          checks.push({
            label: `Business type: ${criteria.businessType}`,
            passed: scheme.businessTypes.includes(criteria.businessType),
          });

          if (scheme.minInvestment !== undefined && scheme.maxInvestment !== undefined) {
            checks.push({
              label: `Investment ₹${scheme.minInvestment.toLocaleString()}–₹${scheme.maxInvestment.toLocaleString()}`,
              passed: criteria.investment >= scheme.minInvestment && criteria.investment <= scheme.maxInvestment,
            });
          }

          if (scheme.minAge !== undefined) {
            const maxOk = scheme.maxAge ? criteria.age <= scheme.maxAge : true;
            checks.push({
              label: `Age ${scheme.minAge}${scheme.maxAge ? '–' + scheme.maxAge : '+'}`,
              passed: criteria.age >= scheme.minAge && maxOk,
            });
          }

          if (scheme.category === 'First-Generation Entrepreneurs') {
            checks.push({ label: 'First-generation entrepreneur', passed: criteria.isFirstGen });
          }

          if (scheme.category === 'Women Entrepreneurs') {
            checks.push({ label: 'Women-owned business', passed: criteria.isWomenOwned });
          }

          return {
            scheme,
            matchedCriteria: checks.filter((c) => c.passed).map((c) => c.label),
            missingCriteria: checks.filter((c) => !c.passed).map((c) => c.label),
            totalCriteria: checks.length,
          };
        })
      )
    );
  }
}

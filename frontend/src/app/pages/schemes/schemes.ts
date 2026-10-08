import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeService } from '../../services/scheme';
import { SchemeCard } from '../../shared/scheme-card/scheme-card';
import { FilterPanel, SchemeFilters } from '../../shared/filter-panel/filter-panel';
import { Scheme } from '../../models/scheme';

@Component({
  selector: 'app-schemes',
  standalone: true,
  imports: [CommonModule, SchemeCard, FilterPanel],
  templateUrl: './schemes.html',
  styleUrl: './schemes.css',
})
export class Schemes implements OnInit {
  allSchemes: Scheme[] = [];
  filtered: Scheme[] = [];
  isLoading = true;

  constructor(private schemeService: SchemeService) {}

  ngOnInit(): void {
    this.schemeService.getAll().subscribe((schemes) => {
      this.allSchemes = schemes;
      this.filtered = schemes;
      this.isLoading = false;
    });
  }

  onFiltersChanged(filters: SchemeFilters): void {
    this.filtered = this.allSchemes.filter(s => {
      const matchesAuthority = !filters.authority || s.authority === filters.authority;
      const matchesCategory = !filters.category || s.category === filters.category;
      const matchesSearch = !filters.search || s.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchesAuthority && matchesCategory && matchesSearch;
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';
import { SchemeService, SchemeMatch } from '../../services/scheme';
import { ApplicationService } from '../../services/application';
import { NotificationService } from '../../services/notification';
import { User } from '../../models/user';
import { Application } from '../../models/application';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  user: User | null = null;
  matches: SchemeMatch[] = [];
  applications: Application[] = [];
  notifications: Notification[] = [];
  readinessPercent = 40;
  isLoading = true;

  constructor(
    private auth: Auth,
    private router: Router,
    private schemeService: SchemeService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser();

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    forkJoin({
      matches: this.schemeService.getMatches(this.user),
      applications: this.applicationService.getMine(),
      notifications: this.notificationService.getAll(),
    }).subscribe({
      next: ({ matches, applications, notifications }) => {
        this.matches = matches.slice(0, 4);
        this.applications = applications;
        this.notifications = notifications.slice(0, 3);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
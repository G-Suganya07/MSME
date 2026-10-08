import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchemeService } from '../../services/scheme';
import { Scheme } from '../../models/scheme';

@Component({
  selector: 'app-scheme-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheme-details.html',
  styleUrl: './scheme-details.css',
})
export class SchemeDetails implements OnInit {
  scheme: Scheme | undefined;
isLoading = true;
loadError: string | null = null;

constructor(private route: ActivatedRoute, private schemeService: SchemeService) {}

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (!id) {
    this.isLoading = false;
    return;
  }
  this.schemeService.getById(id).subscribe({
    next: (scheme) => {
      this.scheme = scheme;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to load scheme', err);
      this.loadError = 'Something went wrong loading this scheme. Please try again.';
      this.isLoading = false;
    },
  });
}
}

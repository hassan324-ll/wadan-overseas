import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  readonly keyServices = [
    'Overseas Job Placement',
    'Work Visa Processing',
    'Document Attestation & Legalization',
    'Employer Coordination',
    'Travel & Relocation Assistance',
  ];

  readonly countries = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Bahrain', 'Iraq'];
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);
  private readonly sanitizer = inject(DomSanitizer);
  showSuccess = false;
  consentChecked = false;
  successTimer: ReturnType<typeof setTimeout> | null = null;
  dataSub: Subscription | null = null;
  contactContent = this.firestoreService.getDefaultContactPage();
  safeMapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps?q=Muqam+Chowk+Mardan+Pakistan&output=embed'
  );

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getContactPage().subscribe((data) => {
      this.contactContent = data ?? this.firestoreService.getDefaultContactPage();
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${encodeURIComponent(this.contactContent.mapQuery)}&output=embed`
      );
    });
  }

  submitInquiry(form: NgForm): void {
    if (form.invalid || !this.consentChecked) {
      form.control.markAllAsTouched();
      return;
    }

    this.showSuccess = true;
    form.resetForm();
    this.consentChecked = false;

    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    this.successTimer = setTimeout(() => {
      this.showSuccess = false;
    }, 4500);
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.dataSub = null;

    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

}


import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';

interface ContactFormModel {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  message: string;
}

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
  contactFormModel: ContactFormModel = this.createEmptyContactForm();
  loading = false;

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
      if (!this.consentChecked) {
        alert('Please agree to the processing of your information for consultation and follow-up.');
      }
      return;
    }

    this.sendEmail(form);
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.dataSub = null;

    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }


  private sendEmail(form: NgForm): void {
    this.loading = true;

    const params = {
      full_name: this.contactFormModel.full_name,
      email: this.contactFormModel.email,
      phone: this.contactFormModel.phone,
      profession: this.contactFormModel.profession,
      message: this.contactFormModel.message,
      agreement: this.consentChecked ? 'Yes' : 'No',
    };

    emailjs
      .send('service_4p6i0wr', 'template_nnp3dcf', params, 'DetmNaldmfj904ZyZ')
      .then(() => {
        this.triggerSuccessMessage();
        this.resetContactForm(form);
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        alert('Failed to send message. Please try again.');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private resetContactForm(form: NgForm): void {
    this.contactFormModel = this.createEmptyContactForm();
    form.resetForm(this.contactFormModel);
    this.consentChecked = false;
  }

  private triggerSuccessMessage(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.showSuccess = true;
    this.successTimer = setTimeout(() => {
      this.showSuccess = false;
      this.successTimer = null;
    }, 4500);
  }

  private createEmptyContactForm(): ContactFormModel {
    return {
      full_name: '',
      email: '',
      phone: '',
      profession: '',
      message: '',
    };
  }
}

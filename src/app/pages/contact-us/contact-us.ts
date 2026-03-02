import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs implements OnDestroy {
  showSuccess = false;
  consentChecked = false;
  successTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

}


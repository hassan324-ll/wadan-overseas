import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-edit-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-contact.html',
  styleUrl: './edit-contact.css',
})
export class EditContact implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);

  loading = false;
  message = '';
  dataSub: Subscription | null = null;

  readonly form = this.fb.nonNullable.group({
    heroTitle: ['', Validators.required],
    heroSubtitle: ['', Validators.required],
    formTitle: ['', Validators.required],
    formSubtitle: ['', Validators.required],
    visitTitle: ['', Validators.required],
    visitDescription: ['', Validators.required],
    mapQuery: ['', Validators.required],
  });

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getContactPage().subscribe((data) => {
      this.form.patchValue(data ?? this.firestoreService.getDefaultContactPage());
    });
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.dataSub = null;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    try {
      await this.firestoreService.updateContactPage(this.form.getRawValue());
      this.message = 'Contact page updated.';
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Update failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}

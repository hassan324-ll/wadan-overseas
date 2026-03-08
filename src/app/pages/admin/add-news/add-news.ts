import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirestoreService, NewsArticle } from '../../../services/firestore.service';

const trimmedRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  return value.length > 0 ? null : { required: true };
};

@Component({
  selector: 'app-add-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-news.html',
  styleUrl: './add-news.css',
})
export class AddNews implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);

  loading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  editingNewsId: string | null = null;
  dataSub: Subscription | null = null;
  newsItems: NewsArticle[] = [];

  readonly form = this.fb.nonNullable.group({
    title: ['', trimmedRequired],
    category: ['Agency Update', trimmedRequired],
    excerpt: ['', [trimmedRequired, Validators.maxLength(220)]],
    content: ['', [trimmedRequired, Validators.minLength(10)]],
    imageUrl: ['/sliderimg2.avif', trimmedRequired],
    ctaLabel: ['Contact Our Team', trimmedRequired],
    ctaLink: ['/contact-us', trimmedRequired],
    isFeatured: [false],
  });

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getNewsItems().subscribe((items) => {
      this.newsItems = items;
    });
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.dataSub = null;
  }

  get previewTitle(): string {
    return this.form.controls.title.value.trim() || 'New agency announcement';
  }

  get previewExcerpt(): string {
    return this.form.controls.excerpt.value.trim() || 'A short summary of your update will appear here.';
  }

  get previewCategory(): string {
    return this.form.controls.category.value.trim() || 'Agency Update';
  }

  get invalidFieldLabels(): string[] {
    const labels: Array<{ invalid: boolean; label: string }> = [
      { invalid: this.form.controls.title.invalid, label: 'News Title' },
      { invalid: this.form.controls.category.invalid, label: 'Category' },
      { invalid: this.form.controls.excerpt.invalid, label: 'Short Excerpt' },
      { invalid: this.form.controls.content.invalid, label: 'Full Content' },
      { invalid: this.form.controls.imageUrl.invalid, label: 'Cover Image URL' },
      { invalid: this.form.controls.ctaLabel.invalid, label: 'CTA Button Label' },
      { invalid: this.form.controls.ctaLink.invalid, label: 'CTA Link' },
    ];

    return labels.filter((item) => item.invalid).map((item) => item.label);
  }

  get isEditing(): boolean {
    return this.editingNewsId !== null;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageType = 'error';
      this.message = `Please check these fields: ${this.invalidFieldLabels.join(', ')}.`;
      return;
    }

    const value = this.form.getRawValue();

    this.loading = true;
    this.message = '';
    this.messageType = '';
    try {
      const payload = {
        title: value.title.trim(),
        slug: this.slugify(value.title),
        category: value.category.trim(),
        excerpt: value.excerpt.trim(),
        content: value.content.trim(),
        imageUrl: value.imageUrl.trim(),
        ctaLabel: value.ctaLabel.trim(),
        ctaLink: value.ctaLink.trim(),
        isFeatured: value.isFeatured,
      };

      if (this.editingNewsId) {
        await this.firestoreService.updateNewsItem(this.editingNewsId, payload);
        this.messageType = 'success';
        this.message = 'News updated successfully.';
      } else {
        await this.firestoreService.addNewsItem(payload);
        this.messageType = 'success';
        this.message = 'News published successfully.';
      }

      this.resetForm();
    } catch (error: unknown) {
      const details =
        error instanceof Error && error.message.includes('Missing or insufficient permissions')
          ? 'Firestore rules are blocking writes. Make sure your admin account is logged in and has write access to the pages documents.'
          : error instanceof Error
            ? error.message
            : 'Unknown error';
      this.messageType = 'error';
      this.message = `Save failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  editNewsItem(item: NewsArticle): void {
    this.editingNewsId = item.id;
    this.message = '';
    this.messageType = '';
    this.form.setValue({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt,
      content: item.content,
      imageUrl: item.imageUrl,
      ctaLabel: item.ctaLabel,
      ctaLink: item.ctaLink,
      isFeatured: item.isFeatured,
    });
    this.form.markAsPristine();
  }

  async deleteNewsItem(item: NewsArticle): Promise<void> {
    const confirmed = typeof window === 'undefined' ? true : window.confirm(`Delete "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.message = '';
    this.messageType = '';
    try {
      await this.firestoreService.deleteNewsItem(item.id);
      if (this.editingNewsId === item.id) {
        this.resetForm();
      }
      this.messageType = 'success';
      this.message = 'News deleted successfully.';
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.messageType = 'error';
      this.message = `Delete failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.message = '';
    this.messageType = '';
  }

  formatPublishedDate(publishedAt: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(publishedAt));
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private resetForm(): void {
    this.editingNewsId = null;
    this.form.setValue({
      title: '',
      category: 'Agency Update',
      excerpt: '',
      content: '',
      imageUrl: '/sliderimg2.avif',
      ctaLabel: 'Contact Our Team',
      ctaLink: '/contact-us',
      isFeatured: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}

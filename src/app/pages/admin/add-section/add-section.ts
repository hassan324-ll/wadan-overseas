import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomSectionCard, FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-add-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-section.html',
  styleUrl: './add-section.css',
})
export class AddSection {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);
  private readonly router = inject(Router);

  loading = false;
  message = '';

  readonly form = this.fb.nonNullable.group({
    key: ['', Validators.required],
    targetPage: this.fb.control<'home' | 'about-us' | 'services' | 'contact-us'>('home', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    sectionType: this.fb.control<'banner' | 'cards'>('banner', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    homePlacement: this.fb.control<
      | 'top'
      | 'after-hero'
      | 'after-services'
      | 'after-countries'
      | 'after-why-choose'
      | 'after-how-it-works'
      | 'after-testimonials'
      | 'after-final-cta'
      | 'bottom'
    >('bottom', { nonNullable: true }),
    backgroundImageUrl: [''],
    heading1: ['', Validators.required],
    heading2: [''],
    paragraph: ['', Validators.required],
    buttonText: ['', Validators.required],
    buttonLink: ['/contact-us', Validators.required],
    buttonIcon: ['fa-solid fa-paper-plane'],
    cardsPerRow: [3 as 3 | 4],
    cards: this.fb.array([]),
  });

  readonly homePlacementOptions: Array<{
    value:
      | 'top'
      | 'after-hero'
      | 'after-services'
      | 'after-countries'
      | 'after-why-choose'
      | 'after-how-it-works'
      | 'after-testimonials'
      | 'after-final-cta'
      | 'bottom';
    label: string;
  }> = [
    { value: 'top', label: 'Top of Home Page' },
    { value: 'after-hero', label: 'Below Hero Section' },
    { value: 'after-services', label: 'Below Services Section' },
    { value: 'after-countries', label: 'Below Countries Section' },
    { value: 'after-why-choose', label: 'Below Why Choose Section' },
    { value: 'after-how-it-works', label: 'Below How It Works Section' },
    { value: 'after-testimonials', label: 'Below Testimonials Section' },
    { value: 'after-final-cta', label: 'Below Final CTA' },
    { value: 'bottom', label: 'Bottom of Home Page' },
  ];

  get cards(): FormArray {
    return this.form.get('cards') as FormArray;
  }

  get isHomeTarget(): boolean {
    return this.form.controls.targetPage.value === 'home';
  }

  get isCardsSection(): boolean {
    return this.form.controls.sectionType.value === 'cards';
  }

  constructor() {
    this.rebuildCards(3);
    this.form.controls.cardsPerRow.valueChanges.subscribe((value) => {
      this.rebuildCards(value ?? 3);
    });
  }

  get preview() {
    const value = this.form.getRawValue();
    return {
      sectionType: value.sectionType,
      backgroundImageUrl: value.backgroundImageUrl.trim() || '/sliderimg2.avif',
      heading1: value.heading1.trim() || 'Your Heading',
      heading2: value.heading2.trim(),
      paragraph: value.paragraph.trim() || 'Your section paragraph will appear here.',
      buttonText: value.buttonText.trim() || 'Learn More',
      buttonLink: value.buttonLink.trim() || '/contact-us',
      buttonIcon: value.buttonIcon.trim() || 'fa-solid fa-paper-plane',
      cardsPerRow: value.cardsPerRow,
      cards: value.cards as CustomSectionCard[],
    };
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const normalizedKey = value.key
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.loading = true;
    this.message = '';
    try {
      const cardsPayload =
        value.sectionType === 'cards' ? (value.cards as CustomSectionCard[]) : undefined;
      await this.firestoreService.addCustomSection({
        key: normalizedKey,
        title: value.heading1,
        subtitle: value.heading2,
        description: value.paragraph,
        sectionType: value.sectionType,
        targetPage: value.targetPage,
        homePlacement: value.targetPage === 'home' ? value.homePlacement : undefined,
        backgroundImageUrl: value.backgroundImageUrl.trim(),
        heading1: value.heading1,
        heading2: value.heading2,
        paragraph: value.paragraph,
        buttonText: value.buttonText,
        buttonLink: value.buttonLink,
        buttonIcon: value.buttonIcon,
        cardsPerRow: value.sectionType === 'cards' ? value.cardsPerRow : undefined,
        cards: cardsPayload,
      });
      this.message = 'New section added successfully.';
      this.form.markAsPristine();
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Save failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async goToDashboard(): Promise<void> {
    await this.router.navigateByUrl('/admin/dashboard');
  }

  private rebuildCards(count: 3 | 4): void {
    this.cards.clear();
    for (let i = 0; i < count; i++) {
      this.cards.push(
        this.fb.nonNullable.group({
          title: [`Card ${i + 1}`, Validators.required],
          subtitle: [''],
          description: ['Card description', Validators.required],
          icon: ['fa-solid fa-star'],
          buttonText: ['Learn More'],
          buttonLink: ['/contact-us'],
          backgroundImageUrl: [''],
        })
      );
    }
  }
}

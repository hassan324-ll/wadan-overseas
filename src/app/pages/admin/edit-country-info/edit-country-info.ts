import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CountryInfoItem,
  CountryInfoPageContent,
  FirestoreService,
} from '../../../services/firestore.service';

@Component({
  selector: 'app-edit-country-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-country-info.html',
  styleUrl: './edit-country-info.css',
})
export class EditCountryInfo implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);

  loading = false;
  message = '';
  dataSub: Subscription | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subtitle: ['', Validators.required],
    countries: this.fb.array([]),
  });

  get countries(): FormArray {
    return this.form.get('countries') as FormArray;
  }

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getCountryInfoPage().subscribe((data) => {
      const content = data ?? this.firestoreService.getDefaultCountryInfoPage();
      this.patchForm(content);
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
      const value = this.form.getRawValue();
      await this.firestoreService.updateCountryInfoPage({
        title: value.title,
        subtitle: value.subtitle,
        countries: value.countries as CountryInfoItem[],
      });
      this.message = 'Country info updated.';
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Update failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  private patchForm(content: CountryInfoPageContent): void {
    this.form.patchValue({
      title: content.title ?? '',
      subtitle: content.subtitle ?? '',
    });

    this.countries.clear();
    (content.countries ?? []).forEach((country) => {
      this.countries.push(
        this.fb.nonNullable.group({
          slug: [country.slug, Validators.required],
          name: [country.name, Validators.required],
          flag: [country.flag, Validators.required],
          heroImage: [country.heroImage, Validators.required],
          intro: [country.intro, Validators.required],
          sectors: [country.sectors, Validators.required],
          support: [country.support, Validators.required],
          guidance: [country.guidance, Validators.required],
        })
      );
    });
  }
}

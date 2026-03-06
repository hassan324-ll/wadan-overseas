import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AboutTeamMember, FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-edit-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-about.html',
  styleUrl: './edit-about.css',
})
export class EditAbout implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);

  loading = false;
  message = '';
  dataSub: Subscription | null = null;

  readonly form = this.fb.nonNullable.group({
    heroTitle: ['', Validators.required],
    heroSubtitle: ['', Validators.required],
    whoTitle: ['', Validators.required],
    whoParagraph1: ['', Validators.required],
    whoParagraph2: ['', Validators.required],
    whoParagraph3: ['', Validators.required],
    countriesTitle: ['', Validators.required],
    countriesSubtitle: ['', Validators.required],
    teamTitle: ['', Validators.required],
    teamSubtitle: ['', Validators.required],
    teamMembers: this.fb.array([]),
  });

  get teamMembers(): FormArray {
    return this.form.get('teamMembers') as FormArray;
  }

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getAboutPage().subscribe((data) => {
      const defaults = this.firestoreService.getDefaultAboutPage();
      const teamMembers = data?.teamMembers?.length ? data.teamMembers : defaults.teamMembers;
      this.form.patchValue({
        heroTitle: data?.heroTitle ?? defaults.heroTitle,
        heroSubtitle: data?.heroSubtitle ?? defaults.heroSubtitle,
        whoTitle: data?.whoTitle ?? defaults.whoTitle,
        whoParagraph1: data?.whoParagraph1 ?? defaults.whoParagraph1,
        whoParagraph2: data?.whoParagraph2 ?? defaults.whoParagraph2,
        whoParagraph3: data?.whoParagraph3 ?? defaults.whoParagraph3,
        countriesTitle: data?.countriesTitle ?? defaults.countriesTitle,
        countriesSubtitle: data?.countriesSubtitle ?? defaults.countriesSubtitle,
        teamTitle: data?.teamTitle ?? defaults.teamTitle,
        teamSubtitle: data?.teamSubtitle ?? defaults.teamSubtitle,
      });

      this.teamMembers.clear();
      teamMembers.forEach((member) => {
        this.teamMembers.push(
          this.fb.nonNullable.group({
            name: [member.name, Validators.required],
            role: [member.role, Validators.required],
            whatsappUrl: [member.whatsappUrl],
          })
        );
      });
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
      await this.firestoreService.updateAboutPage({
        ...value,
        teamMembers: value.teamMembers as AboutTeamMember[],
      });
      this.message = 'About page updated.';
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Update failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreService,
  HomeSectionItem,
  HomeSectionsContent,
} from '../../../services/firestore.service';
import { FirebaseStorageService } from '../../../services/firebase-storage.service';

type SectionKey = keyof HomeSectionsContent;

type SectionMeta = {
  key: SectionKey;
  label: string;
  icon: string;
};

@Component({
  selector: 'app-edit-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-home.html',
  styleUrl: './edit-home.css',
})
export class EditHome implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);
  private readonly storageService = inject(FirebaseStorageService);

  loading = false;
  message = '';
  editorOpen = false;
  selectedSectionKey: SectionKey = 'hero';
  homeSections: HomeSectionsContent = this.firestoreService.getDefaultHomeSections();
  dataSub: Subscription | null = null;

  readonly sectionMeta: SectionMeta[] = [
    { key: 'hero', label: 'Hero', icon: 'fa-solid fa-house' },
    { key: 'services', label: 'Services Preview', icon: 'fa-solid fa-briefcase' },
    { key: 'countries', label: 'Countries', icon: 'fa-solid fa-earth-asia' },
    { key: 'whyChoose', label: 'Why Choose', icon: 'fa-solid fa-shield-heart' },
    { key: 'howItWorks', label: 'How It Works', icon: 'fa-solid fa-list-check' },
    { key: 'testimonials', label: 'Testimonials', icon: 'fa-solid fa-star' },
    { key: 'finalCta', label: 'Final CTA', icon: 'fa-solid fa-bullhorn' },
  ];

  readonly sectionForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subtitle: [''],
    description: [''],
    itemsText: [''],
    imageUrl: [''],
    secondaryImageUrl: [''],
    primaryButtonText: [''],
    secondaryButtonText: [''],
    trustText: [''],
  });

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getHomeSections().subscribe({
      next: (data) => {
        this.homeSections = {
          ...this.firestoreService.getDefaultHomeSections(),
          ...(data ?? {}),
        } as HomeSectionsContent;
        this.patchEditor(this.homeSections[this.selectedSectionKey]);
      },
      error: (error) => {
        this.homeSections = this.firestoreService.getDefaultHomeSections();
        this.patchEditor(this.homeSections[this.selectedSectionKey]);
        const details = error instanceof Error ? error.message : 'Failed to load from Firestore';
        this.message = `Load failed: ${details}`;
      },
    });
  }

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.dataSub = null;
  }

  openSectionEditor(sectionKey: SectionKey): void {
    this.selectedSectionKey = sectionKey;
    this.editorOpen = true;
    this.message = '';
    this.patchEditor(this.homeSections[sectionKey]);
  }

  closeEditor(): void {
    this.editorOpen = false;
  }

  async saveSection(): Promise<void> {
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }

    const payload = this.mapFormToSection();
    const key = this.selectedSectionKey;

    this.loading = true;
    this.message = '';
    try {
      const nextState: HomeSectionsContent = {
        ...this.homeSections,
        [key]: payload,
      };
      await this.firestoreService.replaceHomeSections(nextState);
      const serverData = await this.firestoreService.getHomeSectionsFromServer();
      this.homeSections = {
        ...this.firestoreService.getDefaultHomeSections(),
        ...serverData,
      } as HomeSectionsContent;
      this.message = `${this.getSectionLabel(key)} section updated.`;
      this.editorOpen = false;
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Update failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async uploadImage(event: Event, slot: 'imageUrl' | 'secondaryImageUrl'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.loading = true;
    this.message = '';
    try {
      const url = await this.storageService.uploadHomeImage(
        file,
        this.selectedSectionKey,
        slot === 'imageUrl' ? 'primary' : 'secondary'
      );
      this.sectionForm.patchValue({ [slot]: url });
      this.message = 'Image uploaded. Save section to apply.';
    } catch (error: unknown) {
      this.message = 'Image upload failed.';
      console.error(error);
    } finally {
      this.loading = false;
      input.value = '';
    }
  }

  getSectionLabel(sectionKey: SectionKey): string {
    return this.sectionMeta.find((item) => item.key === sectionKey)?.label ?? sectionKey;
  }

  private patchEditor(section: HomeSectionItem): void {
    this.sectionForm.patchValue({
      title: section.title ?? '',
      subtitle: section.subtitle ?? '',
      description: section.description ?? '',
      itemsText: (section.items ?? []).join('\n'),
      imageUrl: section.imageUrl ?? '',
      secondaryImageUrl: section.secondaryImageUrl ?? '',
      primaryButtonText: section.primaryButtonText ?? '',
      secondaryButtonText: section.secondaryButtonText ?? '',
      trustText: section.trustText ?? '',
    });
  }

  private mapFormToSection(): HomeSectionItem {
    const formValue = this.sectionForm.getRawValue();
    const payload: HomeSectionItem = {
      title: formValue.title,
      subtitle: formValue.subtitle,
      description: formValue.description,
    };

    const items = formValue.itemsText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      payload.items = items;
    }
    if (formValue.imageUrl.trim()) {
      payload.imageUrl = formValue.imageUrl.trim();
    }
    if (formValue.secondaryImageUrl.trim()) {
      payload.secondaryImageUrl = formValue.secondaryImageUrl.trim();
    }
    if (formValue.primaryButtonText.trim()) {
      payload.primaryButtonText = formValue.primaryButtonText.trim();
    }
    if (formValue.secondaryButtonText.trim()) {
      payload.secondaryButtonText = formValue.secondaryButtonText.trim();
    }
    if (formValue.trustText.trim()) {
      payload.trustText = formValue.trustText.trim();
    }

    return payload;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-edit-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-services.html',
  styleUrl: './edit-services.css',
})
export class EditServices implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreService);

  loading = false;
  message = '';
  dataSub: Subscription | null = null;

  readonly form = this.fb.nonNullable.group({
    heroTitle: ['', Validators.required],
    heroSubtitle: ['', Validators.required],
    gridTitle: ['', Validators.required],
    gridSubtitle: ['', Validators.required],
    card1Title: ['', Validators.required],
    card1Description: ['', Validators.required],
    card2Title: ['', Validators.required],
    card2Description: ['', Validators.required],
    card3Title: ['', Validators.required],
    card3Description: ['', Validators.required],
    card4Title: ['', Validators.required],
    card4Description: ['', Validators.required],
    card5Title: ['', Validators.required],
    card5Description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getServicesPage().subscribe((data) => {
      const page = data ?? this.firestoreService.getDefaultServicesPage();
      const cards = page.cards ?? [];
      this.form.patchValue({
        heroTitle: page.heroTitle,
        heroSubtitle: page.heroSubtitle,
        gridTitle: page.gridTitle,
        gridSubtitle: page.gridSubtitle,
        card1Title: cards[0]?.title ?? '',
        card1Description: cards[0]?.description ?? '',
        card2Title: cards[1]?.title ?? '',
        card2Description: cards[1]?.description ?? '',
        card3Title: cards[2]?.title ?? '',
        card3Description: cards[2]?.description ?? '',
        card4Title: cards[3]?.title ?? '',
        card4Description: cards[3]?.description ?? '',
        card5Title: cards[4]?.title ?? '',
        card5Description: cards[4]?.description ?? '',
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

    const value = this.form.getRawValue();
    this.loading = true;
    this.message = '';
    try {
      const defaults = this.firestoreService.getDefaultServicesPage().cards;
      await this.firestoreService.updateServicesPage({
        heroTitle: value.heroTitle,
        heroSubtitle: value.heroSubtitle,
        gridTitle: value.gridTitle,
        gridSubtitle: value.gridSubtitle,
        cards: [
          { title: value.card1Title, description: value.card1Description, icon: defaults[0].icon },
          { title: value.card2Title, description: value.card2Description, icon: defaults[1].icon },
          { title: value.card3Title, description: value.card3Description, icon: defaults[2].icon },
          { title: value.card4Title, description: value.card4Description, icon: defaults[3].icon },
          { title: value.card5Title, description: value.card5Description, icon: defaults[4].icon },
        ],
      });
      this.message = 'Services updated.';
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.message = `Update failed: ${details}`;
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}

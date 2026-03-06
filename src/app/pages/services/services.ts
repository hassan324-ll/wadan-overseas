import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { CustomSections } from '../../components/custom-sections/custom-sections';
import { CustomSection, FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, CustomSections],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements AfterViewInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);
  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  readonly servicesContent$ = this.firestoreService.getServicesPage().pipe(
    map((data) => data ?? this.firestoreService.getDefaultServicesPage()),
    catchError(() => of(this.firestoreService.getDefaultServicesPage()))
  );
  readonly customSections$ = this.firestoreService.getCustomSections().pipe(
    map((sections) => sections.filter((section) => section.targetPage === 'services')),
    catchError(() => of([] as CustomSection[]))
  );

  ngAfterViewInit(): void {
    // Fail-safe: never keep content hidden if observer timing fails on any device.
    this.revealElementsImmediately();

    this.initializeRevealAnimations();
  }

  ngOnDestroy(): void {
    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }

    if (this.revealFallbackTimer) {
      clearTimeout(this.revealFallbackTimer);
      this.revealFallbackTimer = null;
    }
  }

  private initializeRevealAnimations(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.revealElementsImmediately();
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' }
    );

    const elements = document.querySelectorAll<HTMLElement>('.animate-fade-up, .animate-pop');
    elements.forEach((element) => {
      if (!element.classList.contains('is-visible')) {
        this.revealObserver?.observe(element);
      }
    });

    this.revealFallbackTimer = setTimeout(() => {
      this.revealElementsImmediately();
    }, 1800);
  }

  private revealElementsImmediately(): void {
    const elements = document.querySelectorAll<HTMLElement>('.animate-fade-up, .animate-pop');
    elements.forEach((element) => element.classList.add('is-visible'));
  }

}


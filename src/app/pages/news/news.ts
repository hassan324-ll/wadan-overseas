import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FirestoreService, NewsArticle } from '../../services/firestore.service';

type NewsViewModel = {
  featured: NewsArticle | null;
  secondary: NewsArticle[];
};

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News implements AfterViewInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);

  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  readonly newsVm$ = this.firestoreService.getNewsItems().pipe(
    map((items) => {
      const featured = items[0] ?? null;
      return {
        featured,
        secondary: featured ? items.filter((item) => item !== featured) : [],
      } satisfies NewsViewModel;
    }),
    catchError(() => of({ featured: null, secondary: [] as NewsArticle[] }))
  );

  readonly safeNewsVm$ = this.newsVm$;

  ngAfterViewInit(): void {
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

  formatPublishedDate(publishedAt: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(publishedAt));
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

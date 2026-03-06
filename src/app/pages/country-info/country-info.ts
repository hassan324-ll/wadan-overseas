import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CountryInfoItem, FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-country-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './country-info.html',
  styleUrl: './country-info.css',
})
export class CountryInfo implements OnInit, AfterViewInit, OnDestroy {
  selectedCountry: CountryInfoItem | null = null;
  countrySlug = '';
  routeSub: Subscription | null = null;
  dataSub: Subscription | null = null;
  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  private countryMap: Record<string, CountryInfoItem> = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.dataSub = this.firestoreService.getCountryInfoPage().subscribe({
      next: (data) => {
        const content = data ?? this.firestoreService.getDefaultCountryInfoPage();
        this.countryMap = Object.fromEntries(
          (content.countries ?? []).map((country) => [country.slug, country])
        );
        this.resolveSelectedCountry();
      },
      error: () => {
        const fallback = this.firestoreService.getDefaultCountryInfoPage();
        this.countryMap = Object.fromEntries(
          fallback.countries.map((country) => [country.slug, country])
        );
        this.resolveSelectedCountry();
      },
    });

    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.countrySlug = params.get('slug') ?? '';
      this.resolveSelectedCountry();
    });
  }

  ngAfterViewInit(): void {
    this.revealElementsImmediately();
    this.initializeRevealAnimations();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.routeSub = null;
    this.dataSub?.unsubscribe();
    this.dataSub = null;

    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }

    if (this.revealFallbackTimer) {
      clearTimeout(this.revealFallbackTimer);
      this.revealFallbackTimer = null;
    }
  }

  getHeroBackground(country: CountryInfoItem): string {
    return `linear-gradient(110deg, rgba(8, 27, 66, 0.9) 0%, rgba(8, 27, 66, 0.72) 55%, rgba(8, 27, 66, 0.86) 100%), url('${country.heroImage}')`;
  }

  private resolveSelectedCountry(): void {
    const fallbackMap = Object.fromEntries(
      this.firestoreService
        .getDefaultCountryInfoPage()
        .countries.map((country) => [country.slug, country])
    );
    this.selectedCountry = this.countryMap[this.countrySlug] ?? fallbackMap[this.countrySlug] ?? null;
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

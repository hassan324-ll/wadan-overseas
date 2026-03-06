import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeatureCarousel } from "../../components/feature-carousel/feature-carousel";
import { CustomSections } from '../../components/custom-sections/custom-sections';
import { CustomSection, FirestoreService } from '../../services/firestore.service';
import { map } from 'rxjs/operators';

type Testimonial = {
  name: string;
  profession: string;
  country: string;
  quote: string;
  photo: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FeatureCarousel, CustomSections],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);
  activeTestimonial = 0;
  testimonialTimer: ReturnType<typeof setInterval> | null = null;
  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  readonly homeSections$ = this.firestoreService.getHomeSections().pipe(
    catchError(() => of(this.firestoreService.getDefaultHomeSections()))
  );
  readonly customSections$ = this.firestoreService.getCustomSections().pipe(
    map((sections) => sections.filter((section) => (section.targetPage ?? 'home') === 'home')),
    catchError(() => of([] as CustomSection[]))
  );

  testimonials: Testimonial[] = [
    {
      name: 'Ahmed Khan',
      profession: 'Mechanical Technician',
      country: 'Saudi Arabia',
      quote: 'WADAN guided me from interview to visa approval with total transparency.',
      photo: '/travel.png',
    },
    {
      name: 'Maria Popescu',
      profession: 'Hospitality Supervisor',
      country: 'Romania',
      quote: 'Everything was organized on time and the employer verification gave me confidence.',
      photo: '/sliderimg.avif',
    },
    {
      name: 'Bilal Rehman',
      profession: 'Electrical Foreman',
      country: 'United Arab Emirates',
      quote: 'The process was fast, clear, and supportive at every step of deployment.',
      photo: '/sliderimg2.avif',
    },
  ];

  ngOnInit(): void {
    this.startTestimonialAutoSlide();
  }

  ngAfterViewInit(): void {
    // Fail-safe: never keep content hidden if observer timing fails on any device.
    this.revealElementsImmediately();

    this.initializeRevealAnimations();
  }

  ngOnDestroy(): void {
    if (this.testimonialTimer) {
      clearInterval(this.testimonialTimer);
      this.testimonialTimer = null;
    }

    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }

    if (this.revealFallbackTimer) {
      clearTimeout(this.revealFallbackTimer);
      this.revealFallbackTimer = null;
    }
  }

  prevTestimonial(): void {
    this.activeTestimonial =
      (this.activeTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
    this.restartAutoSlide();
  }

  nextTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
    this.restartAutoSlide();
  }

  goToTestimonial(index: number): void {
    this.activeTestimonial = index;
    this.restartAutoSlide();
  }

  getTestimonialTransform(): string {
    return `translateX(-${this.activeTestimonial * 100}%)`;
  }

  private startTestimonialAutoSlide(): void {
    this.testimonialTimer = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
    }, 4200);
  }

  private restartAutoSlide(): void {
    if (this.testimonialTimer) {
      clearInterval(this.testimonialTimer);
      this.testimonialTimer = null;
    }

    this.startTestimonialAutoSlide();
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

    // Fail-safe: if any observer event is missed, do not keep content hidden.
    this.revealFallbackTimer = setTimeout(() => {
      this.revealElementsImmediately();
    }, 1800);
  }

  private revealElementsImmediately(): void {
    const elements = document.querySelectorAll<HTMLElement>('.animate-fade-up, .animate-pop');
    elements.forEach((element) => element.classList.add('is-visible'));
  }

}

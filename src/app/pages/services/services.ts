import { AfterViewInit, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements AfterViewInit, OnDestroy {
  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
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


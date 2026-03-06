import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type CarouselFeature = {
  id: string;
  title: string;
  subtitle: string;
  bio: string;
  bgImage: string;
};

@Component({
  selector: 'app-feature-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-carousel.html',
  styleUrls: ['./feature-carousel.css'],
})
export class FeatureCarousel implements OnInit, OnDestroy {
  activeIndex = 0;
  trackIndex = 0;
  transitionEnabled = true;
  progressValues: number[] = [];
  progressTimer: ReturnType<typeof setInterval> | null = null;

  features: CarouselFeature[] = [
    {
      id: '1',
      title: 'Your Gateway to Global Careers',
      subtitle: 'Trusted Overseas Employment & Visa Services',
      bio: 'At WADAN Employment Promoters, we connect talented professionals with rewarding international job opportunities. From documentation to visa processing, we ensure a smooth and hassle-free journey toward your dream career abroad.',
      bgImage: './sliderimg.avif',
    },
    {
      id: '2',
      title: 'Work Abroad with Confidence',
      subtitle: 'Reliable Visa Processing & Job Placement',
      bio: 'Our experienced team provides complete guidance for overseas work visas, employer coordination, and legal documentation. We follow transparent and ethical recruitment practices to secure safe and genuine employment opportunities worldwide.',
      bgImage: './sliderimg2.avif',
    },
    {
      id: '3',
      title: 'Building Futures Beyond Borders',
      subtitle: 'End-to-End International Recruitment Solutions',
      bio: 'WADAN Employment Promoters offers comprehensive support for professionals seeking international employment. We handle everything from job matching and visa applications to travel arrangements, ensuring a seamless transition to work abroad.',
      bgImage: '/./sliderimg3.avif',
    },
  ];
  displaySlides: CarouselFeature[] = [];

  getSlideBackground(imagePath: string): string {
    return `linear-gradient(rgba(7, 12, 18, 0.62), rgba(7, 12, 18, 0.62)), url('${imagePath}')`;
  }

  ngOnInit(): void {
    this.displaySlides = [...this.features, this.features[0]];
    this.progressValues = this.features.map(() => 0);
    this.startProgress();
  }

  ngOnDestroy(): void {
    this.clearProgressTimer();
  }

  nextSlide(): void {
    this.trackIndex += 1;
    this.activeIndex = (this.activeIndex + 1) % this.features.length;
    this.progressValues = this.features.map(() => 0);
    this.startProgress();
  }

  onTrackTransitionEnd(): void {
    if (this.trackIndex === this.features.length) {
      this.transitionEnabled = false;
      this.trackIndex = 0;
      this.activeIndex = 0;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.transitionEnabled = true;
        });
      });
    }
  }

  getTrackTransform(): string {
    return `translateX(-${this.trackIndex * 100}%)`;
  }

  private startProgress(): void {
    this.clearProgressTimer();

    const duration = 3000;
    const interval = 30;
    const step = 100 / (duration / interval);

    this.progressTimer = setInterval(() => {
      if (this.progressValues[this.activeIndex] < 100) {
        this.progressValues[this.activeIndex] += step;
      }

      if (this.progressValues[this.activeIndex] >= 100) {
        this.progressValues[this.activeIndex] = 100;
        this.nextSlide();
      }
    }, interval);
  }

  private clearProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }
}

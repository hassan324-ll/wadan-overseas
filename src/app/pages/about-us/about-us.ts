import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FirestoreService, type AboutPageContent, type AboutTeamMember } from '../../services/firestore.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs implements AfterViewInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreService);
  revealObserver: IntersectionObserver | null = null;
  revealFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  readonly aboutContent$ = this.firestoreService
    .getAboutPage()
    .pipe(
      map((content) => this.withTeamPriority(content)),
      catchError(() =>
        of(this.withTeamPriority(this.firestoreService.getDefaultAboutPage()))
      )
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

  private withTeamPriority(content: AboutPageContent): AboutPageContent {
    return {
      ...content,
      teamMembers: this.reorderWithLeadershipPriority(content.teamMembers ?? []),
    };
  }

  private readonly leadershipRoles = ['CEO', 'Manager', 'Marketing Manager'];
  private readonly leadershipRoleSet = new Set(this.leadershipRoles);

  private reorderWithLeadershipPriority(members: AboutTeamMember[]): AboutTeamMember[] {
    if (!members.length) {
      return [];
    }

    const prioritized: AboutTeamMember[] = [];
    for (const role of this.leadershipRoles) {
      prioritized.push(...members.filter((member) => member.role === role));
    }
    const remaining = members.filter((member) => !this.leadershipRoleSet.has(member.role));
    return [...prioritized, ...remaining];
  }

  getPhotoStyle(member: AboutTeamMember): { [key: string]: string } {
    const url = member.photoUrl ?? '/Siddiq.jpeg';
    return {
      'background-image': `url('${url}')`,
    };
  }
}


import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FirestoreService } from '../../services/firestore.service';

type NewsDetailViewModel = {
  article: {
    title: string;
    category: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    ctaLabel: string;
    ctaLink: string;
    publishedAt: string;
  } | null;
  paragraphs: string[];
};

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
})
export class NewsDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly firestoreService = inject(FirestoreService);

  readonly articleVm$ = this.route.paramMap.pipe(
    map((params) => params.get('slug') ?? ''),
    switchMap((slug) =>
      this.firestoreService.getNewsItemBySlug(slug).pipe(
        map((article) => ({
          article,
          paragraphs: this.toParagraphs(article?.content ?? ''),
        }) satisfies NewsDetailViewModel)
      )
    ),
    catchError(() => of({ article: null, paragraphs: [] } satisfies NewsDetailViewModel))
  );

  formatPublishedDate(publishedAt: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(publishedAt));
  }

  private toParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  }
}

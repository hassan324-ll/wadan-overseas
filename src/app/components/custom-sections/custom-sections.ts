import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomSection } from '../../services/firestore.service';

@Component({
  selector: 'app-custom-sections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-sections.html',
  styleUrl: './custom-sections.css',
})
export class CustomSections {
  @Input() sections: CustomSection[] = [];
  @Input() placement: CustomSection['homePlacement'] | null = null;

  get renderedSections(): CustomSection[] {
    if (!this.placement) {
      return this.sections;
    }
    return this.sections.filter((section) => (section.homePlacement ?? 'bottom') === this.placement);
  }

  getGridColumns(section: CustomSection): string {
    const perRow = section.cardsPerRow === 4 ? 4 : 3;
    return `repeat(${perRow}, minmax(0, 1fr))`;
  }
}


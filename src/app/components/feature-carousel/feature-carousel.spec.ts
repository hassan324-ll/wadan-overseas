import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureCarousel } from './feature-carousel';

describe('FeatureCarousel', () => {
  let component: FeatureCarousel;
  let fixture: ComponentFixture<FeatureCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

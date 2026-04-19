import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoriesSection } from './stories-section';

describe('StoriesSection', () => {
  let component: StoriesSection;
  let fixture: ComponentFixture<StoriesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoriesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoriesSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

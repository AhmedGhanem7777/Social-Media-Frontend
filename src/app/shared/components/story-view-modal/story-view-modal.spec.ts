import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryViewModal } from './story-view-modal';

describe('StoryViewModal', () => {
  let component: StoryViewModal;
  let fixture: ComponentFixture<StoryViewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryViewModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryViewModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

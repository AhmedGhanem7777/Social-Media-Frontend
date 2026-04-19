import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostDetailModal } from './post-detail-modal';

describe('PostDetailModal', () => {
  let component: PostDetailModal;
  let fixture: ComponentFixture<PostDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

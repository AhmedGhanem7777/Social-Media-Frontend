import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePostCard } from './create-post-card';

describe('CreatePostCard', () => {
  let component: CreatePostCard;
  let fixture: ComponentFixture<CreatePostCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePostCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePostCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

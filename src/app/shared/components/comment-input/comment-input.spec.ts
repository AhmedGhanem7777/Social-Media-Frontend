import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentInput } from './comment-input';

describe('CommentInput', () => {
  let component: CommentInput;
  let fixture: ComponentFixture<CommentInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

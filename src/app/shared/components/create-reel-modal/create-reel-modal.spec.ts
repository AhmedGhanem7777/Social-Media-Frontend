import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReelModal } from './create-reel-modal';

describe('CreateReelModal', () => {
  let component: CreateReelModal;
  let fixture: ComponentFixture<CreateReelModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReelModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReelModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

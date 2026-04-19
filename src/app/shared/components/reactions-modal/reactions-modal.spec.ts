import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsModal } from './reactions-modal';

describe('ReactionsModal', () => {
  let component: ReactionsModal;
  let fixture: ComponentFixture<ReactionsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

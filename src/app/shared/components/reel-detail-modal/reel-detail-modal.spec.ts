import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelDetailModal } from './reel-detail-modal';

describe('ReelDetailModal', () => {
  let component: ReelDetailModal;
  let fixture: ComponentFixture<ReelDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReelDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReelDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

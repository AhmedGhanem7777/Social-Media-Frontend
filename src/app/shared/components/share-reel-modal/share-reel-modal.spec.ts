import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareReelModal } from './share-reel-modal';

describe('ShareReelModal', () => {
  let component: ShareReelModal;
  let fixture: ComponentFixture<ShareReelModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareReelModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareReelModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

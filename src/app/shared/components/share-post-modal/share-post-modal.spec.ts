import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePostModal } from './share-post-modal';

describe('SharePostModal', () => {
  let component: SharePostModal;
  let fixture: ComponentFixture<SharePostModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharePostModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharePostModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

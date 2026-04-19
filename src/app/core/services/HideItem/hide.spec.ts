import { TestBed } from '@angular/core/testing';

import { Hide } from './hide';

describe('Hide', () => {
  let service: Hide;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hide);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

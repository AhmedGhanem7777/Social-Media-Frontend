import { TestBed } from '@angular/core/testing';

import { Reel } from './reel';

describe('Reel', () => {
  let service: Reel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

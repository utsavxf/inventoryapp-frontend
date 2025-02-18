import { TestBed } from '@angular/core/testing';

import { ShelfpositionService } from './shelfposition.service';

describe('ShelfpositionService', () => {
  let service: ShelfpositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShelfpositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

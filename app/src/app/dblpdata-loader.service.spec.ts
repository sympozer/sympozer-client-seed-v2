/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DBLPDataLoaderService } from './dblpdata-loader.service';

describe('Service: DBLPDataLoader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DBLPDataLoaderService]
    });
  });

  it('should ...', inject([DBLPDataLoaderService], (service: DBLPDataLoaderService) => {
    expect(service).toBeTruthy();
  }));
});

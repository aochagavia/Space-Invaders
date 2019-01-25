import { TestBed } from '@angular/core/testing';

import { SocketHealthService } from './socket-health.service';

describe('SocketHealthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketHealthService = TestBed.get(SocketHealthService);
    expect(service).toBeTruthy();
  });
});

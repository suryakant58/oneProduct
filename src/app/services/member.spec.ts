import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Member } from './member';

describe('Member', () => {
  let service: Member;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Member, provideHttpClient()],
    });
    service = TestBed.inject(Member);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

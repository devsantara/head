import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadAdapter } from '../types';

describe('HeadBuilder', () => {
  it('should create instance with metadataBase and adapter options', () => {
    const mockAdapter: HeadAdapter<string> = {
      transform: (elements) => JSON.stringify(elements),
    };
    const builder = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
      adapter: mockAdapter,
    });
    expect(builder).toBeInstanceOf(HeadBuilder);
  });

  it('should return HeadElement[] from build() without adapter', () => {
    const result = new HeadBuilder().build();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should transform output from build() when adapter provided', () => {
    const mockAdapter: HeadAdapter<{ custom: string }> = {
      transform: () => ({ custom: 'adapted' }),
    };
    const result = new HeadBuilder({ adapter: mockAdapter }).build();
    expect(result).toEqual({ custom: 'adapted' });
  });
});

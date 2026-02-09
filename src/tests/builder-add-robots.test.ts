import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addRobots', () => {
  it('should add robots meta with index/follow booleans', () => {
    const result = new HeadBuilder()
      .addRobots({ index: true, follow: true })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { name: 'robots', content: 'index, follow' },
    });
  });

  it('should add robots meta with noindex/nofollow', () => {
    const result = new HeadBuilder()
      .addRobots({ index: false, follow: false })
      .build();

    expect(result[0].attributes.content).toBe('noindex, nofollow');
  });

  it('should add robots meta with string and numeric directives', () => {
    const result = new HeadBuilder()
      .addRobots({ 'max-snippet': 160, 'max-image-preview': 'large' })
      .build();

    expect(result[0].attributes.content).toBe(
      'max-snippet:160, max-image-preview:large',
    );
  });

  it('should add robots meta with boolean flag directives', () => {
    const result = new HeadBuilder()
      .addRobots({ noarchive: true, noimageindex: true })
      .build();

    expect(result[0].attributes.content).toBe('noarchive, noimageindex');
  });

  it('should add robots meta with mixed directives', () => {
    const result = new HeadBuilder()
      .addRobots({
        index: true,
        follow: true,
        'max-snippet': 160,
        noarchive: true,
      })
      .build();

    expect(result[0].attributes.content).toBe(
      'index, follow, max-snippet:160, noarchive',
    );
  });

  it('should skip undefined values and false boolean flags', () => {
    const result = new HeadBuilder()
      .addRobots({ index: true, follow: undefined, noarchive: false })
      .build();

    expect(result[0].attributes.content).toBe('index');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addRobots({ index: true })).toBe(builder);
  });
});

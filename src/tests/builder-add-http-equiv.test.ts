import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addHttpEquiv', () => {
  it('should add http-equiv meta element', () => {
    const result = new HeadBuilder().addHttpEquiv('refresh', '30').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { httpEquiv: 'refresh', content: '30' },
    });
  });

  it('should add multiple http-equiv meta elements', () => {
    const result = new HeadBuilder()
      .addHttpEquiv('refresh', '30')
      .addHttpEquiv('content-type', 'text/html; charset=UTF-8')
      .build();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { httpEquiv: 'refresh', content: '30' },
    });
    expect(result[1]).toEqual({
      type: 'meta',
      attributes: {
        httpEquiv: 'content-type',
        content: 'text/html; charset=UTF-8',
      },
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addHttpEquiv('x-ua-compatible', 'IE=edge')).toBe(builder);
  });
});

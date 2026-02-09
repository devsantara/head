import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addScript', () => {
  it('should add external script with string URL', () => {
    const result = new HeadBuilder().addScript('/script.js').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'script',
      attributes: { src: '/script.js', type: 'text/javascript' },
    });
  });

  it('should add external script with URL object', () => {
    const result = new HeadBuilder()
      .addScript(new URL('https://devsantara.com/script.js'))
      .build();

    expect(result[0].attributes).toEqual({
      src: 'https://devsantara.com/script.js',
      type: 'text/javascript',
    });
  });

  it('should add inline script with code object', () => {
    const result = new HeadBuilder()
      .addScript({ code: 'console.log("Hello");' })
      .build();

    expect(result[0]).toEqual({
      type: 'script',
      attributes: {
        children: 'console.log("Hello");',
        type: 'text/javascript',
      },
    });
  });

  it('should add script with additional attributes', () => {
    const result = new HeadBuilder()
      .addScript('/script.js', { async: true, defer: false })
      .build();

    expect(result[0].attributes).toHaveProperty('async', true);
    expect(result[0].attributes).toHaveProperty('defer', false);
  });

  it('should add inline script with additional attributes', () => {
    const result = new HeadBuilder()
      .addScript({ code: 'alert("test");' }, { nonce: 'abc123' })
      .build();

    expect(result[0].attributes).toHaveProperty('nonce', 'abc123');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addScript('/script.js')).toBe(builder);
  });
});

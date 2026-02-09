import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addViewport', () => {
  it('should add viewport with width and initialScale', () => {
    const result = new HeadBuilder()
      .addViewport({ width: 'device-width', initialScale: 1 })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    });
  });

  it('should add viewport with numeric width and height', () => {
    const result = new HeadBuilder()
      .addViewport({ width: 320, height: 568 })
      .build();

    expect(result[0].attributes.content).toBe('width=320, height=568');
  });

  it('should add viewport with scale options', () => {
    const result = new HeadBuilder()
      .addViewport({ initialScale: 1, minimumScale: 0.5, maximumScale: 2 })
      .build();

    expect(result[0].attributes.content).toBe(
      'initial-scale=1, minimum-scale=0.5, maximum-scale=2',
    );
  });

  it('should add viewport with userScalable yes/no', () => {
    expect(
      new HeadBuilder().addViewport({ userScalable: true }).build()[0]
        .attributes.content,
    ).toBe('user-scalable=yes');

    expect(
      new HeadBuilder().addViewport({ userScalable: false }).build()[0]
        .attributes.content,
    ).toBe('user-scalable=no');
  });

  it('should add viewport with viewportFit and interactiveWidget', () => {
    const result = new HeadBuilder()
      .addViewport({
        viewportFit: 'cover',
        interactiveWidget: 'resizes-content',
      })
      .build();

    expect(result[0].attributes.content).toBe(
      'viewport-fit=cover, interactive-widget=resizes-content',
    );
  });

  it('should add viewport with all options combined', () => {
    const result = new HeadBuilder()
      .addViewport({
        width: 'device-width',
        height: 'device-height',
        initialScale: 1,
        minimumScale: 0.5,
        maximumScale: 2,
        userScalable: false,
        viewportFit: 'cover',
        interactiveWidget: 'resizes-visual',
      })
      .build();

    expect(result[0].attributes.content).toBe(
      'width=device-width, height=device-height, initial-scale=1, minimum-scale=0.5, maximum-scale=2, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-visual',
    );
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addViewport({ width: 'device-width' })).toBe(builder);
  });
});

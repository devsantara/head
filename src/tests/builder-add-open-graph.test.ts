import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addOpenGraph', () => {
  it('should add basic og properties (title, description, url, locale)', () => {
    const result = new HeadBuilder()
      .addOpenGraph({
        title: 'My Page',
        description: 'Page description',
        url: new URL('https://devsantara.com/page'),
        locale: 'en_US',
      })
      .build();

    expect(result).toHaveLength(4);
    expect(result[0].attributes).toEqual({
      property: 'og:title',
      content: 'My Page',
    });
    expect(result[1].attributes).toEqual({
      property: 'og:description',
      content: 'Page description',
    });
    expect(result[2].attributes).toEqual({
      property: 'og:url',
      content: 'https://devsantara.com/page',
    });
    expect(result[3].attributes).toEqual({
      property: 'og:locale',
      content: 'en_US',
    });
  });

  it('should add og:image with full properties', () => {
    const result = new HeadBuilder()
      .addOpenGraph({
        image: {
          url: new URL('https://devsantara.com/image.jpg'),
          alt: 'Image alt',
          type: 'image/jpeg',
          width: 1200,
          height: 630,
        },
      })
      .build();

    expect(result).toHaveLength(5);
    expect(result[0].attributes).toEqual({
      property: 'og:image',
      content: 'https://devsantara.com/image.jpg',
    });
    expect(result[1].attributes).toEqual({
      property: 'og:image:alt',
      content: 'Image alt',
    });
    expect(result[2].attributes).toEqual({
      property: 'og:image:type',
      content: 'image/jpeg',
    });
    expect(result[3].attributes).toEqual({
      property: 'og:image:width',
      content: '1200',
    });
    expect(result[4].attributes).toEqual({
      property: 'og:image:height',
      content: '630',
    });
  });

  it('should add og:type with properties', () => {
    const result = new HeadBuilder()
      .addOpenGraph({
        type: {
          name: 'article',
          properties: [
            { name: 'article:published_time', content: '2023-01-01' },
            { name: 'article:author', content: 'John Doe' },
          ],
        },
      })
      .build();

    expect(result).toHaveLength(3);
    expect(result[0].attributes).toEqual({
      property: 'og:type',
      content: 'article',
    });
    expect(result[1].attributes).toEqual({
      property: 'article:published_time',
      content: '2023-01-01',
    });
    expect(result[2].attributes).toEqual({
      property: 'article:author',
      content: 'John Doe',
    });
  });

  it('should add og:type without properties', () => {
    const result = new HeadBuilder()
      .addOpenGraph({ type: { name: 'website' } })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0].attributes).toEqual({
      property: 'og:type',
      content: 'website',
    });
  });

  it('should add og with callback using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addOpenGraph((h) => ({
        title: 'My Page',
        url: new URL(h.resolveUrl('/page')),
        image: { url: new URL(h.resolveUrl('/image.jpg')) },
      }))
      .build();

    expect(result[0].attributes).toEqual({
      property: 'og:title',
      content: 'My Page',
    });
    expect(result[1].attributes).toEqual({
      property: 'og:url',
      content: 'https://devsantara.com/page',
    });
    expect(result[2].attributes).toEqual({
      property: 'og:image',
      content: 'https://devsantara.com/image.jpg',
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addOpenGraph({ title: 'Title' })).toBe(builder);
  });
});

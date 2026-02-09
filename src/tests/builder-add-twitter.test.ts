import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addTwitter', () => {
  it('should add basic twitter properties (title, description, site, creator)', () => {
    const result = new HeadBuilder()
      .addTwitter({
        title: 'My Page',
        description: 'Page description',
        site: '@mysite',
        creator: '@creator',
      })
      .build();

    expect(result).toHaveLength(4);
    expect(result[0].attributes).toEqual({
      name: 'twitter:title',
      content: 'My Page',
    });
    expect(result[1].attributes).toEqual({
      name: 'twitter:description',
      content: 'Page description',
    });
    expect(result[2].attributes).toEqual({
      name: 'twitter:site',
      content: '@mysite',
    });
    expect(result[3].attributes).toEqual({
      name: 'twitter:creator',
      content: '@creator',
    });
  });

  it('should add twitter siteId and creatorId', () => {
    const result = new HeadBuilder()
      .addTwitter({ siteId: '123456', creatorId: '789012' })
      .build();

    expect(result[0].attributes).toEqual({
      name: 'twitter:site:id',
      content: '123456',
    });
    expect(result[1].attributes).toEqual({
      name: 'twitter:creator:id',
      content: '789012',
    });
  });

  it('should add twitter:image with alt', () => {
    const result = new HeadBuilder()
      .addTwitter({
        image: {
          url: new URL('https://devsantara.com/image.jpg'),
          alt: 'Image alt',
        },
      })
      .build();

    expect(result).toHaveLength(2);
    expect(result[0].attributes).toEqual({
      name: 'twitter:image',
      content: 'https://devsantara.com/image.jpg',
    });
    expect(result[1].attributes).toEqual({
      name: 'twitter:image:alt',
      content: 'Image alt',
    });
  });

  it('should add twitter:card with player properties', () => {
    const result = new HeadBuilder()
      .addTwitter({
        card: {
          name: 'player',
          properties: [
            {
              name: 'twitter:player',
              content: 'https://devsantara.com/player',
            },
            { name: 'twitter:player:width', content: 1280 },
            { name: 'twitter:player:height', content: 720 },
          ],
        },
      })
      .build();

    expect(result).toHaveLength(4);
    expect(result[0].attributes).toEqual({
      name: 'twitter:card',
      content: 'player',
    });
    expect(result[1].attributes).toEqual({
      name: 'twitter:player',
      content: 'https://devsantara.com/player',
    });
    expect(result[2].attributes).toEqual({
      name: 'twitter:player:width',
      content: '1280',
    });
    expect(result[3].attributes).toEqual({
      name: 'twitter:player:height',
      content: '720',
    });
  });

  it('should add twitter:card without properties', () => {
    const result = new HeadBuilder()
      .addTwitter({ card: { name: 'summary_large_image' } })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0].attributes).toEqual({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
  });

  it('should add twitter with callback using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addTwitter((h) => ({
        title: 'My Page',
        image: { url: h.resolveUrl('/image.jpg') },
      }))
      .build();

    expect(result[0].attributes).toEqual({
      name: 'twitter:title',
      content: 'My Page',
    });
    expect(result[1].attributes).toEqual({
      name: 'twitter:image',
      content: 'https://devsantara.com/image.jpg',
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addTwitter({ title: 'Title' })).toBe(builder);
  });
});

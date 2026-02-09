import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadElement } from '../types';

describe('HeadBuilder URL Resolution', () => {
  const metadataBase = new URL('https://devsantara.com');

  describe('resolveUrl with metadataBase', () => {
    it('should resolve relative paths (/, ./, ., nested)', () => {
      const builder = new HeadBuilder({ metadataBase });

      const tests = [
        { input: '/page', expected: 'https://devsantara.com/page' },
        { input: './', expected: 'https://devsantara.com/' },
        { input: '.', expected: 'https://devsantara.com/' },
        {
          input: '/blog/posts/article',
          expected: 'https://devsantara.com/blog/posts/article',
        },
      ];

      for (const { input, expected } of tests) {
        const result = builder.addCanonical((h) => h.resolveUrl(input)).build();
        expect(result[0].attributes).toEqual({
          rel: 'canonical',
          href: expected,
        });
      }
    });

    it('should preserve query params and hash fragments', () => {
      const result = new HeadBuilder({ metadataBase })
        .addCanonical((h) => h.resolveUrl('/page?param=value#section'))
        .build();

      expect(result[0].attributes).toEqual({
        rel: 'canonical',
        href: 'https://devsantara.com/page?param=value#section',
      });
    });

    it('should respect metadataBase with subdomain and port', () => {
      const customBase = new URL('https://blog.example.com:3000');
      const result = new HeadBuilder({ metadataBase: customBase })
        .addCanonical((h) => h.resolveUrl('/page'))
        .build();

      expect(result[0].attributes).toEqual({
        rel: 'canonical',
        href: 'https://blog.example.com:3000/page',
      });
    });
  });

  describe('resolveUrl with URL object', () => {
    it('should return URL href ignoring metadataBase', () => {
      const result = new HeadBuilder({ metadataBase })
        .addCanonical((h) =>
          h.resolveUrl(new URL('https://other.com:8080/path?q=v#h')),
        )
        .build();

      expect(result[0].attributes).toEqual({
        rel: 'canonical',
        href: 'https://other.com:8080/path?q=v#h',
      });
    });
  });

  describe('resolveUrl without metadataBase', () => {
    it('should return raw string URL as-is', () => {
      const tests = ['/page', './page', 'https://devsantara.com/page'];

      for (const input of tests) {
        const result = new HeadBuilder()
          .addCanonical((h) => h.resolveUrl(input))
          .build();
        expect(result[0].attributes).toEqual({ rel: 'canonical', href: input });
      }
    });
  });

  describe('resolveUrl in different methods', () => {
    it('should work across addOpenGraph, addTwitter, addAlternateLocale, addManifest, addIcon', () => {
      const result = new HeadBuilder({ metadataBase })
        .addOpenGraph((h) => ({
          url: new URL(h.resolveUrl('/page')),
          image: { url: new URL(h.resolveUrl('/og.jpg')) },
        }))
        .addTwitter((h) => ({
          image: { url: new URL(h.resolveUrl('/tw.jpg')) },
        }))
        .addAlternateLocale((h) => ({ 'en-US': h.resolveUrl('/en') }))
        .addManifest((h) => h.resolveUrl('/manifest.json'))
        .addIcon('apple', (h) => ({ href: new URL(h.resolveUrl('/icon.png')) }))
        .build();

      expect(result[0].attributes).toEqual({
        property: 'og:url',
        content: 'https://devsantara.com/page',
      });
      expect(result[1].attributes).toEqual({
        property: 'og:image',
        content: 'https://devsantara.com/og.jpg',
      });
      expect(result[2].attributes).toEqual({
        name: 'twitter:image',
        content: 'https://devsantara.com/tw.jpg',
      });
      expect(result[3].attributes).toEqual({
        rel: 'alternate',
        hrefLang: 'en-US',
        href: 'https://devsantara.com/en',
      });
      expect(result[4].attributes).toEqual({
        rel: 'manifest',
        href: 'https://devsantara.com/manifest.json',
      });
      expect(result[5].attributes).toEqual({
        rel: 'apple-touch-icon',
        href: 'https://devsantara.com/icon.png',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string, protocol-relative URLs, special characters', () => {
      const result = new HeadBuilder<HeadElement<'link'>[]>({
        metadataBase: new URL('https://devsantara.com/path'),
      })
        .addCanonical((h) => h.resolveUrl(''))
        .build();
      expect(result[0].attributes.href).toBe('https://devsantara.com/path');

      const result2 = new HeadBuilder<HeadElement<'link'>[]>()
        .addCanonical((h) => h.resolveUrl('//example.com/page'))
        .build();
      expect(result2[0].attributes.href).toBe('//example.com/page');

      const result3 = new HeadBuilder<HeadElement<'link'>[]>({ metadataBase })
        .addCanonical((h) => h.resolveUrl('/page?name=John Doe'))
        .build();
      expect(result3[0].attributes.href).toBe(
        'https://devsantara.com/page?name=John%20Doe',
      );
    });
  });
});

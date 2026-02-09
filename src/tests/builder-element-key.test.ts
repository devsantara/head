import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder Element Key and Deduplication', () => {
  describe('unique element keys', () => {
    it('should use "title" key - only one title element exists', () => {
      const result = new HeadBuilder()
        .addTitle('First')
        .addTitle('Second')
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({ children: 'Second' });
    });

    it('should use "meta:charSet" key - only one charset exists', () => {
      const result = new HeadBuilder()
        .addCharSet('utf-8')
        .addCharSet('iso-8859-1')
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({ charSet: 'iso-8859-1' });
    });

    it('should use "meta:name:{name}" key - same name deduplicates', () => {
      const result = new HeadBuilder()
        .addMeta({ name: 'description', content: 'First' })
        .addMeta({ name: 'description', content: 'Second' })
        .addMeta({ name: 'keywords', content: 'Unique' })
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].attributes).toEqual({
        name: 'description',
        content: 'Second',
      });
      expect(result[1].attributes).toEqual({
        name: 'keywords',
        content: 'Unique',
      });
    });

    it('should use "meta:property:{property}" key - same property deduplicates', () => {
      const result = new HeadBuilder()
        .addMeta({ property: 'og:title', content: 'First' })
        .addMeta({ property: 'og:title', content: 'Second' })
        .addMeta({ property: 'og:description', content: 'Unique' })
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].attributes).toEqual({
        property: 'og:title',
        content: 'Second',
      });
    });

    it('should use JSON key for meta with property but no content', () => {
      const result = new HeadBuilder()
        .addMeta({ property: 'og:test' })
        .addMeta({ property: 'og:test' })
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({ property: 'og:test' });
    });

    it('should use "link:canonical" key - only one canonical exists', () => {
      const result = new HeadBuilder()
        .addCanonical('https://devsantara.com/first')
        .addCanonical('https://devsantara.com/second')
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({
        rel: 'canonical',
        href: 'https://devsantara.com/second',
      });
    });

    it('should use "link:manifest" key - only one manifest exists', () => {
      const result = new HeadBuilder()
        .addManifest('/first.json')
        .addManifest('/second.json')
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({
        rel: 'manifest',
        href: '/second.json',
      });
    });

    it('should use "link:alternate:{hrefLang}" key - same hrefLang deduplicates', () => {
      const result = new HeadBuilder()
        .addAlternateLocale({ 'en-US': '/en-first', 'fr-FR': '/fr' })
        .addAlternateLocale({ 'en-US': '/en-second' })
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].attributes).toEqual({
        rel: 'alternate',
        hrefLang: 'en-US',
        href: '/en-second',
      });
      expect(result[1].attributes).toEqual({
        rel: 'alternate',
        hrefLang: 'fr-FR',
        href: '/fr',
      });
    });

    it('should use JSON key for non-special elements - identical attributes deduplicate', () => {
      const result = new HeadBuilder()
        .addLink('https://fonts.com', { rel: 'preconnect' })
        .addLink('https://fonts.com', { rel: 'preconnect' })
        .addLink('https://fonts.com', { rel: 'dns-prefetch' })
        .build();

      expect(result).toHaveLength(2);
    });
  });

  describe('cross-method deduplication', () => {
    it('should deduplicate same meta property across methods', () => {
      const result = new HeadBuilder()
        .addOpenGraph({ title: 'OG Title First' })
        .addMeta({ property: 'og:title', content: 'Manual Second' })
        .build();

      expect(result).toHaveLength(1);
      expect(result[0].attributes).toEqual({
        property: 'og:title',
        content: 'Manual Second',
      });
    });

    it('should keep separate keys for name vs property attributes', () => {
      const result = new HeadBuilder()
        .addTwitter({ title: 'Twitter' })
        .addOpenGraph({ title: 'OG' })
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].attributes).toHaveProperty('name', 'twitter:title');
      expect(result[1].attributes).toHaveProperty('property', 'og:title');
    });
  });

  describe('element order preservation', () => {
    it('should preserve insertion order for non-deduplicated elements', () => {
      const result = new HeadBuilder()
        .addMeta({ name: 'author', content: 'John' })
        .addMeta({ name: 'keywords', content: 'test' })
        .addMeta({ name: 'description', content: 'desc' })
        .build();

      expect(result).toHaveLength(3);
      expect(result[0].attributes).toHaveProperty('name', 'author');
      expect(result[1].attributes).toHaveProperty('name', 'keywords');
      expect(result[2].attributes).toHaveProperty('name', 'description');
    });

    it('should move deduplicated element to original position', () => {
      const result = new HeadBuilder()
        .addTitle('First')
        .addMeta({ name: 'description', content: 'Desc' })
        .addTitle('Second')
        .build();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('title');
      expect(result[1].type).toBe('meta');
    });
  });
});

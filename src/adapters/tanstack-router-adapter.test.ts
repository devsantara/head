import { describe, it, expect } from 'vitest';
import { HeadTanstackRouterAdapter } from './tanstack-router-adapter';
import type { HeadElement } from '../types';

describe('HeadTanstackRouterAdapter', () => {
  const adapter = new HeadTanstackRouterAdapter();

  describe('transform', () => {
    it('should return empty arrays when given empty elements', () => {
      const result = adapter.transform([]);
      expect(result).toEqual({
        meta: [],
        links: [],
        scripts: [],
        styles: [],
      });
    });

    it('should transform meta element', () => {
      const elements: HeadElement[] = [
        {
          type: 'meta',
          attributes: { name: 'viewport', content: 'width=device-width' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.meta).toHaveLength(1);
      expect(result.meta?.[0]).toEqual({
        name: 'viewport',
        content: 'width=device-width',
      });
      expect(result.links).toHaveLength(0);
      expect(result.scripts).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
    });

    it('should transform link element', () => {
      const elements: HeadElement[] = [
        {
          type: 'link',
          attributes: { rel: 'icon', href: '/favicon.ico' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.links).toHaveLength(1);
      expect(result.links?.[0]).toEqual({ rel: 'icon', href: '/favicon.ico' });
      expect(result.meta).toHaveLength(0);
      expect(result.scripts).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
    });

    it('should transform script element', () => {
      const elements: HeadElement[] = [
        {
          type: 'script',
          attributes: { src: '/script.js', async: true },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.scripts).toHaveLength(1);
      expect(result.scripts?.[0]).toEqual({ src: '/script.js', async: true });
      expect(result.meta).toHaveLength(0);
      expect(result.links).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
    });

    it('should transform style element', () => {
      const elements: HeadElement[] = [
        {
          type: 'style',
          attributes: { children: 'body { margin: 0; }' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.styles).toHaveLength(1);
      expect(result.styles?.[0]).toEqual({ children: 'body { margin: 0; }' });
      expect(result.meta).toHaveLength(0);
      expect(result.links).toHaveLength(0);
      expect(result.scripts).toHaveLength(0);
    });

    it('should transform title element into meta with title property', () => {
      const elements: HeadElement[] = [
        {
          type: 'title',
          attributes: { children: 'My Page' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.meta).toHaveLength(1);
      expect(result.meta?.[0]).toEqual({ title: 'My Page' });
      expect(result.links).toHaveLength(0);
      expect(result.scripts).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
    });

    it('should transform multiple elements into categorized configuration', () => {
      const elements: HeadElement[] = [
        {
          type: 'title',
          attributes: { children: 'My Page' },
        },
        {
          type: 'meta',
          attributes: { name: 'description', content: 'A description' },
        },
        {
          type: 'meta',
          attributes: { name: 'viewport', content: 'width=device-width' },
        },
        {
          type: 'link',
          attributes: { rel: 'icon', href: '/favicon.ico' },
        },
        {
          type: 'link',
          attributes: { rel: 'stylesheet', href: '/styles.css' },
        },
        {
          type: 'script',
          attributes: { src: '/script.js', async: true },
        },
        {
          type: 'script',
          attributes: { children: 'console.log("Hello World!");', async: true },
        },
        {
          type: 'style',
          attributes: { children: 'body { margin: 0; }' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.meta).toHaveLength(3);
      expect(result.meta?.[0]).toEqual({ title: 'My Page' });
      expect(result.meta?.[1]).toEqual({
        name: 'description',
        content: 'A description',
      });
      expect(result.meta?.[2]).toEqual({
        name: 'viewport',
        content: 'width=device-width',
      });

      expect(result.links).toHaveLength(2);
      expect(result.links?.[0]).toEqual({ rel: 'icon', href: '/favicon.ico' });
      expect(result.links?.[1]).toEqual({
        rel: 'stylesheet',
        href: '/styles.css',
      });

      expect(result.scripts).toHaveLength(2);
      expect(result.scripts?.[0]).toEqual({ src: '/script.js', async: true });
      expect(result.scripts?.[1]).toEqual({
        children: 'console.log("Hello World!");',
        async: true,
      });

      expect(result.styles).toHaveLength(1);
      expect(result.styles?.[0]).toEqual({ children: 'body { margin: 0; }' });
    });

    it('should ignore unknown element types', () => {
      const elements: HeadElement[] = [
        {
          type: 'meta',
          attributes: { name: 'description', content: 'A description' },
        },
        {
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          type: 'base' as any,
          attributes: { href: 'https://example.com' },
        },
        {
          type: 'meta',
          attributes: { name: 'viewport', content: 'width=device-width' },
        },
      ];

      const result = adapter.transform(elements);

      // Only the meta element should be included
      expect(result.meta).toHaveLength(2);
      expect(result.meta?.[0]).toEqual({
        name: 'description',
        content: 'A description',
      });
      expect(result.meta?.[1]).toEqual({
        name: 'viewport',
        content: 'width=device-width',
      });
      expect(result.links).toHaveLength(0);
      expect(result.scripts).toHaveLength(0);
      expect(result.styles).toHaveLength(0);
    });
  });
});

import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { HeadReactAdapter } from './react-adapter';
import type { HeadElement } from '../types';

describe('HeadReactAdapter', () => {
  const adapter = new HeadReactAdapter();

  describe('transform', () => {
    it('should return empty array when given empty elements', () => {
      const result = adapter.transform([]);
      expect(result).toEqual([]);
    });

    it('should transform single elements into React component', () => {
      const elements: HeadElement[] = [
        {
          type: 'meta',
          attributes: { name: 'viewport', content: 'width=device-width' },
        },
      ];

      const result = adapter.transform(elements);

      expect(result.length).toBe(1);
      expect(React.isValidElement(result[0])).toBe(true);
      expect(result[0]).toEqual(
        React.createElement('meta', {
          key: 'head-meta-0',
          name: 'viewport',
          content: 'width=device-width',
        }),
      );
    });

    it('should transform multiple elements into React components', () => {
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
          type: 'link',
          attributes: { rel: 'icon', href: '/favicon.ico' },
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

      expect(result).toHaveLength(elements.length);
      result.forEach((node, index) => {
        expect(React.isValidElement(node)).toBe(true);
        expect(node).toEqual(
          React.createElement(elements[index].type, {
            key: `head-${elements[index].type}-${index}`,
            ...elements[index].attributes,
          }),
        );
      });
    });
  });
});

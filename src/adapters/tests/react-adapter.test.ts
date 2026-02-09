import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { HeadReactAdapter } from '../react-adapter';
import type { HeadElement } from '../../types';

describe('HeadReactAdapter', () => {
  const adapter = new HeadReactAdapter();

  describe('transform', () => {
    it('should returns empty array for empty input', () => {
      expect(adapter.transform([])).toEqual([]);
    });

    it('should converts elements to React components with key pattern "head-{type}-{index}"', () => {
      const elements: HeadElement[] = [
        { type: 'title', attributes: { children: 'My Page' } },
        {
          type: 'meta',
          attributes: { name: 'description', content: 'A description' },
        },
        { type: 'link', attributes: { rel: 'icon', href: '/favicon.ico' } },
        { type: 'script', attributes: { src: '/script.js', async: true } },
        { type: 'style', attributes: { children: 'body { margin: 0; }' } },
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

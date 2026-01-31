import { createElement, type ReactNode } from 'react';
import type { HeadAdapter, HeadElement } from '../types';

export type HeadReactAdapterResult = ReactNode[];

/**
 * Adapter for converting HeadElement[] to React elements
 *
 * This adapter transforms the head elements into React.ReactNode[] that can be
 * rendered inside a React component or used with React-based head management libraries.
 *
 * @example
 * const elements = new HeadBuilder()
 *   .addMeta({ name: 'description', content: 'My site' })
 *   .addLink({ rel: 'canonical', href: 'https://example.com' })
 *   .build();
 *
 * const reactElements = HeadReactAdapter.adapter(elements);
 * // Returns: [<meta name="description" content="My site" />, <link rel="canonical" href="https://example.com" />]
 */
export class HeadReactAdapter implements HeadAdapter<HeadReactAdapterResult> {
  /**
   * Transforms HeadElement[] to React.ReactNode[]
   * @param elements - Array of head elements from HeadBuilder.build()
   * @returns An array of React elements
   */
  static adapter(elements: HeadElement[]): HeadReactAdapterResult {
    return elements.map((element, index) => {
      const { type, attributes } = element;

      return createElement(type, {
        key: `head-${type}-${index}`,
        ...attributes,
      });
    });
  }

  adapter(elements: HeadElement[]): HeadReactAdapterResult {
    return HeadReactAdapter.adapter(elements);
  }
}

import { createElement, type ReactNode } from 'react';
import type { HeadAdapter, HeadElement } from '../types';

type HeadReactAdapterResult = ReactNode[];

/**
 * Adapter that transforms head elements into React components for rendering in React applications.
 */
export class HeadReactAdapter implements HeadAdapter<HeadReactAdapterResult> {
  /**
   * Transforms head elements into React components.
   *
   * @param elements - Array of head elements to transform
   * @returns Array of React components ready for rendering
   */
  transform(elements: HeadElement[]): HeadReactAdapterResult {
    return elements.map((element, index) => {
      const { type, attributes } = element;

      return createElement(type, {
        key: `head-${type}-${index}`,
        ...attributes,
      });
    });
  }
}

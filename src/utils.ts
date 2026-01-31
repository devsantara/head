import type { HeadAttributeTypeMap, HeadElement } from './types';

/**
 * Type guard to check if element is of a specific type
 */
export function isElementOfType<T extends keyof HeadAttributeTypeMap>(
  element: HeadElement,
  type: T,
): element is HeadElement<T> {
  return element.type === type;
}

/**
 * Extracts children property from attributes safely
 */
export function getChildren(
  attributes: HeadAttributeTypeMap[keyof HeadAttributeTypeMap],
): string {
  if ('children' in attributes) {
    // oxlint-disable-next-line typescript/no-base-to-string
    return String(attributes.children);
  }
  return '';
}

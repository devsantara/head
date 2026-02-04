import type { HeadAttributeTypeMap, HeadElement } from './types';

/**
 * Type guard that checks if a head element matches a specific element type.
 *
 * @param element - The head element to check
 * @param type - The expected element type
 * @returns True if the element matches the specified type
 */
export function isElementOfType<T extends keyof HeadAttributeTypeMap>(
  element: HeadElement,
  type: T,
): element is HeadElement<T> {
  return element.type === type;
}

/**
 * Safely extracts the children property from element attributes.
 *
 * @param attributes - The element attributes
 * @returns The children content as a string, or empty string if not present
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

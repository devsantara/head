import { describe, it, expect } from 'vitest';
import { getChildren, isElementOfType } from '../utils';
import type { HeadElement } from '../types';

describe('Utils', () => {
  describe('isElementOfType', () => {
    it('should return false when element type does not match', () => {
      const element: HeadElement<'title'> = {
        type: 'title',
        attributes: { children: 'My Title' },
      };
      const result = isElementOfType(element, 'meta');
      expect(result).toBe(false);
    });

    it('should return true when element type matches', () => {
      const element: HeadElement<'title'> = {
        type: 'title',
        attributes: { children: 'My Title' },
      };
      const result = isElementOfType(element, 'title');
      expect(result).toBe(true);
    });
  });

  describe('getChildren', () => {
    it('should return empty string when children is not present', () => {
      const attributes: HeadElement<'meta'>['attributes'] = {
        name: 'description',
        content: 'A description',
      };
      const result = getChildren(attributes);
      expect(result).toBe('');
    });

    it('should return children as string when present', () => {
      const attributes: HeadElement<'title'>['attributes'] = {
        children: 'My Title',
      };
      const result = getChildren(attributes);
      expect(result).toBe('My Title');
    });

    it('should convert children to string if it is a number', () => {
      const attributes: HeadElement<'title'>['attributes'] = { children: 123 };
      const result = getChildren(attributes);
      expect(result).toBe('123');
    });

    it('should handle boolean children', () => {
      const attributes: HeadElement<'title'>['attributes'] = { children: true };
      const result = getChildren(attributes);
      expect(result).toBe('true');
    });
  });
});

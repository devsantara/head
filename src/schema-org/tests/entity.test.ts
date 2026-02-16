import { describe, it, expect } from 'vitest';
import { Entity } from '../entity';

describe('Entity', () => {
  describe('constructor', () => {
    it('should create entity with properties', () => {
      const entity = new Entity({
        '@type': 'Brand',
        name: 'My Brand',
      });

      expect(entity).toBeInstanceOf(Entity);
    });

    it('should store all provided properties', () => {
      const properties = {
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
        name: 'My Brand',
        url: 'https://devsantara.com',
      };

      const entity = new Entity(properties);
      expect(entity.getProperties()).toEqual(properties);
    });
  });

  describe('getID()', () => {
    it('should return @id when defined', () => {
      const entity = new Entity({
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
      });

      expect(entity.getID()).toBe('https://devsantara.com/#brand');
    });

    it('should return undefined when @id is not defined', () => {
      const entity = new Entity({
        '@type': 'Brand',
        name: 'My Brand',
      });

      expect(entity.getID()).toBeUndefined();
    });
  });

  describe('getProperties()', () => {
    it('should return all properties', () => {
      const properties = {
        '@type': 'Brand',
        '@id': 'https://devsantara.com/#brand',
        name: 'My Brand',
        description: 'A great brand',
      };

      const entity = new Entity(properties);
      expect(entity.getProperties()).toEqual(properties);
    });

    it('should return same reference to properties', () => {
      const properties = {
        '@type': 'Brand',
        name: 'My Brand',
      };

      const entity = new Entity(properties);
      expect(entity.getProperties()).toBe(entity.getProperties());
    });
  });
});

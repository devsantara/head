import type { BaseSchemaOptions } from './types';

/**
 * Represents a single Schema.org entity with its properties.
 * Internal class used to store and manage individual schema entities within the graph.
 *
 * @template TSchema - The schema type extending BaseSchemaOptions
 */
export class Entity<TSchema extends BaseSchemaOptions = BaseSchemaOptions> {
  private properties: TSchema;

  /**
   * Creates a new Entity instance with the specified properties.
   *
   * @param properties - The Schema.org entity properties including `@type` and optional `@id`
   */
  constructor(properties: TSchema) {
    this.properties = properties;
  }

  /**
   * Gets the `@id` of this entity if defined.
   *
   * @returns The entity's `@id` property value or undefined
   */
  getID(): (typeof this.properties)['@id'] {
    return this.getProperties()['@id'];
  }

  /**
   * Gets all properties of this entity.
   *
   * @returns The complete entity properties object
   */
  getProperties() {
    return this.properties;
  }
}

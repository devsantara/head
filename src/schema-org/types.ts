/**
 * Helper object provided to callback functions with utilities for dynamic Schema.org data generation.
 */
export interface Helper {
  /**
   * Resolves a relative or absolute URL into an absolute URL using the configured baseUrl.
   *
   * @param url - The URL to resolve
   * @returns The resolved absolute URL as a string
   */
  resolveUrl: (url: string | URL) => string;
}

/**
 * Base interface for Schema.org entity options.
 * All Schema.org entities must have a `@type`, may have an `@id`, and can include additional properties.
 */
export interface BaseSchemaOptions {
  '@type': string;
  '@id'?: string;
  [key: string]: any;
}

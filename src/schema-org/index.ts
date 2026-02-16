import { Entity } from './entity';
import type { BaseSchemaOptions, Helper } from './types';

/**
 * Builder for constructing Schema.org structured data with type-safe entity relationships.
 * Supports creating single entities or complex graphs with cross-references between entities.
 *
 * **Note:** It is recommended to use types from the `schema-dts` package for well-typed Schema.org properties.
 * Install it with: `npm install schema-dts`
 *
 * @template TSchemaOptions - Union type of all allowed schema entity types from `schema-dts` (e.g., Brand | Product | Organization)
 * @template TKeys - Union of keys currently in the graph (tracked for uniqueness)
 * @template TGraph - Record mapping keys to their Entity instances (typed entities)
 *
 * @example
 * // Single entity with schema-dts types
 * import type { Brand } from 'schema-dts';
 *
 * const schema = new SchemaOrg<Brand>(new URL('https://devsantara.com'))
 *   .add('brand', {
 *     '@type': 'Brand',
 *     name: 'My Brand'
 *   });
 *
 * @example
 * // Multiple entities with references
 * import type { Brand, Product } from 'schema-dts';
 *
 * const schema = new SchemaOrg<Brand | Product>(new URL('https://devsantara.com'))
 *   .add('brand', {
 *     '@type': 'Brand',
 *     '@id': 'https://devsantara.com/#brand',
 *     name: 'My Brand'
 *   })
 *   .add('product', (ref) => ({
 *     '@type': 'Product',
 *     name: 'My Product',
 *     brand: { '@id': ref.brand.getID() }
 *   }));
 */
export class SchemaOrg<
  TSchemaOptions extends BaseSchemaOptions = BaseSchemaOptions,
  TKeys extends string = never,
  TGraph extends Record<string, Entity> = {},
> {
  private baseUrl?: URL;
  private graph: TGraph;

  /**
   * Creates a new SchemaOrg builder instance for constructing Schema.org structured data.
   *
   * @param baseUrl - Optional base URL for resolving relative URLs in schema properties
   *
   * @example
   * const schema = new SchemaOrg(new URL('https://devsantara.com'));
   */
  constructor(baseUrl?: URL) {
    this.baseUrl = baseUrl;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    this.graph = {} as TGraph;
  }

  /**
   * Resolves a relative or absolute URL into an absolute URL using the configured baseUrl.
   *
   * @param url - The URL to resolve
   * @returns The resolved absolute URL as a string
   */
  private resolveUrl(url: string | URL): string {
    // If url is already a URL object, return as string
    if (url instanceof URL) {
      return url.href;
    }

    // If no baseUrl provided, return raw url as is
    if (!this.baseUrl) {
      return url;
    }

    // Resolve relative URL against baseUrl
    const resolved = new URL(url, this.baseUrl);
    return resolved.href;
  }

  /**
   * Adds a new Schema.org entity to the graph with a unique key.
   * Supports both static entity objects and dynamic callback functions with access to previously added entities.
   *
   * @template TSchema - The specific schema type for this entity
   * @template TKey - The unique string key for this entity
   * @param key - Unique identifier for this entity in the graph (must not already exist)
   * @param value - Entity properties object or callback function receiving graph references and helper utilities
   * @returns Updated SchemaOrg instance with the new entity added to the type-safe graph
   * @throws Error if the key already exists in the graph
   *
   * @example
   * // Static entity
   * schema.add('brand', {
   *   '@type': 'Brand',
   *   '@id': 'https://devsantara.com/#brand',
   *   name: 'My Brand'
   * });
   *
   * @example
   * // Dynamic entity with references and URL resolution
   * schema.add('product', (ref, helper) => ({
   *   '@type': 'Product',
   *   '@id': helper.resolveUrl('/product'),
   *   brand: { '@id': ref.brand.getID() }
   * }));
   */
  add<TSchema extends TSchemaOptions, TKey extends string>(
    key: TKey extends TKeys ? never : TKey,
    value: TSchema | ((ref: TGraph, helper: Helper) => TSchema),
  ) {
    if (key in this.graph) {
      throw new Error(`Schema key "${key}" already exists in the graph.`);
    }

    const actualValue =
      typeof value === 'function'
        ? value(this.graph, { resolveUrl: this.resolveUrl.bind(this) })
        : value;

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    this.graph[key] = new Entity<TSchema>(actualValue) as any;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return this as unknown as SchemaOrg<
      TSchemaOptions,
      TKeys | TKey,
      TGraph & Record<TKey, Entity<TSchema>>
    >;
  }

  /**
   * Builds and returns the final Schema.org JSON-LD string representation.
   * Single entities are returned as standalone objects, while multiple entities are wrapped in a `@graph` array.
   *
   * @returns JSON-LD string with `@context` and entity data ready for embedding in script tags
   *
   * @example
   * // Single entity output:
   * // {
   * //   "@context": "https://schema.org",
   * //   "@type": "Brand",
   * //   "name": "My Brand"
   * // }
   *
   * @example
   * // Multiple entities output:
   * // {
   * //   "@context": "https://schema.org",
   * //   "@graph": [
   * //     { "@type": "Brand", "@id": "...", "name": "My Brand" },
   * //     { "@type": "Product", "brand": { "@id": "..." } }
   * //   ]
   * // }
   */
  build(): string {
    /**
     * If there's only one entity in the graph,
     * we can return it directly without the `@graph` wrapper for simplicity.
     */
    if (Object.keys(this.graph).length === 1) {
      return JSON.stringify({
        '@context': 'https://schema.org',
        ...Object.values(this.graph)[0].getProperties(),
      });
    }

    /**
     * If there are multiple entities in the graph,
     * we return the full graph structure with the `@graph` wrapper.
     */
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': Object.values(this.graph).map((entity) =>
        entity.getProperties(),
      ),
    });
  }
}

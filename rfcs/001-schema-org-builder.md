# RFC 001: Schema.org Builder Pattern

**Status:** Draft  
**Author:** Development Team  
**Created:** 2026-02-16  
**Updated:** 2026-02-16

## Summary

A type-safe builder pattern for creating Schema.org structured data with support for entity relationships, URL resolution, and flexible output formats.

## Motivation

Schema.org structured data is essential for SEO and rich search results, but working with it has several challenges:

1. **Type Safety**: Raw JSON-LD lacks compile-time type checking, leading to runtime errors
2. **Entity Relationships**: Managing references between entities (e.g., Product → Brand) is error-prone
3. **URL Management**: Handling relative vs absolute URLs and base URL resolution requires boilerplate
4. **Graph Complexity**: Deciding between single entity output vs `@graph` wrapper is manual
5. **Developer Experience**: Building complex schemas requires repetitive code

## Detailed Design

### Core Components

#### 1. Entity Class

Represents a single Schema.org entity with its properties.

```typescript
class Entity<TSchema extends BaseSchemaOptions = BaseSchemaOptions> {
  private properties: TSchema;

  getID(): string | undefined;
  getProperties(): TSchema;
}
```

**Responsibilities:**

- Store schema properties
- Provide type-safe access to `@id` field
- Expose complete properties for serialization

#### 2. SchemaOrg Class

Main builder class for constructing Schema.org graphs.

```typescript
class SchemaOrg<
  TSchemaOptions extends BaseSchemaOptions,
  TKeys extends string,
  TGraph extends Record<string, Entity>
>
```

**Generic Parameters:**

- `TSchemaOptions`: Union type of allowed schema types (e.g., `Brand | Product`)
- `TKeys`: Accumulated string literal type of registered keys (prevents duplicates)
- `TGraph`: Mapped type of the entity graph for cross-referencing

**Key Methods:**

##### `add<TSchema, TKey>(key, value)`

Adds a new entity to the graph with compile-time duplicate key prevention.

```typescript
// Static value
.add('brand1', {
  '@type': 'Brand',
  name: 'Example'
})

// Dynamic value with graph references
.add('product1', (ref, helper) => ({
  '@type': 'Product',
  brand: { '@id': ref.brand1.getID() },
  url: helper.resolveUrl('/products/1')
}))
```

**Type Safety Features:**

- `TKey extends TKeys ? never : TKey` prevents duplicate keys at compile time
- Return type updates to include new key in `TKeys` union
- Graph type expands to include new entity for future references

##### `build(): string`

Serializes the graph to JSON-LD string.

**Smart Output Logic:**

- Single entity: Outputs without `@graph` wrapper
- Multiple entities: Wraps in `@graph` array

```typescript
// Single entity output
{
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "Example"
}

// Multiple entities output
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Brand", "@id": "#brand1" },
    { "@type": "Product", "brand": { "@id": "#brand1" } }
  ]
}
```

### URL Resolution

The `resolveUrl` helper handles three cases:

1. **URL Object**: Returns `href` directly
2. **No Base URL**: Returns string as-is (useful for external URLs)
3. **Relative URL**: Resolves against base URL using `new URL(url, baseUrl)`

```typescript
private resolveUrl(url: string | URL): string {
  if (url instanceof URL) return url.href;
  if (!this.baseUrl) return url;
  return new URL(url, this.baseUrl).href;
}
```

### Helper Interface

Passed to dynamic value functions:

```typescript
interface Helper {
  resolveUrl: (url: string | URL) => string;
}
```

**Design Rationale:**

- Extensible: Can add more helpers without breaking existing code
- Scoped: Only exposes safe, intentional utilities
- Bound: Helper methods are pre-bound to SchemaOrg instance

## Usage Examples

### Basic Single Entity

```typescript
const schema = new SchemaOrg<Brand>().add('brand', {
  '@type': 'Brand',
  name: 'Example Brand',
});

schema.build();
// Output: { "@context": "https://schema.org", "@type": "Brand", ... }
```

### Entity Relationships

```typescript
const schema = new SchemaOrg<Brand | Product>(new URL('https://example.com'))
  .add('brand', {
    '@type': 'Brand',
    '@id': '/brand',
    name: 'Example Brand',
  })
  .add('product', (ref, helper) => ({
    '@type': 'Product',
    '@id': helper.resolveUrl('/product'),
    name: 'Example Product',
    brand: { '@id': ref.brand.getID() }, // Type-safe reference!
  }));
```

### Complex Graph

```typescript
const schema = new SchemaOrg<Organization | WebSite | WebPage>(
  new URL('https://example.com'),
)
  .add('organization', {
    '@type': 'Organization',
    '@id': '/#organization',
    name: 'Example Corp',
  })
  .add('website', (ref) => ({
    '@type': 'WebSite',
    '@id': '/#website',
    publisher: { '@id': ref.organization.getID() },
  }))
  .add('webpage', (ref, h) => ({
    '@type': 'WebPage',
    '@id': h.resolveUrl('/about'),
    isPartOf: { '@id': ref.website.getID() },
  }));
```

## Implementation Considerations

### Type Safety Trade-offs

**Pros:**

- Compile-time duplicate key detection
- Type-safe entity references
- IntelliSense support for graph navigation

**Cons:**

- Complex generic signatures
- TypeScript inference can struggle with deep nesting
- Learning curve for advanced usage

### Performance

- **Memory**: Entities stored once in `graph` object
- **Build**: Single traversal, no expensive transformations
- **Bundle Size**: Minimal runtime overhead (~200 bytes minified)

### Error Handling

**Current Approach:**

```typescript
if (key in this.graph) {
  throw new Error(`Schema key "${key}" already exists`);
}
```

**Considerations:**

- Runtime check supplements compile-time type checking
- Helpful for JavaScript consumers without TypeScript
- Could add validation for required properties

## Alternatives Considered

### 1. Plain Object Builder

```typescript
const schema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  brand: { '@id': brandId }, // No type safety, manual tracking
};
```

**Rejected because:** No type safety, no relationship management, manual URL handling

### 2. Class-based Entities

```typescript
class Product {
  constructor() {
    this.type = 'Product';
  }
  setBrand(brand: Brand) {
    /* ... */
  }
}
```

**Rejected because:** Verbose, OOP overhead, less flexible for dynamic data

### 3. Schema Factory Functions

```typescript
createProduct({
  brand: createBrand({ name: 'Example' }),
});
```

**Rejected because:** No entity reuse, harder to manage relationships, less composable

## Open Questions

1. **Validation**: Should we validate against Schema.org definitions at build time?
2. **Serialization Options**: Support pretty-printing or minification options?
3. **Default IDs**: Auto-generate `@id` values if not provided?
4. **Mutation**: Should graph be mutable with `update()` or `remove()` methods?
5. **Async Loading**: Support for fetching remote context definitions?

## Migration Path

This is a new feature, no migration needed.

For future versions:

- Keep `Entity` and `SchemaOrg` as public exports
- Consider deprecation warnings if changing API surface
- Provide codemods for breaking changes

## Future Enhancements

1. **Built-in Schemas**: Pre-typed common schemas (Article, Person, etc.)
2. **Validation**: Runtime validation against Schema.org definitions
3. **Serialization Formats**: Support RDFa, Microdata in addition to JSON-LD
4. **DevTools**: Browser extension for visualizing schema graphs
5. **Testing Utilities**: Matchers for asserting schema structure

## References

- [Schema.org Documentation](https://schema.org/)
- [JSON-LD Specification](https://json-ld.org/)
- [schema-dts Type Definitions](https://github.com/google/schema-dts)
- [Google Search Structured Data](https://developers.google.com/search/docs/appearance/structured-data)

## Appendix: Complete Type Signatures

```typescript
interface BaseSchemaOptions {
  '@type': string;
  '@id'?: string;
  [key: string]: any;
}

interface Helper {
  resolveUrl: (url: string | URL) => string;
}

class Entity<TSchema extends BaseSchemaOptions> {
  constructor(properties: TSchema);
  getID(): TSchema['@id'];
  getProperties(): TSchema;
}

class SchemaOrg<
  TSchemaOptions extends BaseSchemaOptions = BaseSchemaOptions,
  TKeys extends string = never,
  TGraph extends Record<string, Entity> = {},
> {
  constructor(baseUrl?: URL);

  add<TSchema extends TSchemaOptions, TKey extends string>(
    key: TKey extends TKeys ? never : TKey,
    value: TSchema | ((ref: TGraph, helper: Helper) => TSchema),
  ): SchemaOrg<
    TSchemaOptions,
    TKeys | TKey,
    TGraph & Record<TKey, Entity<TSchema>>
  >;

  build(): string;
}
```

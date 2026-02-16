# Schema.org Module

**Type-safe Schema.org structured data builder for semantic web markup.**

Build rich structured data with JSON-LD format, full TypeScript support, and comprehensive entity relationship management. Perfect for SEO, search engines, and knowledge graphs.

---

## ✨ Features

### Developer Experience First

- **Type-Safe Entities** – Full TypeScript autocomplete with optional `schema-dts` package integration
- **Fluent Builder API** – Chain methods naturally for readable entity configuration
- **Graph Support** – Build complex entity relationships with cross-references
- **URL Resolution** – Automatically resolve relative URLs using metadata base

### Comprehensive Schema Support

- **Single & Multiple Entities** – Handle both simple standalone schemas and complex graphs
- **Entity References** – Link entities together with `@id` references
- **Dynamic Properties** – Use callback functions for computed properties and entity access
- **JSON-LD Output** – Standards-compliant JSON-LD format ready for script tags

### Framework Integration

- **HeadBuilder Integration** – Seamlessly combine with head metadata via `addSchemaOrg()`
- **Framework Agnostic** – Works with vanilla JavaScript, React, Next.js, or any rendering strategy

## 🚀 Quick Start

### Basic Single Entity

```typescript
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';

const schema = new SchemaOrgBuilder()
  .addEntity('brand', {
    '@type': 'Brand',
    name: 'My Brand',
    logo: 'https://example.com/logo.png',
  })
  .build();
```

```json
// Output (string):
{
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "My Brand",
  "logo": "https://example.com/logo.png"
}
```

### With Type Safety (schema-dts)

Install `schema-dts` for full type safety and IDE autocomplete:

```bash
npm install schema-dts
```

```typescript
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type { Organization } from 'schema-dts';

const schema = new SchemaOrgBuilder<Organization>()
  .addEntity('org', {
    '@type': 'Organization',
    '@id': 'https://example.com/#org',
    name: 'My Organization',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
  })
  .build();
```

### Multiple Entities with References

Create complex entity graphs with relationships:

```typescript
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type { Brand, Product } from 'schema-dts';

const schema = new SchemaOrgBuilder<Brand | Product>()
  .addEntity('brand', {
    '@type': 'Brand',
    '@id': 'https://example.com/#brand',
    name: 'My Brand',
  })
  .addEntity('product', (ref) => ({
    '@type': 'Product',
    '@id': 'https://example.com/products/awesome-widget',
    name: 'Awesome Widget',
    brand: {
      '@id': ref.brand.getID(), // Reference the brand entity
    },
  }))
  .build();
```

```json
// Output (string):
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Brand",
      "@id": "https://example.com/#brand",
      "name": "My Brand"
    },
    {
      "@type": "Product",
      "@id": "https://example.com/products/awesome-widget",
      "name": "Awesome Widget",
      "brand": { "@id": "https://example.com/#brand" }
    }
  ]
}
```

### With URL Resolution

Use metadata base to automatically resolve relative URLs:

```typescript
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type { Organization } from 'schema-dts';

const schema = new SchemaOrgBuilder<Organization>(
  new URL('https://example.com'),
)
  .addEntity('org', (_, helper) => ({
    '@type': 'Organization',
    '@id': helper.resolveUrl('/#org'),
    name: 'My Organization',
    logo: helper.resolveUrl('/images/logo.png'),
    url: helper.resolveUrl('/'),
  }))
  .build();
```

```json
// Output (string):
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#org",
  "name": "My Organization",
  "logo": "https://example.com/images/logo.png",
  "url": "https://example.com/"
}
```

### Integration with HeadBuilder

Use the `addSchemaOrg()` method in HeadBuilder to seamlessly embed Schema.org entities directly in your head metadata. This method automatically wraps your schema in a JSON-LD script tag.

#### Basic Integration

```typescript
import { HeadBuilder } from '@devsantara/head';
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type { Organization } from 'schema-dts';

const schema = new SchemaOrgBuilder<Organization>().addEntity('org', {
  '@type': 'Organization',
  '@id': 'https://example.com/#org',
  name: 'My Organization',
});

const head = new HeadBuilder()
  .addSchemaOrg(schema) // <- Integrate Schema.org structured data>
  .build();
```

#### Output

The `addSchemaOrg()` method automatically generates a JSON-LD script tag:

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://example.com/#org",
    "name": "My Organization"
  }
</script>
```

## 📚 API Reference

### SchemaOrgBuilder

Main class for constructing Schema.org structured data.

#### Constructor

```typescript
constructor(baseUrl?: URL)
```

**Parameters:**

- `baseUrl` (optional) – Base URL for resolving relative URLs in schema properties

**Example:**

```typescript
const schema = new SchemaOrgBuilder(new URL('https://example.com'));
```

#### Methods

| Method                                 | Description                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| `addEntity<TSchema, TKey>(key, value)` | Adds a new entity to the graph with a unique key           |
| `build()`                              | Builds and returns the final JSON-LD string representation |

### addEntity()

Adds a Schema.org entity to the graph.

```typescript
addEntity<TSchema extends BaseSchemaOptions, TKey extends string>(
  key: TKey,
  value: TSchema | ((ref: TGraph, helper: Helper) => TSchema)
): SchemaOrgBuilder
```

**Parameters:**

- `key` – Unique identifier for this entity in the graph (must not already exist)
- `value` – Either:
  - Static entity object with `@type` and optional `@id`
  - Callback function receiving:
    - `ref` – Graph reference object to access previously added entities
    - `helper` – Helper utilities (e.g., `resolveUrl()`)

**Returns:** Updated builder instance for chaining

**Throws:** Error if key already exists in the graph

**Examples:**

```typescript
// Static entity
schema.addEntity('brand', {
  '@type': 'Brand',
  name: 'My Brand',
});

// Callback function
schema.addEntity('product', (ref, helper) => ({
  '@type': 'Product',
  '@id': helper.resolveUrl('/product'),
  brand: {
    '@id': ref.brand.getID(),
  },
}));
```

### build()

Builds and returns the final JSON-LD structured data as a string.

```typescript
build(): string
```

**Returns:**

- Single entity: Standalone JSON-LD object with `@context`
- Multiple entities: JSON-LD graph wrapped in `@graph` array

**Examples:**

```typescript
// Single entity
const single = new SchemaOrgBuilder()
  .addEntity('brand', {
    '@type': 'Brand',
    name: 'My Brand',
  })
  .build();
// {"@context":"https://schema.org","@type":"Brand","name":"My Brand"}

// Multiple entities
const multi = new SchemaOrgBuilder()
  .addEntity('brand', {
    '@type': 'Brand',
    '@id': '#brand',
    name: 'My Brand',
  })
  .addEntity('product', {
    '@type': 'Product',
    name: 'My Product',
  })
  .build();
// {"@context":"https://schema.org","@graph":[...]}
```

## 🔗 Entity References

Access previously added entities to create relationships between them.

### Using Entity References

In callback functions, the `ref` object provides access to all previously added entities:

```typescript
const schema = new SchemaOrgBuilder(new URL('https://example.com'))
  .addEntity('author', {
    '@type': 'Person',
    '@id': '#author',
    name: 'Jane Doe',
  })
  .addEntity('article', (ref) => ({
    '@type': 'Article',
    headline: 'My Blog Post',
    author: {
      '@id': ref.author.getID(), // Get the author's ID
    },
  }))
  .build();
```

### Entity Interface

Entities expose the following interface:

```typescript
interface Entity<TSchema> {
  getID(): TSchema['@id'];
  getProperties(): TSchema;
}
```

**Methods:**

- `getID()` – Returns the entity's `@id` property
- `getProperties()` – Returns all entity properties

## 🔐 Type Safety with schema-dts

For production applications, use `schema-dts` for complete type safety:

```bash
npm install schema-dts
```

```typescript
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type {
  Organization,
  Person,
  LocalBusiness,
  BreadcrumbList,
} from 'schema-dts';

// Union type for all entities in your graph
type MySchema = Organization | Person | LocalBusiness | BreadcrumbList;

const schema = new SchemaOrgBuilder<MySchema>()
  .addEntity('org', {
    '@type': 'Organization',
    name: 'My Company',
    // TypeScript will validate all properties
  })
  .addEntity('person', {
    '@type': 'Person',
    name: 'John Doe',
    // Full intellisense for Person properties
  })
  .build();
```

## 📖 Resources

### Schema.org Documentation

- [Schema.org Official Docs](https://schema.org) – Complete reference for all schema types and properties
- [Structured Data Documentation](https://developers.google.com/search/docs/appearance/structured-data) – Google's guide to structured data

### JSON-LD

- [JSON-LD Spec](https://www.w3.org/TR/json-ld/) – W3C standard for linked data
- [JSON-LD Playground](https://json-ld.org/playground/) – Interactive JSON-LD testing tool

### Type Packages

- [schema-dts](https://github.com/google/schema-dts) – Generated TypeScript definitions for all schema.org types

## 💡 Best Practices

1. **Leverage Type Safety** – Use `schema-dts` for production projects to catch errors early:

   ```typescript
   import type { Product, Offer } from 'schema-dts';
   const schema = new SchemaOrgBuilder<Product | Offer>();
   ```

2. **Validate with Tools** – Test your JSON-LD output with:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org JSON-LD Validator](https://schema.org/docs/jsonldcontext.jsonld)

## 📄 License

Licensed under the [MIT license](../../LICENSE).

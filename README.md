# @devsantara/head

**A lightweight, type-safe HTML `<head>` builder for modern web applications.**

Build SEO-friendly metadata with a fluent API, full TypeScript support, and framework adapters for **React**, **TanStack Router/Start**, and more.

---

> [!WARNING]  
> **Early Development**: This library is in active development (v0.x.x). Expect breaking changes between minor versions until v1.0. We recommend pinning to exact versions in production.

## ✨ Features

### Developer Experience First

- **Fluent Builder API** – Chain methods naturally for readable, maintainable metadata configuration
- **Full TypeScript Support** – Autocomplete, type checking, and inline documentation in your IDE
- **Zero Dependencies** – Lightweight core with optional framework adapters

### Comprehensive Head Management

- **SEO Essentials** – Title, description, canonical URLs, robots directives.
- **Social Media** – Open Graph and Twitter Card meta tags for rich previews.
- **Mobile Optimization** – Viewport configuration, color schemes, PWA icons.
- **Advanced Tags** – Alternates, manifests, stylesheets, scripts, and custom meta tags.
- **Structured Data** – Schema.org JSON-LD support for rich snippets, knowledge graphs, and enhanced SEO.
- **Simplified URL Management** – Most metadata (Open Graph, canonical, alternates) requires absolute URLs. Set `metadataBase` once and use convenient relative paths everywhere.
- **Continuously Expanding** – Actively adding more metadata types based on community feedback.

### Framework Integration

- **React Adapter** – Generate React components directly from your metadata
- **TanStack Router** – First-class support for route-level metadata
- **Framework Agnostic** – Works with vanilla JS, SSR, SSG, or any rendering strategy

## 📦 Installation

```bash
# npm
npm install @devsantara/head

# pnpm
pnpm add @devsantara/head

# yarn
yarn add @devsantara/head

# bun
bun add @devsantara/head
```

> **Note:** Framework adapters are included in the core package. No additional installations needed.

## 🚀 Quick Start

### Basic Usage

```typescript
import { HeadBuilder } from '@devsantara/head';

const head = new HeadBuilder()
  .addTitle('My Awesome Website')
  .addDescription('A comprehensive guide to web development')
  .addStyle('body { margin: 0; padding: 0; }')
  .addViewport({ width: 'device-width', initialScale: 1 })
  .addScript({ code: 'console.log("Hello, world!");' })
  .addScript(new URL('https://devsantara.com/assets/scripts/utils.js'), {
    async: true,
  })
  .build();
```

```typescript
// Output (HeadElement[]):
[
  {
    type: 'title',
    attributes: { children: 'My Awesome Website' },
  },
  {
    type: 'meta',
    attributes: {
      name: 'description',
      content: 'A comprehensive guide to web development',
    },
  },
  {
    type: 'meta',
    attributes: {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  },
  {
    type: 'style',
    attributes: {
      type: 'text/css',
      children: 'body { margin: 0; padding: 0; }',
    },
  },
  {
    type: 'script',
    attributes: {
      type: 'text/javascript',
      children: 'console.log("Hello, world!");',
    },
  },
  {
    type: 'script',
    attributes: {
      type: 'text/javascript',
      src: 'https://devsantara.com/assets/scripts/utils.js',
      async: true,
    },
  },
];
```

### With Metadata Base URL

Use `metadataBase` to automatically resolve relative URLs to absolute URLs:

```typescript
import { HeadBuilder } from '@devsantara/head';

const head = new HeadBuilder({
  metadataBase: new URL('https://devsantara.com'), // <- Add metadata base URL
})
  .addTitle('My Blog Post')
  .addOpenGraph((helper) => ({
    title: 'My Blog Post',
    url: helper.resolveUrl('/blog/my-post'),
    image: {
      url: helper.resolveUrl('/images/og-image.jpg'),
    },
  }))
  .build();
```

```typescript
// Output (HeadElement[]):
[
  {
    type: 'title',
    attributes: { children: 'My Blog Post' },
  },
  {
    type: 'meta',
    attributes: {
      property: 'og:title',
      content: 'My Blog Post',
    },
  },
  {
    type: 'meta',
    attributes: {
      property: 'og:url',
      content: 'https://devsantara.com/blog/my-post',
    },
  },
  {
    type: 'meta',
    attributes: {
      property: 'og:image',
      content: 'https://devsantara.com/images/og-image.jpg',
    },
  },
];
```

### With Templated Title

Set a title template with a default value, then pass page-specific titles as strings. The builder automatically applies the saved template to subsequent title updates:

```typescript
import { HeadBuilder } from '@devsantara/head';

// Create a builder and set title template with default
// The template stays active for all future addTitle() calls
const sharedHead = new HeadBuilder().addTitle({
  template: '%s | My Awesome site', // Store template (%s is the placeholder)
  default: 'Home', // Initial title using template
});
// Output: <title>Home | My Awesome site</title>

// Update title for Posts page
// Pass a string, builder applies the saved template automatically
const postHead = sharedHead.addTitle('Posts').build();
// Output: <title>Posts | My Awesome site</title>

// Update title for About page
// Template is still active from the first addTitle() call
const aboutHead = sharedHead.addTitle('About Us').build();
// Output: <title>About Us | My Awesome site</title>
```

**How it works:**

1. First `addTitle()` with template object stores the template internally
2. Subsequent `addTitle()` calls with strings automatically use the stored template
3. The `%s` placeholder gets replaced with your page title
4. Each title replaces the previous one (deduplication)

### With Element Deduplication

HeadBuilder automatically deduplicates elements—when you add an element matching an existing one, the new one replaces the old:

```typescript
import { HeadBuilder } from '@devsantara/head';

const head = new HeadBuilder()
  .addTitle('My Site')
  .addTitle('Updated Title') // Replaces previous title

  .addDescription('First description')
  .addDescription('Updated description') // Replaces previous

  .addMeta({ name: 'keywords', content: 'web, development' })
  .addMeta({ name: 'author', content: 'John Doe' }) // Separate meta tags coexist

  .addCanonical('https://devsantara.com/page1')
  .addCanonical('https://devsantara.com/page2') // Replaces previous canonical

  .build();
```

```typescript
// Output (HeadElement[]):
[
  { type: 'title', attributes: { children: 'Updated Title' } },
  {
    type: 'meta',
    attributes: { name: 'description', content: 'Updated description' },
  },
  {
    type: 'meta',
    attributes: { name: 'keywords', content: 'web, development' },
  },
  { type: 'meta', attributes: { name: 'author', content: 'John Doe' } },
  {
    type: 'link',
    attributes: { rel: 'canonical', href: 'https://devsantara.com/page2' },
  },
];
```

**How it works:**

- **Title**: Only one per document
- **Meta by name**: One per unique `name` attribute (e.g., description, keywords)
- **Meta by property**: One per unique `property` attribute (e.g., `og:title`, `og:description`)
- **Charset**: Only one per document
- **Canonical**: Only one per document
- **Manifest**: Only one per document
- **Alternate locales**: One per unique language code
- **Other tags**: Deduplicated by exact attribute match

This ensures clean metadata without accidental duplicates.

### With React Adapter

```tsx
import { HeadBuilder } from '@devsantara/head';
import { HeadReactAdapter } from '@devsantara/head/adapters';

const head = new HeadBuilder({
  adapter: new HeadReactAdapter(), // <- Add React adapter
})
  .addTitle('My Awesome Website')
  .addDescription('A comprehensive guide to web development')
  .build();

// Use in your document
export function Document() {
  return (
    <html>
      <head>{head}</head>
      {/* ... */}
    </html>
  );
}
```

```typescript
// Output (React.ReactNode[]):
[
  <title>My Awesome Website</title>,
  <meta
    name="description"
    content="A comprehensive guide to web development"
  />,
];
```

### With TanStack Router/Start Adapter

```tsx
import { HeadBuilder } from '@devsantara/head';
import { HeadTanstackRouterAdapter } from '@devsantara/head/adapters';
import { createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => {
    return new HeadBuilder({
      adapter: new HeadTanstackRouterAdapter(), // <- Add Tanstack router adapter
    })
      .addTitle('About Us')
      .addDescription('Learn more about our company')
      .build();
  },
});
```

```typescript
// Output (Tanstack Router Head[]):
[
  meta: [
    { title: 'About Us' },
    {
      name: 'description',
      content: 'Learn more about our company',
    },
  ],
  links:[],
  scripts:[],
  styles: []
]
```

## 🌐 Schema.org Structured Data

Add rich structured data with [Schema.org](https://schema.org) JSON-LD support for enhanced search engine understanding and knowledge graphs.

### Quick Start

```typescript
import { HeadBuilder } from '@devsantara/head';
import { SchemaOrgBuilder } from '@devsantara/head/schema-org';
import type { Organization } from 'schema-dts';

const schema = new SchemaOrgBuilder<Organization>().addEntity('org', {
  '@type': 'Organization',
  name: 'My Company',
  url: 'https://devsantara.com',
});

const head = new HeadBuilder()
  .addTitle('Welcome')
  .addDescription('Visit our site')
  .addSchemaOrg(schema)
  .build();
```

### Features

- **Type-Safe Entities** – Full TypeScript support with `schema-dts` package
- **Multiple Entities** – Build complex entity graphs with relationships
- **Entity References** – Link entities together with `@id` cross-references
- **URL Resolution** – Automatically resolve relative URLs with metadata base
- **JSON-LD Output** – Standards-compliant format ready for search engines

### Learn More

For comprehensive documentation, examples, and best practices, see the [Schema.org Module Documentation](./src/schema-org/README.md).

## 📚 API Reference

### Core Methods

| Method    | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `build()` | Builds and returns the final head elements (or adapted output) |

### Basic Elements

For advanced use cases not covered by the essential methods below, use these basic methods to add any custom element directly.

| Method                                                                 | Description                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `addTitle(title: string \| TitleOptions)`                              | Adds a `<title>` element with optional templating                                           |
| `addMeta(attributes: HeadAttributeTypeMap['meta'])`                    | Adds a `<meta>` element with custom attributes                                              |
| `addLink(href: string \| URL, attributes?)`                            | Adds a `<link>` element with a URL and custom attributes                                    |
| `addScript(srcOrCode: string \| URL \| { code: string }, attributes?)` | Adds a `<script>` element (external file with string/URL or inline with `{ code: string }`) |
| `addStyle(css: string, attributes?)`                                   | Adds a `<style>` element with inline CSS                                                    |

### Essential Methods

High-level convenience methods for common metadata patterns. These methods handle the complexity of creating properly structured head.

| Method                                                                         | Description                                                 |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `addDescription(description: string)`                                          | Adds a meta description tag                                 |
| `addCanonical(valueOrFn: BuilderOption<string \| URL>)`                        | Adds a canonical URL link                                   |
| `addRobots(options: RobotsOptions)`                                            | Adds robots meta tag for search engine directives           |
| `addCharSet(charset: CharSet)`                                                 | Adds character encoding declaration                         |
| `addViewport(options: ViewportOptions)`                                        | Adds viewport configuration for responsive design           |
| `addColorScheme(colorScheme: ColorScheme)`                                     | Adds color scheme preference (light/dark mode)              |
| `addOpenGraph(valueOrFn: BuilderOption<OpenGraphOptions>)`                     | Adds Open Graph meta tags for social media previews         |
| `addTwitter(valueOrFn: BuilderOption<TwitterOptions>)`                         | Adds Twitter Card meta tags                                 |
| `addIcon(preset: IconPreset, valueOrFn: BuilderOption<IconOptions>)`           | Adds favicon or app icons (favicon, apple-touch-icon, etc.) |
| `addStylesheet(href: string \| URL, options?: StylesheetOptions)`              | Adds an external stylesheet link                            |
| `addManifest(valueOrFn: BuilderOption<string \| URL>)`                         | Adds a web app manifest link                                |
| `addAlternateLocale(valueOrFn: BuilderOption<AlternateLocaleOptions>)`         | Adds alternate language/locale links                        |
| `addSchemaOrg(valueOrFn: SchemaOrgBuilder \| BuilderOption<SchemaOrgBuilder>)` | Adds Schema.org structured data as JSON-LD                  |

> **💡 Tip:** Most methods support either direct values or callback functions that receive a helper object with `resolveUrl()` for dynamic URL resolution.

## 🔌 Adapters

Adapters transform the raw `HeadElement[]` output into framework-specific formats. The library includes built-in adapters for popular frameworks, and you can create custom adapters for your specific needs.

### Built-in Adapters

| Framework             | Adapter                     | Output Type                   |
| --------------------- | --------------------------- | ----------------------------- |
| React                 | `HeadReactAdapter`          | `React.ReactNode[]`           |
| Tanstack Router/Start | `HeadTanstackRouterAdapter` | TanStack Router `Head` object |

### Creating Custom Adapters

You can create your own adapter by implementing the `HeadAdapter<T>` interface:

```typescript
import type { HeadAdapter, HeadElement } from '@devsantara/head';

// Create a custom adapter that outputs HTML strings
class HeadHTMLAdapter implements HeadAdapter<string> {
  transform(elements: HeadElement[]): string {
    return elements
      .map((element) => {
        const { type, attributes } = element;
        const attrs = Object.entries(attributes)
          .filter(([key]) => key !== 'children')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const children = attributes.children || '';

        if (type === 'meta' || type === 'link') {
          return `<${type} ${attrs}>`;
        }

        return `<${type} ${attrs}>${children}</${type}>`;
      })
      .join('\n');
  }
}
```

```typescript
// Use your custom adapter
const html = new HeadBuilder({
  adapter: new HeadHTMLAdapter(), // <- Add custom HTML adapter
})
  .addTitle('My Site')
  .addDescription('My description')
  .build();
```

```html
<!-- Output (HTML string) -->
<title>My Site</title>
<meta name="description" content="My description" />
```

### Adapter Interface

```typescript
interface HeadAdapter<T> {
  transform(elements: HeadElement[]): T;
}
```

**Parameters:**

- `elements` - Array of head elements with `type` and `attributes`

**Returns:**

- `T` - Your custom output format (string, object, framework components, etc.)

## 📄 License

Licensed under the [MIT license](./LICENSE).

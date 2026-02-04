# @devsantara-labs/head

A type-safe HTML head builder library for managing document head metadata with full TypeScript support.

> **⚠️ Note**: This library is currently under active development and may receive breaking changes. The API is subject to change as we continue to improve and expand functionality.

## Features

- 🔒 **Type-Safe**: Full TypeScript support with React HTML attribute types
- 🔗 **Fluent API**: Chainable builder pattern for intuitive metadata construction
- 🧩 **Adapter System**: Extensible architecture for different frameworks (e.g, React, TanStack Router)
- 🛠️ **Custom Adapters**: Create your own adapters to transform output for any framework

## Installation

```bash
# npm
npm install @devsantara-labs/head

# pnpm
pnpm add @devsantara-labs/head

# yarn
yarn add @devsantara-labs/head
```

## Quick Start

```typescript
import { HeadBuilder } from '@devsantara-labs/head';

const head = new HeadBuilder()
  .addTitle('My Website')
  .addCharSet('utf-8')
  .addDescription('A type-safe HTML head builder library')
  .addViewport({ width: 'device-width', initialScale: 1 })
  .addLink({ rel: 'stylesheet', href: '/styles.css' })
  .build();
```

Returns an array of HeadElement objects

```typescript
// console.log(head);
[
  { type: 'title', attributes: { children: 'My Website' } },
  { type: 'meta', attributes: { charSet: 'utf-8' } },
  {
    type: 'meta',
    attributes: {
      name: 'description',
      content: 'A type-safe HTML head builder library',
    },
  },
  {
    type: 'meta',
    attributes: {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  },
  { type: 'link', attributes: { rel: 'stylesheet', href: '/styles.css' } },
];
```

## Usage Examples

### Adding Meta Elements

```typescript
const head = new HeadBuilder()
  .addTitle('My Website')
  .addCharSet('utf-8')
  .addViewport({ width: 'device-width', initialScale: 1 })
  .addMeta({ name: 'description', content: 'A type-safe head builder' })
  .build();
```

### Adding Link Elements

```typescript
const head = new HeadBuilder()
  .addLink({ rel: 'stylesheet', href: '/styles.css' })
  .addIcon('icon', { href: '/favicon.ico' })
  .addCanonical('https://devsantara.com')
  .build();
```

### Adding Script Elements

```typescript
const head = new HeadBuilder()
  .addScript({ src: '/script.js', async: true })
  .addScript({ children: 'console.log("Hello, World!");' })
  .build();
```

### Adding Style Elements

```typescript
const head = new HeadBuilder()
  .addStyle({ children: 'body { margin: 0; padding: 0; }' })
  .build();
```

### Complete Example

```typescript
import { HeadBuilder } from '@devsantara-labs/head';
import { HeadReactAdapter } from '@devsantara-labs/head/adapters';

const head = new HeadBuilder({
  metadataBase: new URL('https://devsantara.com'),
  adapter: new HeadReactAdapter(),
})
  .addTitle('My Website')
  .addCharSet('utf-8')
  .addViewport({ width: 'device-width', initialScale: 1 })
  .addLink({ rel: 'stylesheet', href: '/styles.css' })
  .addIcon('icon', { href: '/favicon.ico' })
  .addScript({ src: '/analytics.js', async: true })
  .addStyle({ children: 'body { font-family: system-ui; }' })
  .build();
```

### Using Builder Helper Callback Functions

Some methods like `addCanonical()`, `addOpenGraph()`, and `addTwitter()` accept either a direct value or a callback function that receives a helper object. This helper provides utilities like `resolveUrl()` to construct absolute URLs using the `metadataBase`:

```typescript
import { HeadBuilder } from '@devsantara-labs/head';

const head = new HeadBuilder({
  metadataBase: new URL('https://devsantara.com'),
})
  .addCanonical((helper) => helper.resolveUrl('/page'))
  .addOpenGraph((helper) => ({
    title: 'My Page Title',
    url: helper.resolveUrl('/page'), // Resolves to 'https://devsantara.com/page'
    image: {
      url: helper.resolveUrl('/images/og-image.jpg'),
      alt: 'Image description',
    },
  }))
  .addTwitter((helper) => ({
    title: 'My Page Title',
    image: {
      url: helper.resolveUrl('/images/twitter-card.jpg'),
      alt: 'Image description',
    },
    card: { name: 'summary_large_image' },
  }))
  .build();
```

## Framework Adapters

### React Adapter

Converts head elements to React elements for rendering.

```typescript
import { HeadBuilder } from '@devsantara-labs/head';
import { HeadReactAdapter } from '@devsantara-labs/head/adapters';

const head = new HeadBuilder({ adapter: new HeadReactAdapter() })
  .addTitle('My Website')
  .addCharSet('utf-8')
  .addViewport({ width: 'device-width', initialScale: 1 })
  .addIcon('icon', { href: '/favicon.ico' })
  .build();

// Use in React component
function App() {
  return (
    <>
      <head>{head}</head>
      <body>...</body>
    </>
  );
}
```

**Output Type**: `ReactNode[]`

### TanStack Router Adapter

Converts head elements to TanStack Router head configuration format.

```typescript
import { HeadBuilder } from '@devsantara-labs/head';
import { HeadTanstackRouterAdapter } from '@devsantara-labs/head/adapters';

const head = new HeadBuilder({ adapter: new HeadTanstackRouterAdapter() })
  .addCharSet('utf-8')
  .addLink({ rel: 'stylesheet', href: '/styles.css' })
  .addScript({ src: '/script.js' })
  .build();

// Use in TanStack Router route
export const Route = createRootRoute({
  head: () => head,
});
```

**Output Type**: Object with categorized elements (compatible with TanStack Router head configuration):

```typescript
{
  meta?: HeadMetaAttributes[];
  link?: HeadLinkAttributes[];
  script?: HeadScriptAttributes[];
  style?: HeadStyleAttributes[];
}
```

### Creating Custom Adapters

You can create your own adapter by implementing the `HeadAdapter<T>` interface. This allows you to transform the head elements into any format required by your framework or use case.

#### HeadAdapter Interface

```typescript
import type { HeadAdapter, HeadElement } from '@devsantara-labs/head';

export interface HeadAdapter<T> {
  transform(elements: HeadElement[]): T;
}
```

The `HeadElement` type represents a single head element:

```typescript
type HeadElement = {
  type: 'meta' | 'link' | 'script' | 'style' | 'title';
  attributes:
    | HeadMetaAttributes
    | HeadLinkAttributes
    | HeadScriptAttributes
    | HeadStyleAttributes
    | HeadTitleAttributes;
};
```

#### Example: Creating a Custom Adapter

Here's an example of creating a custom adapter that transforms head elements into plain HTML strings:

```typescript
import type { HeadAdapter, HeadElement } from '@devsantara-labs/head';
import { HeadBuilder } from '@devsantara-labs/head';

// Define your output type
type HtmlStringOutput = string;

// Implement the HeadAdapter interface
class HeadHtmlStringAdapter implements HeadAdapter<HtmlStringOutput> {
  transform(elements: HeadElement[]): HtmlStringOutput {
    return elements
      .map((element) => {
        const { type, attributes } = element;
        const attrs = Object.entries(attributes)
          .filter(([key]) => key !== 'children')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const children = (attributes as { children?: string }).children || '';

        return `<${type} ${attrs}>${children}</${type}>`;
      })
      .join('\n');
  }
}

// Use your custom adapter
const head = new HeadBuilder({ adapter: new HeadHtmlStringAdapter() })
  .addTitle('My Awesome Site')
  .addCharSet('utf-8')
  .addDescription('My awesome site')
  .addLink({ rel: 'stylesheet', href: '/styles.css' })
  .build();

console.log(head);
// Output:
// <title>My Awesome Site</title>
// <meta charSet="utf-8" />
// <meta name="description" content="My awesome site" />
// <link rel="stylesheet" href="/styles.css" />
```

## API Reference

### HeadBuilder

The main class for building head elements.

#### Constructor

```typescript
new HeadBuilder(options?: {
  metadataBase?: URL;
  adapter?: HeadAdapter<TOutput>;
})
```

| Option         | Type                   | Description                                      |
| -------------- | ---------------------- | ------------------------------------------------ |
| `metadataBase` | `URL`                  | Base URL for resolving relative URLs in metadata |
| `adapter`      | `HeadAdapter<TOutput>` | Optional adapter to transform build output       |

#### Methods

| Method                 | Parameters                                                  | Returns   | Description                                                   |
| ---------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| `addTitle()`           | `title: string`                                             | `this`    | Adds a `<title>` element                                      |
| `addMeta()`            | `attributes: HeadMetaAttributes`                            | `this`    | Adds a `<meta>` element                                       |
| `addLink()`            | `attributes: HeadLinkAttributes`                            | `this`    | Adds a `<link>` element                                       |
| `addScript()`          | `attributes: HeadScriptAttributes`                          | `this`    | Adds a `<script>` element                                     |
| `addStyle()`           | `attributes: HeadStyleAttributes`                           | `this`    | Adds a `<style>` element                                      |
| `addCharSet()`         | `charSet: CharSet`                                          | `this`    | Adds a character encoding declaration                         |
| `addColorScheme()`     | `colorScheme: ColorScheme`                                  | `this`    | Adds a color scheme preference declaration                    |
| `addDescription()`     | `description: string`                                       | `this`    | Adds a description meta tag                                   |
| `addCanonical()`       | `valueOrFn: BuilderOption<string \| URL>`                   | `this`    | Adds a canonical link for SEO                                 |
| `addViewport()`        | `options: ViewportOptions`                                  | `this`    | Adds a viewport meta tag for responsive design                |
| `addRobots()`          | `options: RobotsOptions`                                    | `this`    | Adds a robots meta tag for search engine control              |
| `addOpenGraph()`       | `valueOrFn: BuilderOption<OpenGraphOptions>`                | `this`    | Adds OpenGraph meta tags for social media previews            |
| `addTwitter()`         | `valueOrFn: BuilderOption<TwitterOptions>`                  | `this`    | Adds Twitter Card meta tags for Twitter previews              |
| `addAlternateLocale()` | `valueOrFn: BuilderOption<AlternateLocaleOptions<TLocale>>` | `this`    | Adds alternate language/locale links for internationalization |
| `addManifest()`        | `valueOrFn: BuilderOption<string \| URL>`                   | `this`    | Adds a web app manifest link for Progressive Web Apps         |
| `addIcon()`            | `preset: IconPreset, valueOrFn: BuilderOption<IconOptions>` | `this`    | Adds an icon link with preset rel values (icon, apple, etc.)  |
| `build()`              | -                                                           | `TOutput` | Returns the final output (adapted if adapter provided)        |

### HeadAdapter

Interface for creating custom adapters that transform head elements into framework-specific formats.

#### Interface Definition

```typescript
interface HeadAdapter<T> {
  transform(elements: HeadElement[]): T;
}
```

| Type Parameter | Description                             |
| -------------- | --------------------------------------- |
| `T`            | The output type returned by the adapter |

#### Method

| Method        | Parameters                | Returns | Description                                               |
| ------------- | ------------------------- | ------- | --------------------------------------------------------- |
| `transform()` | `elements: HeadElement[]` | `T`     | Transforms an array of head elements to the target format |

#### Types

**HeadElement**

```typescript
type HeadElement = {
  type: 'meta' | 'link' | 'script' | 'style';
  attributes:
    | HeadMetaAttributes
    | HeadLinkAttributes
    | HeadScriptAttributes
    | HeadStyleAttributes;
};
```

**Attribute Types**

All attribute types are based on React's `DetailedHTMLProps` for their respective HTML elements:

- `HeadMetaAttributes` - Attributes for `<meta>` elements
- `HeadLinkAttributes` - Attributes for `<link>` elements
- `HeadScriptAttributes` - Attributes for `<script>` elements
- `HeadStyleAttributes` - Attributes for `<style>` elements
- `HeadTitleAttributes` - Attributes for `<title>` elements
- `CharSet` - Character encoding type with autocomplete for common charsets and accepts any string value
- `ColorScheme` - Color scheme preference type with autocomplete for 'light', 'dark', 'light dark', and other combinations
- `ViewportOptions` - Configuration options for viewport meta tag (width, height, initialScale, etc.)
- `RobotsOptions` - Robots meta tag configuration with `index` and `follow` boolean properties, plus support for custom directives as boolean (e.g., `noarchive: true`), string values (e.g., `'max-image-preview': 'large'`), or number values (e.g., `'max-snippet': 160`)
- `OpenGraphOptions` - OpenGraph metadata configuration for social media previews with support for title, description, url, locale, image, and type-specific properties
- `TwitterOptions` - Twitter Card metadata configuration for Twitter previews with support for title, description, site, creator, image, and card-specific properties (summary, summary_large_image, player, app)
- `AlternateLocaleOptions<TLocale>` - A record mapping language codes (type `AlternateLocaleKey<TLocale>`) to URLs for specifying alternate language/locale versions of the page. Supports 'x-default', specific locale strings, or any custom string

## Notes

### Type Safety

This library leverages React's built-in HTML attribute types (`DetailedHTMLProps`) to provide comprehensive type safety for all HTML head elements. This ensures you only use valid attributes for each element type and helps catch errors at compile time.

### Metadata Base URL

The `metadataBase` option allows you to configure a base URL for resolving relative URLs in your metadata. This is useful for ensuring canonical URLs and other metadata references are absolute.

## References

- [MDN: `<title>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title)
- [MDN: `<meta>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
- [MDN: `<link>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link)
- [MDN: `<script>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)
- [MDN: `<style>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style)

## License

Licensed under the [MIT license](./LICENSE).

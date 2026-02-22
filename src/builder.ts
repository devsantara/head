import type {
  AlternateLocaleOptions,
  CharSet,
  ColorScheme,
  HeadAdapter,
  HeadAttributeTypeMap,
  HeadElement,
  HttpEquiv,
  IconOptions,
  IconPreset,
  OpenGraphOptions,
  RobotsOptions,
  StylesheetOptions,
  TitleOptions,
  TwitterOptions,
  ViewportOptions,
} from './types';

import { SchemaOrgBuilder } from './schema-org';

/**
 * Helper object provided to callback functions with utilities for dynamic metadata generation.
 */
interface BuilderHelper {
  /**
   * Resolves a relative or absolute URL into an absolute URL using the configured metadataBase.
   *
   * @param url - The URL to resolve
   * @returns The resolved absolute URL as a string
   */
  resolveUrl: (url: string | URL) => string;
}

/**
 * Generic type for builder method options that can accept either a value or a function
 */
type BuilderOption<T> = T | ((helper: BuilderHelper) => T);

export class HeadBuilder<TOutput = HeadElement[]> {
  /**
   * Optional base URL for resolving relative URLs in metadata (Open Graph, canonical, etc.)
   */
  private metadataBase?: URL;
  /**
   * Optional adapter to transform the built head elements into a framework-specific format.
   * If not provided, `build()` returns `HeadElement[]`
   */
  private adapter?: HeadAdapter<TOutput>;
  /**
   * Internal storage for title options to support templated titles.
   * This allows the builder to generate the title dynamically based on previously set options.
   */
  private titleOptions?: TitleOptions;
  /**
   * Internal collection of head elements being built,
   * stored in a Map for deduplication based on element type and key attributes.
   */
  private elementsMap = new Map<string, HeadElement>();

  /**
   * Resolves a value that can be either static or a callback function receiving helper utilities.
   *
   * @param valueOrFn - Static value or function that returns the value
   * @returns The resolved value
   */
  private parseValueOrFn<T>(valueOrFn: BuilderOption<T>): T {
    if (typeof valueOrFn === 'function') {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return (valueOrFn as (helper: BuilderHelper) => T)({
        resolveUrl: this.resolveUrl.bind(this),
      });
    }
    return valueOrFn;
  }

  /**
   * Creates a new HeadBuilder instance for constructing HTML head elements with optional base URL resolution and output transformation.
   *
   * @param options - Configuration options
   * @param options.metadataBase - Base URL for resolving relative URLs in metadata (Open Graph, canonical, etc.)
   * @param options.adapter - Adapter to transform output into framework-specific format
   *
   * @example
   * const head = new HeadBuilder({
   *   metadataBase: new URL('https://devsantara.com'),
   *   adapter: new ReactAdapter()
   * })
   *   .addTitle('My Site')
   *   .build();
   */
  constructor(options?: {
    metadataBase?: URL;
    adapter?: HeadAdapter<TOutput>;
  }) {
    this.metadataBase = options?.metadataBase;
    this.adapter = options?.adapter;
  }

  /**
   * Resolves a relative or absolute URL into an absolute URL using the configured metadataBase.
   *
   * @param url - The URL to resolve
   * @returns The resolved absolute URL as a string
   */
  private resolveUrl(url: string | URL): string {
    // If url is already a URL object, return as string
    if (url instanceof URL) {
      return url.href;
    }

    // If no metadataBase provided, return raw url as is
    if (!this.metadataBase) {
      return url;
    }

    // Resolve relative URL against metadataBase
    const resolved = new URL(url, this.metadataBase);
    return resolved.href;
  }

  /**
   * Generates a unique key for a head element based on its type and attributes.
   * Used for deduplication - elements with the same key replace previous ones.
   *
   * @param element - The head element to generate a key for
   * @returns A unique string key for the element
   */
  private getElementKey({ type, attributes }: HeadElement): string {
    if (type === 'title') {
      return 'title';
    }
    if (type === 'meta') {
      if ('charSet' in attributes) {
        return 'meta:charSet';
      }
      if ('httpEquiv' in attributes) {
        return `meta:http-equiv:${attributes.httpEquiv}`;
      }
      if ('name' in attributes && 'content' in attributes) {
        return `meta:name:${attributes.name}`;
      }
      if ('property' in attributes && 'content' in attributes) {
        return `meta:property:${attributes.property}`;
      }
    }
    if (type === 'link') {
      if (attributes.rel === 'canonical') {
        return 'link:canonical';
      }
      if (attributes.rel === 'manifest') {
        return 'link:manifest';
      }
      if (attributes.rel === 'alternate' && 'hrefLang' in attributes) {
        return `link:alternate:${attributes.hrefLang}`;
      }
    }
    return JSON.stringify(`${type}:${JSON.stringify(attributes)}`);
  }

  /**
   * Adds a head element to the internal collection with deduplication.
   * Elements with the same key will replace previous ones.
   *
   * @param type - The HTML element type
   * @param attributes - The element's attributes
   * @returns The unique key for the added element
   */
  private addElement<T extends keyof HeadAttributeTypeMap>(
    type: T,
    attributes: HeadAttributeTypeMap[T],
  ): string {
    const key = this.getElementKey({ type, attributes });
    this.elementsMap.set(key, { type, attributes });
    return key;
  }

  /**
   * Adds a custom meta element with any valid attributes. Use this for meta tags without dedicated helper methods.
   *
   * @param attributes - The meta element attributes
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addMeta({ name: 'theme-color', content: '#ffffff' })
   *   .build();
   */
  addMeta(attributes: HeadAttributeTypeMap['meta']): this {
    this.addElement('meta', attributes);
    return this;
  }

  /**
   * Adds a custom link element with any valid attributes.
   *
   * @param href - The URL to link to
   * @param attributes - Additional link element attributes
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addLink('https://fonts.googleapis.com', { rel: 'preconnect' })
   *   .build();
   */
  addLink(
    href: string | URL,
    attributes?: Omit<HeadAttributeTypeMap['link'], 'href'>,
  ): this {
    this.addElement('link', { href: href.toString(), ...attributes });
    return this;
  }

  /**
   * Adds a script element, either inline code or an external file.
   *
   * @param srcOrCode - Script source: a URL string/object for external files, or `{ code: string }` for inline scripts
   * @param attributes - Additional script attributes (async, defer, integrity, etc.)
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addScript('/script.js')
   *   .addScript(new URL('https://devsantara.com/script.js'), { async: true })
   *   .addScript({ code: 'console.log("Hello, World!")' })
   *   .build();
   */
  addScript(
    srcOrCode: string | URL | { code: string },
    attributes?: Omit<HeadAttributeTypeMap['script'], 'children' | 'src'>,
  ): this {
    // Inline script with { code: string }
    if (typeof srcOrCode === 'object' && 'code' in srcOrCode) {
      this.addElement('script', {
        children: srcOrCode.code,
        type: 'text/javascript',
        ...attributes,
      });
      return this;
    }

    // External script (string or URL)
    this.addElement('script', {
      src: srcOrCode.toString(),
      type: 'text/javascript',
      ...attributes,
    });
    return this;
  }

  /**
   * Adds an inline style element with CSS code.
   *
   * @param css - The inline CSS code
   * @param attributes - Additional style attributes
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addStyle('body { margin: 0; padding: 0; }')
   *   .build();
   */
  addStyle(
    css: string,
    attributes?: Omit<HeadAttributeTypeMap['style'], 'children'>,
  ): this {
    this.addElement('style', {
      children: css,
      type: 'text/css',
      ...attributes,
    });
    return this;
  }

  /**
   * Adds a pragma directive using the http-equiv attribute on a meta element.
   *
   * @param httpEquiv - The pragma directive (e.g., 'content-type', 'refresh')
   * @param content - The value for the directive
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addHttpEquiv('refresh', '30')
   *   .build();
   */
  addHttpEquiv(httpEquiv: HttpEquiv, content: string): this {
    this.addElement('meta', { httpEquiv, content });
    return this;
  }

  /**
   * Adds a character encoding declaration to specify how the document should be interpreted.
   *
   * @param charSet - The character encoding (e.g., 'utf-8', 'iso-8859-1')
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addCharSet('utf-8')
   *   .build();
   */
  addCharSet(charSet: CharSet): this {
    this.addElement('meta', { charSet });
    return this;
  }

  /**
   * Adds a color scheme preference indicating which color schemes the page supports for proper rendering.
   *
   * @param colorScheme - The supported color schemes (e.g., 'light', 'dark', 'light dark')
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addColorScheme('light dark')
   *   .build();
   */
  addColorScheme(colorScheme: ColorScheme): this {
    this.addElement('meta', {
      name: 'color-scheme',
      content: colorScheme,
    });
    return this;
  }

  /**
   * Adds a title element that appears in browser tabs, search results, and bookmarks.
   * Supports both simple string titles and templated titles with dynamic substitution.
   *
   * When a template is provided via TitleOptions, the default is used initially and the template is applied to subsequent string titles.
   *
   * @param title - The document title as a string, or TitleOptions object with template and default
   * @returns The builder instance for method chaining
   *
   * @example
   * // Simple title
   * new HeadBuilder()
   *   .addTitle('My Awesome Website')
   *   .build();
   *
   * @example
   * // Templated title with page-specific suffix
   * // Setting the template with default stores 'Home' as the title
   * const baseHead = new HeadBuilder()
   *   .addTitle({ template: '%s | My Site', default: 'Home' });
   *
   * // Subsequent string titles apply the template
   * const head = baseHead.addTitle('About Us').build(); // Results in title "About Us | My Site"
   */
  addTitle(title: string | TitleOptions): this {
    if (typeof title === 'string') {
      /**
       * If title is provided as a string and titleOptions with a template exists,
       * we generate the title using the template. This allows dynamic title generation based on previously set options.
       * If no template is set, we use the raw title string as is.
       */
      const titleText = this.titleOptions
        ? this.titleOptions.template.replace('%s', title)
        : title;

      this.addElement('title', { children: titleText });
      return this;
    }

    /**
     * If title is provided as an object with template and default,
     * we store the options and add the default title. Subsequent calls with string titles will use the template for generation.
     */
    this.titleOptions = title;
    this.addElement('title', { children: this.titleOptions.default });
    return this;
  }

  /**
   * Adds viewport configuration for responsive web design and mobile optimization.
   *
   * @param options - Viewport settings (width, initial scale, zoom controls, etc.)
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addViewport({ width: 'device-width', initialScale: 1 })
   *   .build();
   */
  addViewport(options: ViewportOptions): this {
    const contentParts: string[] = [];

    if (options.width !== undefined) {
      contentParts.push(`width=${options.width}`);
    }
    if (options.height !== undefined) {
      contentParts.push(`height=${options.height}`);
    }
    if (options.initialScale !== undefined) {
      contentParts.push(`initial-scale=${options.initialScale}`);
    }
    if (options.minimumScale !== undefined) {
      contentParts.push(`minimum-scale=${options.minimumScale}`);
    }
    if (options.maximumScale !== undefined) {
      contentParts.push(`maximum-scale=${options.maximumScale}`);
    }
    if (options.userScalable !== undefined) {
      contentParts.push(`user-scalable=${options.userScalable ? 'yes' : 'no'}`);
    }
    if (options.viewportFit !== undefined) {
      contentParts.push(`viewport-fit=${options.viewportFit}`);
    }
    if (options.interactiveWidget !== undefined) {
      contentParts.push(`interactive-widget=${options.interactiveWidget}`);
    }

    this.addElement('meta', {
      name: 'viewport',
      content: contentParts.join(', '),
    });
    return this;
  }

  /**
   * Adds a description that appears in search engine results and social media previews.
   *
   * @param description - The page description text
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addDescription('A comprehensive guide to web development')
   *   .build();
   */
  addDescription(description: string): this {
    this.addElement('meta', {
      name: 'description',
      content: description,
    });
    return this;
  }

  /**
   * Adds a canonical URL to help search engines identify the preferred version of a page and prevent duplicate content issues.
   *
   * @param valueOrFn - The canonical URL or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addCanonical((helper) => helper.resolveUrl('/page'))
   *   .build();
   */
  addCanonical(valueOrFn: BuilderOption<string | URL>): this {
    const value = this.parseValueOrFn(valueOrFn);
    this.addElement('link', {
      rel: 'canonical',
      href: value.toString(),
    });
    return this;
  }

  /**
   * Adds robots directives to control search engine crawling and indexing behavior.
   *
   * @param options - Robots configuration with index/follow booleans and custom directives
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addRobots({ index: true, follow: true, 'max-snippet': 160 })
   *   .build();
   */
  addRobots(options: RobotsOptions): this {
    const directiveParts: string[] = [];

    for (const [key, value] of Object.entries(options)) {
      if (value === undefined) continue;

      if (key === 'index') {
        directiveParts.push(value ? 'index' : 'noindex');
      } else if (key === 'follow') {
        directiveParts.push(value ? 'follow' : 'nofollow');
      } else if (typeof value === 'string' || typeof value === 'number') {
        directiveParts.push(`${key}:${value}`);
      } else if (value) {
        directiveParts.push(key);
      }
    }

    this.addElement('meta', {
      name: 'robots',
      content: directiveParts.join(', '),
    });
    return this;
  }

  /**
   * Adds Open Graph metadata for rich social media previews on platforms like Facebook, LinkedIn, and Slack.
   *
   * @param valueOrFn - Open Graph configuration or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addOpenGraph((helper) => ({
   *     title: 'My Page',
   *     url: helper.resolveUrl('/page'),
   *     image: { url: helper.resolveUrl('/og-image.jpg') }
   *   }))
   *   .build();
   */
  addOpenGraph(valueOrFn: BuilderOption<OpenGraphOptions>): this {
    const value = this.parseValueOrFn(valueOrFn);

    // Add basic properties
    if (value.title) {
      this.addElement('meta', { property: 'og:title', content: value.title });
    }
    if (value.description) {
      this.addElement('meta', {
        property: 'og:description',
        content: value.description,
      });
    }
    if (value.url) {
      this.addElement('meta', {
        property: 'og:url',
        content: value.url.toString(),
      });
    }
    if (value.locale) {
      this.addElement('meta', {
        property: 'og:locale',
        content: value.locale,
      });
    }

    // Add image properties
    if (value.image) {
      this.addElement('meta', {
        property: 'og:image',
        content: value.image.url.toString(),
      });

      if (value.image.alt) {
        this.addElement('meta', {
          property: 'og:image:alt',
          content: value.image.alt,
        });
      }
      if (value.image.type) {
        this.addElement('meta', {
          property: 'og:image:type',
          content: value.image.type,
        });
      }
      if (value.image.width) {
        this.addElement('meta', {
          property: 'og:image:width',
          content: value.image.width.toString(),
        });
      }
      if (value.image.height) {
        this.addElement('meta', {
          property: 'og:image:height',
          content: value.image.height.toString(),
        });
      }
    }

    // Add type and type-specific properties
    if (value.type) {
      this.addElement('meta', {
        property: 'og:type',
        content: value.type.name,
      });

      if ('properties' in value.type) {
        for (const typeProperty of value.type.properties) {
          this.addElement('meta', {
            property: typeProperty.name,
            content: typeProperty.content,
          });
        }
      }
    }

    return this;
  }

  /**
   * Adds Twitter Card metadata for rich previews when links are shared on Twitter/X.
   *
   * @param valueOrFn - Twitter Card configuration or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addTwitter((helper) => ({
   *     card: { name: 'summary_large_image' },
   *     image: { url: helper.resolveUrl('/twitter-card.jpg') }
   *   }))
   *   .build();
   */
  addTwitter(valueOrFn: BuilderOption<TwitterOptions>): this {
    const value = this.parseValueOrFn(valueOrFn);

    // Add basic properties
    if (value.title) {
      this.addElement('meta', {
        name: 'twitter:title',
        content: value.title,
      });
    }
    if (value.description) {
      this.addElement('meta', {
        name: 'twitter:description',
        content: value.description,
      });
    }
    if (value.site) {
      this.addElement('meta', { name: 'twitter:site', content: value.site });
    }
    if (value.siteId) {
      this.addElement('meta', {
        name: 'twitter:site:id',
        content: value.siteId,
      });
    }
    if (value.creator) {
      this.addElement('meta', {
        name: 'twitter:creator',
        content: value.creator,
      });
    }
    if (value.creatorId) {
      this.addElement('meta', {
        name: 'twitter:creator:id',
        content: value.creatorId,
      });
    }

    // Add image properties
    if (value.image) {
      this.addElement('meta', {
        name: 'twitter:image',
        content: value.image.url.toString(),
      });

      if (value.image.alt) {
        this.addElement('meta', {
          name: 'twitter:image:alt',
          content: value.image.alt,
        });
      }
    }

    // Add card and card-specific properties
    if (value.card) {
      this.addElement('meta', {
        name: 'twitter:card',
        content: value.card.name,
      });

      if ('properties' in value.card) {
        for (const cardProperty of value.card.properties) {
          this.addElement('meta', {
            name: cardProperty.name,
            content: cardProperty.content.toString(),
          });
        }
      }
    }

    return this;
  }

  /**
   * Adds alternate language/locale versions of the page to help search engines serve the correct localized content to users.
   *
   * @param valueOrFn - Locale-to-URL mapping or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addAlternateLocale((helper) => ({
   *     'en-US': helper.resolveUrl('/en'),
   *     'fr-FR': helper.resolveUrl('/fr'),
   *     'x-default': helper.resolveUrl('/')
   *   }))
   *   .build();
   */
  addAlternateLocale<TLocale extends string = string>(
    valueOrFn: BuilderOption<AlternateLocaleOptions<TLocale>>,
  ): this {
    const value = this.parseValueOrFn(valueOrFn);

    for (const [lang, href] of Object.entries(value)) {
      this.addElement('link', {
        rel: 'alternate',
        hrefLang: lang,
        href: String(href),
      });
    }

    return this;
  }

  /**
   * Adds a web app manifest link that defines how your application appears when installed on devices.
   *
   * @param valueOrFn - The manifest URL or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addManifest((helper) => helper.resolveUrl('/manifest.json'))
   *   .build();
   */
  addManifest(valueOrFn: BuilderOption<string | URL>): this {
    const value = this.parseValueOrFn(valueOrFn);
    this.addElement('link', {
      rel: 'manifest',
      href: value.toString(),
    });
    return this;
  }

  /**
   * Adds an external CSS stylesheet link to the page.
   *
   * @param href - The stylesheet URL
   * @param options - Additional link attributes (media queries, integrity, etc.)
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addStylesheet('/styles.css', { media: 'print' })
   *   .build();
   */
  addStylesheet(href: string | URL, options?: StylesheetOptions): this {
    this.addElement('link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: href.toString(),
      ...options,
    });
    return this;
  }

  /**
   * Adds a favicon or app icon using preset types or custom rel values.
   *
   * @param preset - Icon type ('icon', 'apple', 'shortcut', or custom string)
   * @param valueOrFn - Icon configuration or a callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addIcon('apple', (helper) => ({
   *     href: helper.resolveUrl('/apple-icon.png'),
   *     sizes: '180x180'
   *   }))
   *   .build();
   */
  addIcon(preset: IconPreset, valueOrFn: BuilderOption<IconOptions>): this {
    const { href, ...value } = this.parseValueOrFn(valueOrFn);

    // Map preset to rel attribute
    const relMap: Record<IconPreset, string> = {
      apple: 'apple-touch-icon',
      icon: 'icon',
      shortcut: 'shortcut icon',
    };
    const rel = relMap[preset] || preset;

    this.addElement('link', {
      rel,
      href: href.toString(),
      ...value,
    });
    return this;
  }

  /**
   * Adds Schema.org structured data as JSON-LD for rich search results and semantic web integration.
   * Use the SchemaOrgBuilder builder to create type-safe structured data with entity relationships.
   * Can accept either a pre-built SchemaOrgBuilder instance or a callback function.
   *
   * @param valueOrFn - SchemaOrgBuilder instance or callback function receiving helper utilities
   * @returns The builder instance for method chaining
   *
   * **Note:** Requires the `schema-dts` package for type-safe Schema.org types: `npm install schema-dts`
   *
   * @example
   * // Single entity with pre-built schema
   * import type { Brand } from 'schema-dts';
   *
   * const schema = new SchemaOrgBuilder<Brand>(new URL('https://devsantara.com'))
   *   .addEntity('brand', {
   *     '@type': 'Brand',
   *     name: 'My Brand',
   *     url: 'https://devsantara.com'
   *   });
   *
   * new HeadBuilder().addSchemaOrg(schema).build();
   *
   * @example
   * // Multiple entities with references
   * import type { Brand, Product } from 'schema-dts';
   *
   * const schema = new SchemaOrgBuilder<Brand | Product>(new URL('https://devsantara.com'))
   *   .addEntity('brand', {
   *     '@type': 'Brand',
   *     '@id': 'https://devsantara.com/#brand',
   *     name: 'My Brand'
   *   })
   *   .addEntity('product', (ref) => ({
   *     '@type': 'Product',
   *     name: 'My Product',
   *     brand: { '@id': ref.brand.getID() }
   *   }));
   *
   * new HeadBuilder().addSchemaOrg(schema).build();
   *
   * @example
   * // Using callback with URL resolution
   * import type { Brand } from 'schema-dts';
   *
   * new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addSchemaOrg((helper) => new SchemaOrgBuilder<Brand>(new URL(helper.resolveUrl('/')))
   *     .addEntity('brand', {
   *       '@type': 'Brand',
   *       '@id': helper.resolveUrl('/#brand'),
   *       name: 'My Brand',
   *       url: helper.resolveUrl('/')
   *     })
   *   )
   *   .build();
   */
  addSchemaOrg(
    valueOrFn: SchemaOrgBuilder | BuilderOption<SchemaOrgBuilder>,
  ): this {
    const value = this.parseValueOrFn(valueOrFn);
    this.addElement('script', {
      type: 'application/ld+json',
      children: value.build(),
    });

    return this;
  }

  /**
   * Builds and returns the final head configuration. Returns adapted output if an adapter was provided, otherwise returns `HeadElement[]`.
   *
   * @returns The head configuration in the target format
   */
  build(): TOutput {
    const elements = Array.from(this.elementsMap.values());
    if (this.adapter) {
      return this.adapter.transform(elements);
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return elements as unknown as TOutput;
  }
}

import type {
  HeadAttributeTypeMap,
  HeadAdapter,
  HeadElement,
  CharSet,
  ColorScheme,
  RobotsOptions,
  ViewportOptions,
  OpenGraphOptions,
  TwitterOptions,
  AlternateLocaleOptions,
  IconOptions,
  IconPreset,
  StylesheetOptions,
} from './types';

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
  private metadataBase?: URL;
  private adapter?: HeadAdapter<TOutput>;
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
    try {
      const resolved = new URL(url, this.metadataBase);
      return resolved.href;
    } catch {
      // If URL construction fails, return raw url
      return url;
    }
  }

  /**
   * Generates a unique key for a head element based on its type and attributes.
   * Used for deduplication - elements with the same key replace previous ones.
   *
   * @param element - The head element to generate a key for
   * @returns A unique string key for the element
   */
  private getElementKey({ type, attributes }: HeadElement) {
    if (type === 'title') {
      return 'title';
    }
    if (type === 'meta') {
      if ('charSet' in attributes) {
        return 'meta:charSet';
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
   * @returns The builder instance for method chaining
   */
  private addElement<T extends keyof HeadAttributeTypeMap>(
    type: T,
    attributes: HeadAttributeTypeMap[T],
  ) {
    const key = this.getElementKey({ type, attributes });
    this.elementsMap.set(key, { type, attributes });
    return this;
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
  addMeta(attributes: HeadAttributeTypeMap['meta']) {
    return this.addElement('meta', attributes);
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
  ) {
    return this.addElement('link', { href: href.toString(), ...attributes });
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
   *   .addScript(new URL('https://example.com/script.js'), { async: true })
   *   .addScript({ code: 'console.log("Hello, World!")' })
   *   .build();
   */
  addScript(
    srcOrCode: string | URL | { code: string },
    attributes?: Omit<HeadAttributeTypeMap['script'], 'children' | 'src'>,
  ) {
    // Inline script with { code: string }
    if (typeof srcOrCode === 'object' && 'code' in srcOrCode) {
      return this.addElement('script', {
        children: srcOrCode.code,
        type: 'text/javascript',
        ...attributes,
      });
    }

    // External script (string or URL)
    return this.addElement('script', {
      src: srcOrCode.toString(),
      type: 'text/javascript',
      ...attributes,
    });
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
  ) {
    return this.addElement('style', {
      children: css,
      type: 'text/css',
      ...attributes,
    });
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
  addCharSet(charSet: CharSet) {
    return this.addElement('meta', { charSet });
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
  addColorScheme(colorScheme: ColorScheme) {
    return this.addElement('meta', {
      name: 'color-scheme',
      content: colorScheme,
    });
  }

  /**
   * Adds a title element that appears in browser tabs, search results, and bookmarks.
   *
   * @param title - The document title text
   * @returns The builder instance for method chaining
   *
   * @example
   * new HeadBuilder()
   *   .addTitle('My Awesome Website')
   *   .build();
   */
  addTitle(title: string) {
    return this.addElement('title', { children: title });
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
  addViewport(options: ViewportOptions) {
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

    return this.addElement('meta', {
      name: 'viewport',
      content: contentParts.join(', '),
    });
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
  addDescription(description: string) {
    return this.addElement('meta', {
      name: 'description',
      content: description,
    });
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
  addCanonical(valueOrFn: BuilderOption<string | URL>) {
    const value = this.parseValueOrFn(valueOrFn);
    return this.addElement('link', {
      rel: 'canonical',
      href: value.toString(),
    });
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
  addRobots(options: RobotsOptions) {
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

    return this.addElement('meta', {
      name: 'robots',
      content: directiveParts.join(', '),
    });
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
  addOpenGraph(valueOrFn: BuilderOption<OpenGraphOptions>) {
    const options = this.parseValueOrFn(valueOrFn);

    // Add basic properties
    if (options.title) {
      this.addElement('meta', { property: 'og:title', content: options.title });
    }
    if (options.description) {
      this.addElement('meta', {
        property: 'og:description',
        content: options.description,
      });
    }
    if (options.url) {
      this.addElement('meta', {
        property: 'og:url',
        content: options.url.toString(),
      });
    }
    if (options.locale) {
      this.addElement('meta', {
        property: 'og:locale',
        content: options.locale,
      });
    }

    // Add image properties
    if (options.image) {
      this.addElement('meta', {
        property: 'og:image',
        content: options.image.url.toString(),
      });

      if (options.image.alt) {
        this.addElement('meta', {
          property: 'og:image:alt',
          content: options.image.alt,
        });
      }
      if (options.image.type) {
        this.addElement('meta', {
          property: 'og:image:type',
          content: options.image.type,
        });
      }
      if (options.image.width) {
        this.addElement('meta', {
          property: 'og:image:width',
          content: options.image.width.toString(),
        });
      }
      if (options.image.height) {
        this.addElement('meta', {
          property: 'og:image:height',
          content: options.image.height.toString(),
        });
      }
    }

    // Add type and type-specific properties
    if (options.type) {
      this.addElement('meta', {
        property: 'og:type',
        content: options.type.name,
      });

      if ('properties' in options.type) {
        for (const typeProperty of options.type.properties) {
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
  addTwitter(valueOrFn: BuilderOption<TwitterOptions>) {
    const options = this.parseValueOrFn(valueOrFn);

    // Add basic properties
    if (options.title) {
      this.addElement('meta', {
        name: 'twitter:title',
        content: options.title,
      });
    }
    if (options.description) {
      this.addElement('meta', {
        name: 'twitter:description',
        content: options.description,
      });
    }
    if (options.site) {
      this.addElement('meta', { name: 'twitter:site', content: options.site });
    }
    if (options.siteId) {
      this.addElement('meta', {
        name: 'twitter:site:id',
        content: options.siteId,
      });
    }
    if (options.creator) {
      this.addElement('meta', {
        name: 'twitter:creator',
        content: options.creator,
      });
    }
    if (options.creatorId) {
      this.addElement('meta', {
        name: 'twitter:creator:id',
        content: options.creatorId,
      });
    }

    // Add image properties
    if (options.image) {
      this.addElement('meta', {
        name: 'twitter:image',
        content: options.image.url.toString(),
      });

      if (options.image.alt) {
        this.addElement('meta', {
          name: 'twitter:image:alt',
          content: options.image.alt,
        });
      }
    }

    // Add card and card-specific properties
    if (options.card) {
      this.addElement('meta', {
        name: 'twitter:card',
        content: options.card.name,
      });

      if ('properties' in options.card) {
        for (const cardProperty of options.card.properties) {
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
   * new HeadBuilder({ metadataBase: new URL('https://example.com') })
   *   .addAlternateLocale((helper) => ({
   *     'en-US': helper.resolveUrl('/en'),
   *     'fr-FR': helper.resolveUrl('/fr'),
   *     'x-default': helper.resolveUrl('/')
   *   }))
   *   .build();
   */
  addAlternateLocale<TLocale extends string = string>(
    valueOrFn: BuilderOption<AlternateLocaleOptions<TLocale>>,
  ) {
    const options = this.parseValueOrFn(valueOrFn);

    for (const [lang, href] of Object.entries(options)) {
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
  addManifest(valueOrFn: BuilderOption<string | URL>) {
    const href = this.parseValueOrFn(valueOrFn);

    return this.addElement('link', {
      rel: 'manifest',
      href: href.toString(),
    });
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
  addStylesheet(href: string | URL, options?: StylesheetOptions) {
    return this.addElement('link', {
      rel: 'stylesheet',
      href: href.toString(),
      ...options,
    });
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
  addIcon(preset: IconPreset, valueOrFn: BuilderOption<IconOptions>) {
    const options = this.parseValueOrFn(valueOrFn);

    // Map preset to rel attribute
    const relMap: Record<IconPreset, string> = {
      apple: 'apple-touch-icon',
      icon: 'icon',
      shortcut: 'shortcut icon',
    };

    const rel = relMap[preset] || preset;

    return this.addElement('link', {
      rel,
      href: options.href.toString(),
      type: options.type,
      sizes: options.sizes,
      media: options.media,
      fetchPriority: options.fetchPriority,
    });
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

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
} from './types';

/**
 * Helper object passed to callback functions in builder methods
 */
interface BuilderHelper {
  /**
   * Resolves a URL (absolute or relative) into an absolute URL using the metadataBase
   * @param url - The raw string or URL to resolve
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
  private elements: HeadElement[] = [];
  private adapter?: HeadAdapter<TOutput>;

  /**
   * Parses builder options that can be either a value or a function
   * @param valueOrFn - The options value or function that returns options
   * @returns The resolved options value
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
   * Creates a new HeadBuilder instance with optional metadataBase and adapter configuration
   *
   * The metadataBase serves as the base path and origin for absolute URLs in various
   * metadata fields. When relative URLs (for Open Graph images, alternates, etc.) are used,
   * they are composed with this base. If not provided, relative URLs will be used as-is.
   *
   * The adapter can be injected to automatically transform the output when calling build().
   * If provided, build() will return the adapted output; otherwise, it returns HeadElement[].
   *
   * @param options - Configuration options
   * @param options.metadataBase - The base URL to use for resolving relative URLs in metadata
   * @param options.adapter - Optional adapter instance to transform the build output
   *
   * @example
   * // Without adapter - returns HeadElement[]
   * const elements = new HeadBuilder()
   *   .addMeta({ name: 'description', content: 'My site' })
   *   .build();
   *
   * @example
   * // With HTMLAdapter - returns string
   * const html = new HeadBuilder({ adapter: new HTMLAdapter() })
   *   .addMeta({ name: 'description', content: 'My site' })
   *   .build();
   *
   * @example
   * // With metadataBase and ReactAdapter - returns ReactNode[]
   * const reactNodes = new HeadBuilder({
   *   metadataBase: new URL('https://devsantara.com'),
   *   adapter: new ReactAdapter()
   * })
   *   .addMeta({ name: 'description', content: 'My site' })
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
   * Resolves a URL (absolute or relative) into an absolute URL using the metadataBase
   *
   * This method is used to resolve URLs for metadata fields like
   * Open Graph images, canonical URLs, and other absolute URL requirements.
   *
   * @param url - The raw string or URL to resolve
   * @returns The resolved absolute URL as a string
   *
   * @example
   * const head = new HeadBuilder({ metadataBase: new URL('https://devsantara.com') })
   *   .addOpenGraph((helper) => ({
   *     title: 'My Page',
   *     url: helper.resolveUrl('/page')
   *   }));
   * // Returns: 'https://devsantara.com/page'
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
   * Adds a head element to the builder's collection
   *
   * This private method is used internally to add metadata elements (meta, link, script, or style)
   * to the collection that will be used when building the final head configuration.
   *
   * @example
   * this.addElement('meta', { name: 'description', content: 'A description' })
   * this.addElement('link', { rel: 'canonical', href: 'https://devsantara.com' })
   */
  private addElement<T extends keyof HeadAttributeTypeMap>(
    type: T,
    attributes: HeadAttributeTypeMap[T],
  ) {
    this.elements.push({ type, attributes });
    return this;
  }

  /**
   * Gets the configured metadataBase URL
   */
  getMetadataBase(): URL | undefined {
    return this.metadataBase;
  }

  /**
   * Adds a meta element directly to the head configuration
   *
   * This is a general utility method for adding meta elements when a specific
   * helper method doesn't exist. It directly adds the element to the internal collection.
   *
   * @example
   * const head = new HeadBuilder()
   *   .addMeta({ name: 'description', content: 'My site description' })
   *   .addMeta({ charSet: 'utf-8' })
   *   .build();
   */
  addMeta(attributes: HeadAttributeTypeMap['meta']) {
    return this.addElement('meta', attributes);
  }

  /**
   * Adds a link element directly to the head configuration
   *
   * This is a general utility method for adding link elements when a specific
   * helper method doesn't exist. It directly adds the element to the internal collection.
   *
   * @example
   * const head = new HeadBuilder()
   *   .addLink({ rel: 'canonical', href: 'https://devsantara.com' })
   *   .addLink({ rel: 'stylesheet', href: '/styles.css' })
   *   .build();
   */
  addLink(attributes: HeadAttributeTypeMap['link']) {
    return this.addElement('link', attributes);
  }

  /**
   * Adds a script element directly to the head configuration
   *
   * This is a general utility method for adding script elements when a specific
   * helper method doesn't exist. It directly adds the element to the internal collection.
   *
   * @example
   * const head = new HeadBuilder()
   *   .addScript({ src: '/analytics.js', async: true })
   *   .addScript({children: 'console.log("Hello World");'});
   *   .build();
   */
  addScript(attributes: HeadAttributeTypeMap['script']) {
    return this.addElement('script', attributes);
  }

  /**
   * Adds a style element directly to the head configuration
   *
   * This is a general utility method for adding style elements when a specific
   * helper method doesn't exist. It directly adds the element to the internal collection.
   *
   * @example
   * const head = new HeadBuilder()
   *   .addStyle({
   *     children: `
   *       .header { background: #333; color: white; padding: 20px; }
   *       .hero { min-height: 100vh; display: flex; align-items: center; }
   *     `
   *   })
   *   .build();
   */
  addStyle(attributes: HeadAttributeTypeMap['style']) {
    return this.addElement('style', attributes);
  }

  /**
   * Adds a character encoding declaration to the head configuration
   *
   * This method provides a convenient way to declare the document's character encoding
   * using a meta element with the charset attribute.
   *
   * @see https://html.spec.whatwg.org/multipage/semantics.html#character-encoding-declaration
   *
   * @param charSet - The character encoding value (e.g., 'utf-8', 'iso-8859-1')
   *
   * @example
   * const head = new HeadBuilder()
   *   .addCharSet('utf-8')
   *   .build();
   */
  addCharSet(charSet: CharSet) {
    return this.addElement('meta', { charSet });
  }

  /**
   * Adds a color-scheme meta tag to the head configuration
   *
   * This method sets the color scheme preference for the document, indicating
   * which color schemes the page supports (light, dark, or both).
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/color-scheme
   *
   * @param colorScheme - The color scheme value (e.g., 'light', 'dark', 'light dark')
   *
   * @example
   * const head = new HeadBuilder()
   *   .addColorScheme('light dark')
   *   .build();
   *
   * @example
   * const head = new HeadBuilder()
   *   .addColorScheme('dark')
   *   .build();
   */
  addColorScheme(colorScheme: ColorScheme) {
    return this.addElement('meta', {
      name: 'color-scheme',
      content: colorScheme,
    });
  }

  /**
   * Adds a title element to the head configuration
   *
   * This method sets the document title that appears in the browser tab,
   * search engine results, and bookmarks.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
   *
   * @param title - The document title text
   *
   * @example
   * const head = new HeadBuilder()
   *   .addTitle('My Awesome Website')
   *   .build();
   */
  addTitle(title: string) {
    return this.addElement('title', { children: title });
  }

  /**
   * Adds a viewport meta tag to the head configuration
   *
   * This method provides a convenient way to configure the viewport settings
   * for responsive web design.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
   *
   * @param options - Viewport configuration options
   *
   * @example
   * const head = new HeadBuilder()
   *   .addViewport({
   *     width: 'device-width',
   *     initialScale: 1,
   *     maximumScale: 5,
   *     userScalable: true
   *   })
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
   * Adds a description meta tag to the head configuration
   *
   * This method provides a convenient way to set the page description that appears
   * in search engine results and social media shares.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name#description
   *
   * @param description - The page description text
   *
   * @example
   * const head = new HeadBuilder()
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
   * Adds a robots meta tag to the head configuration
   *
   * This method provides a convenient way to control search engine crawling and indexing behavior.
   * Set index to false for noindex, follow to false for nofollow.
   * You can also add custom directives as boolean properties, string values, or number values.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/robots
   *
   * @param options - The robots configuration options
   *
   * @example
   * const head = new HeadBuilder()
   *   .addRobots({ index: false, follow: false })
   *   .build();
   * // Results in: <meta name="robots" content="noindex, nofollow" />
   *
   * @example
   * const head = new HeadBuilder()
   *   .addRobots({ index: true, follow: true, noarchive: true })
   *   .build();
   * // Results in: <meta name="robots" content="index, follow, noarchive" />
   *
   * @example
   * const head = new HeadBuilder()
   *   .addRobots({ index: true, 'max-image-preview': 'large', 'max-snippet': 160 })
   *   .build();
   * // Results in: <meta name="robots" content="index, max-image-preview:large, max-snippet:160" />
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
   * Adds OpenGraph meta tags to the head configuration
   *
   * This method provides a convenient way to add OpenGraph metadata for rich social media previews.
   * It handles basic properties, images, and type-specific metadata.
   *
   * You can pass either an options object directly or a function that receives a helper object.
   *
   * @see https://ogp.me/
   *
   * @param valueOrFn - The OpenGraph configuration options or a function that returns them
   *
   * @example
   * // Direct options
   * const head = new HeadBuilder()
   *   .addOpenGraph({
   *     title: 'My Page Title',
   *     description: 'A description of my page',
   *     url: 'https://devsantara.com/page',
   *     image: {
   *       url: 'https://devsantara.com/image.jpg',
   *       alt: 'Image description',
   *       width: 1200,
   *       height: 630
   *     }
   *   })
   *   .build();
   *
   * @example
   * // Using builder helper callback function
   * const head = new HeadBuilder({
   *   metadataBase: new URL('https://devsantara.com')
   * })
   *   .addOpenGraph((helper) => ({
   *     title: 'My Page Title',
   *     url: helper.resolveUrl('/page'),
   *     image: {
   *       url: helper.resolveUrl('/images/og-image.jpg'),
   *       alt: 'Image description'
   *     }
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
   * Adds Twitter Card meta tags to the head configuration
   *
   * This method provides a convenient way to add Twitter Card metadata for rich previews on Twitter.
   * It handles basic properties, images, and card-specific metadata.
   *
   * You can pass either an options object directly or a function that receives a helper object.
   *
   * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
   *
   * @param valueOrFn - The Twitter Card configuration options or a function that returns them
   *
   * @example
   * // Direct options
   * const head = new HeadBuilder()
   *   .addTwitter({
   *     title: 'My Page Title',
   *     description: 'A description of my page',
   *     site: '@mysite',
   *     creator: '@author',
   *     image: {
   *       url: 'https://devsantara.com/image.jpg',
   *       alt: 'Image description'
   *     },
   *     card: { name: 'summary_large_image' }
   *   })
   *   .build();
   *
   * @example
   * // Using builder helper callback function
   * const head = new HeadBuilder({
   *   metadataBase: new URL('https://devsantara.com')
   * })
   *   .addTwitter((helper) => ({
   *     title: 'My Page Title',
   *     image: {
   *       url: helper.resolveUrl('/images/twitter-card.jpg'),
   *       alt: 'Image description'
   *     },
   *     card: { name: 'summary_large_image' }
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
   * Builds and returns the head configuration
   *
   * If an adapter was provided in the constructor, returns the adapted output.
   * Otherwise, returns the raw HeadElement[] array.
   */
  build(): TOutput {
    if (this.adapter) {
      return this.adapter.transform(this.elements);
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return this.elements as unknown as TOutput;
  }
}

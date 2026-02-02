import type {
  HeadAttributeTypeMap,
  HeadAdapter,
  HeadElement,
  CharSet,
  RobotsOptions,
} from './types';

export class HeadBuilder<TOutput = HeadElement[]> {
  private metadataBase?: URL;
  private elements: HeadElement[] = [];
  private adapter?: HeadAdapter<TOutput>;

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

import type { AttributeTypeMap, HeadElement } from './types';

export class HeadBuilder {
  private metadataBase?: URL;
  private elements: HeadElement[] = [];

  /**
   * Creates a new HeadBuilder instance with optional metadataBase configuration
   *
   * The metadataBase serves as the base path and origin for absolute URLs in various
   * metadata fields. When relative URLs (for Open Graph images, alternates, etc.) are used,
   * they are composed with this base. If not provided, relative URLs will be used as-is.
   *
   * @param metadataBase - The base URL to use for resolving relative URLs in metadata
   *
   * @example
   * const head = new HeadBuilder('https://devsantara.com')
   *   .addOpenGraph({
   *     title: 'My Article',
   *     image: { url: '/og-image.jpg' } // Will resolve to https://devsantara.com/og-image.jpg
   *   })
   *   .build();
   */
  constructor(metadataBase?: URL) {
    this.metadataBase = metadataBase;
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
  private addElement<T extends keyof AttributeTypeMap>(
    type: T,
    attributes: AttributeTypeMap[T],
  ) {
    this.elements.push({ type, attributes });
    return this;
  }

  /** Gets the configured metadataBase URL */
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
  addMeta(attributes: AttributeTypeMap['meta']) {
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
  addLink(attributes: AttributeTypeMap['link']) {
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
  addScript(attributes: AttributeTypeMap['script']) {
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
  addStyle(attributes: AttributeTypeMap['style']) {
    return this.addElement('style', attributes);
  }

  /** Builds and returns the array of head elements */
  build(): HeadElement[] {
    return this.elements;
  }
}

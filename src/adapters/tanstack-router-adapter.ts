import type {
  HeadAdapter,
  HeadElement,
  HeadLinkAttributes,
  HeadMetaAttributes,
  HeadScriptAttributes,
  HeadStyleAttributes,
} from '../types';
import { isElementOfType } from '../utils';

export interface HeadTanStackRouterAdapterResult {
  links?: HeadLinkAttributes[];
  scripts?: HeadScriptAttributes[];
  meta?: HeadMetaAttributes[];
  styles?: HeadStyleAttributes[];
}

/**
 * Adapter for converting HeadElement[] to TanStack Router head configuration
 *
 * This adapter transforms the head elements into the format expected by
 * TanStack Router's head management system, organizing elements by type.
 *
 * @example
 * const elements = new HeadBuilder()
 *   .addMeta({ name: 'description', content: 'My site' })
 *   .addLink({ rel: 'canonical', href: 'https://example.com' })
 *   .build();
 *
 * const adapter = new HeadTanstackRouterAdapter();
 * const config = adapter.transform(elements);
 * // Returns: {
 * //   meta: [{ name: 'description', content: 'My site' }],
 * //   links: [{ rel: 'canonical', href: 'https://example.com' }],
 * //   scripts: [],
 * //   styles: []
 * // }
 */
export class HeadTanstackRouterAdapter implements HeadAdapter<HeadTanStackRouterAdapterResult> {
  /**
   * Transforms HeadElement[] to TanStack Router head config
   * @param elements - Array of head elements from HeadBuilder.build()
   * @returns A TanStackHeadConfig object with elements organized by type
   */
  transform(elements: HeadElement[]): HeadTanStackRouterAdapterResult {
    const config: HeadTanStackRouterAdapterResult = {
      meta: [],
      links: [],
      scripts: [],
      styles: [],
    };

    for (const element of elements) {
      if (isElementOfType(element, 'meta')) {
        config.meta?.push(element.attributes);
      } else if (isElementOfType(element, 'link')) {
        config.links?.push(element.attributes);
      } else if (isElementOfType(element, 'script')) {
        config.scripts?.push(element.attributes);
      } else if (isElementOfType(element, 'style')) {
        config.styles?.push(element.attributes);
      }
    }

    return config;
  }
}

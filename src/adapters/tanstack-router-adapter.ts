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
 * Adapter that transforms head elements into TanStack Router head configuration format.
 */
export class HeadTanstackRouterAdapter implements HeadAdapter<HeadTanStackRouterAdapterResult> {
  /**
   * Transforms head elements into TanStack Router head configuration with elements organized by type.
   *
   * @param elements - Array of head elements to transform
   * @returns Head configuration object with categorized elements
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
      } else if (isElementOfType(element, 'title')) {
        /**
         * TanStack Router automatically dedupes title and meta tags
         * so we only need to push the title as a meta element
         */
        // oxlint-disable-next-line typescript/no-base-to-string
        config.meta?.push({ title: String(element.attributes.children) });
      }
    }

    return config;
  }
}

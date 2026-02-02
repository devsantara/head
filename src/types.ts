export type HeadMetaAttributes = React.DetailedHTMLProps<
  React.MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>;
export type HeadLinkAttributes = React.DetailedHTMLProps<
  React.LinkHTMLAttributes<HTMLLinkElement>,
  HTMLLinkElement
>;
export type HeadScriptAttributes = React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>;
export type HeadStyleAttributes = React.DetailedHTMLProps<
  React.StyleHTMLAttributes<HTMLStyleElement>,
  HTMLStyleElement
>;

export interface HeadAttributeTypeMap {
  meta: HeadMetaAttributes;
  link: HeadLinkAttributes;
  script: HeadScriptAttributes;
  style: HeadStyleAttributes;
}

export type HeadElement<
  T extends keyof HeadAttributeTypeMap = keyof HeadAttributeTypeMap,
> = {
  type: T;
  attributes: HeadAttributeTypeMap[T];
};

/**
 * Generic adapter interface for transforming HeadElement[] to a target format
 * @template T - The output type of the adapter
 */
export interface HeadAdapter<T> {
  transform(elements: HeadElement[]): T;
}

/**
 * Character encoding type with autocomplete for common charsets
 */
export type CharSet = 'utf-8' | (string & {});

/**
 * Robots meta tag options
 * Supports index and follow with autocomplete, plus any custom directives
 * Custom properties can be boolean (e.g., noarchive: true), string values (e.g., 'max-image-preview': 'large'), or number values (e.g., 'max-snippet': 160)
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/robots
 */
export interface RobotsOptions {
  index?: boolean;
  follow?: boolean;
  [key: string]: boolean | string | number | undefined;
}

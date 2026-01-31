import * as React from 'react';

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
  adapter(elements: HeadElement[]): T;
}

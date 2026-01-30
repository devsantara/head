import type {
  DetailedHTMLProps,
  LinkHTMLAttributes,
  MetaHTMLAttributes,
  ScriptHTMLAttributes,
  StyleHTMLAttributes,
} from 'react';

export type MetaAttributes = DetailedHTMLProps<
  MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>;
export type LinkAttributes = DetailedHTMLProps<
  LinkHTMLAttributes<HTMLLinkElement>,
  HTMLLinkElement
>;
export type ScriptAttributes = DetailedHTMLProps<
  ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>;
export type StyleAttributes = DetailedHTMLProps<
  StyleHTMLAttributes<HTMLStyleElement>,
  HTMLStyleElement
>;

export interface AttributeTypeMap {
  meta: MetaAttributes;
  link: LinkAttributes;
  script: ScriptAttributes;
  style: StyleAttributes;
}

export type HeadElement<
  T extends keyof AttributeTypeMap = keyof AttributeTypeMap,
> = {
  type: T;
  attributes: AttributeTypeMap[T];
};

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
export type HeadTitleAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTitleElement>,
  HTMLTitleElement
>;

export interface HeadAttributeTypeMap {
  meta: HeadMetaAttributes;
  link: HeadLinkAttributes;
  script: HeadScriptAttributes;
  style: HeadStyleAttributes;
  title: HeadTitleAttributes;
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
 * Viewport configuration options
 */
export interface ViewportOptions {
  width?: 'device-width' | number | (string & {});
  height?: 'device-height' | number | (string & {});
  initialScale?: number;
  minimumScale?: number;
  maximumScale?: number;
  userScalable?: boolean;
  viewportFit?: 'auto' | 'cover' | 'contain';
  interactiveWidget?: 'resizes-visual' | 'resizes-content' | 'overlays-content';
}

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

type ArticleMetadataProperty =
  | { name: 'article:published_time'; content: string }
  | { name: 'article:modified_time'; content: string }
  | { name: 'article:expiration_time'; content: string }
  | { name: 'article:author'; content: string }
  | { name: 'article:section'; content: string }
  | { name: 'article:tag'; content: string };

type BookMetadataProperty =
  | { name: 'book:isbn'; content: string }
  | { name: 'book:release_date'; content: string }
  | { name: 'book:author'; content: string }
  | { name: 'book:tag'; content: string };

type ProfileMetadataProperty =
  | { name: 'profile:first_name'; content: string }
  | { name: 'profile:last_name'; content: string }
  | { name: 'profile:username'; content: string }
  | { name: 'profile:gender'; content: string };

type MusicSongMetadataProperty =
  | { name: 'music:duration'; content: string }
  | { name: 'music:album'; content: string }
  | { name: 'music:album:disc'; content: string }
  | { name: 'music:album:track'; content: string }
  | { name: 'music:musician'; content: string };

type MusicAlbumMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:musician'; content: string }
  | { name: 'music:release_date'; content: string };

type MusicPlaylistMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:creator'; content: string };

interface MusicRadioStationMetadataProperty {
  name: 'music:creator';
  content: string;
}

type VideoMovieProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

type VideoEpisodeMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string }
  | { name: 'video:series'; content: string };

type VideoTvShowMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

type VideoOtherMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

type OpenGraphTypeProperty =
  | { name: 'article'; properties: ArticleMetadataProperty[] }
  | { name: 'book'; properties: BookMetadataProperty[] }
  | { name: 'music.song'; properties: MusicSongMetadataProperty[] }
  | { name: 'music.album'; properties: MusicAlbumMetadataProperty[] }
  | { name: 'music.playlist'; properties: MusicPlaylistMetadataProperty[] }
  | {
      name: 'music.radio_station';
      properties: MusicRadioStationMetadataProperty[];
    }
  | { name: 'profile'; properties: ProfileMetadataProperty[] }
  | { name: 'video.tv_show'; properties: VideoTvShowMetadataProperty[] }
  | { name: 'video.other'; properties: VideoOtherMetadataProperty[] }
  | { name: 'video.movie'; properties: VideoMovieProperty[] }
  | { name: 'video.episode'; properties: VideoEpisodeMetadataProperty[] }
  | { name: 'website' };

/**
 * OpenGraph metadata options
 * @see https://ogp.me/
 */
export interface OpenGraphOptions {
  title?: string;
  description?: string;
  url?: string;
  locale?: string;
  image?: {
    url: string | URL;
    alt?: string;
    type?: string;
    width?: number;
    height?: number;
  };
  type?: OpenGraphTypeProperty;
}

/**
 * Meta element attributes with full React HTML type support.
 */
export type HeadMetaAttributes = React.DetailedHTMLProps<
  React.MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>;

/**
 * Link element attributes with full React HTML type support.
 */
export type HeadLinkAttributes = React.DetailedHTMLProps<
  React.LinkHTMLAttributes<HTMLLinkElement>,
  HTMLLinkElement
>;

/**
 * Script element attributes with full React HTML type support.
 */
export type HeadScriptAttributes = React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>;

/**
 * Style element attributes with full React HTML type support.
 */
export type HeadStyleAttributes = React.DetailedHTMLProps<
  React.StyleHTMLAttributes<HTMLStyleElement>,
  HTMLStyleElement
>;

/**
 * Title element attributes with full React HTML type support.
 */
export type HeadTitleAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLTitleElement>,
  HTMLTitleElement
>;

/**
 * Mapping of HTML head element types to their respective attribute types.
 */
export interface HeadAttributeTypeMap {
  meta: HeadMetaAttributes;
  link: HeadLinkAttributes;
  script: HeadScriptAttributes;
  style: HeadStyleAttributes;
  title: HeadTitleAttributes;
}

/**
 * Represents a single HTML head element with its type and attributes.
 *
 * @template T - The element type (meta, link, script, style, or title)
 */
export type HeadElement<
  T extends keyof HeadAttributeTypeMap = keyof HeadAttributeTypeMap,
> = {
  type: T;
  attributes: HeadAttributeTypeMap[T];
};

/**
 * Adapter interface for transforming head elements into framework-specific formats.
 *
 * @template T - The output type returned by the adapter
 */
export interface HeadAdapter<T> {
  transform(elements: HeadElement[]): T;
}

/**
 * Character encoding type with autocomplete for common charsets while allowing any string value.
 */
export type CharSet = 'utf-8' | (string & {});

/**
 * Color scheme preference indicating which color schemes the document supports.
 */
export type ColorScheme =
  | 'light'
  | 'dark'
  | 'light dark'
  | 'dark light'
  | 'only light'
  | 'only dark'
  | 'normal'
  | (string & {});

/**
 * Title configuration with support for templated titles using a template string and default title value.
 */
export type TitleOptions = { template: string; default: string };

/**
 * Viewport configuration for responsive web design and mobile optimization.
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
 * Robots directives for controlling search engine crawling and indexing behavior.
 */
export interface RobotsOptions {
  index?: boolean;
  follow?: boolean;
  [key: string]: boolean | string | number | undefined;
}

/**
 * Open Graph article metadata properties for news articles, blog posts, and written content.
 */
type ArticleMetadataProperty =
  | { name: 'article:published_time'; content: string }
  | { name: 'article:modified_time'; content: string }
  | { name: 'article:expiration_time'; content: string }
  | { name: 'article:author'; content: string }
  | { name: 'article:section'; content: string }
  | { name: 'article:tag'; content: string };

/**
 * Open Graph book metadata properties for books and publications.
 */
type BookMetadataProperty =
  | { name: 'book:isbn'; content: string }
  | { name: 'book:release_date'; content: string }
  | { name: 'book:author'; content: string }
  | { name: 'book:tag'; content: string };

/**
 * Open Graph profile metadata properties for user profiles and personal pages.
 */
type ProfileMetadataProperty =
  | { name: 'profile:first_name'; content: string }
  | { name: 'profile:last_name'; content: string }
  | { name: 'profile:username'; content: string }
  | { name: 'profile:gender'; content: string };

/**
 * Open Graph music.song metadata properties for individual music tracks.
 */
type MusicSongMetadataProperty =
  | { name: 'music:duration'; content: string }
  | { name: 'music:album'; content: string }
  | { name: 'music:album:disc'; content: string }
  | { name: 'music:album:track'; content: string }
  | { name: 'music:musician'; content: string };

/**
 * Open Graph music.album metadata properties for music albums.
 */
type MusicAlbumMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:musician'; content: string }
  | { name: 'music:release_date'; content: string };

/**
 * Open Graph music.playlist metadata properties for music playlists.
 */
type MusicPlaylistMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:creator'; content: string };

/**
 * Open Graph music.radio_station metadata properties for radio stations.
 */
interface MusicRadioStationMetadataProperty {
  name: 'music:creator';
  content: string;
}

/**
 * Open Graph video.movie metadata properties for movies.
 */
type VideoMovieProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

/**
 * Open Graph video.episode metadata properties for TV show episodes.
 */
type VideoEpisodeMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string }
  | { name: 'video:series'; content: string };

/**
 * Open Graph video.tv_show metadata properties for TV shows.
 */
type VideoTvShowMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

/**
 * Open Graph video.other metadata properties for video content not categorized as movie, episode, or TV show.
 */
type VideoOtherMetadataProperty =
  | { name: 'video:actor'; content: string }
  | { name: 'video:actor:role'; content: string }
  | { name: 'video:director'; content: string }
  | { name: 'video:writer'; content: string }
  | { name: 'video:duration'; content: string }
  | { name: 'video:release_date'; content: string }
  | { name: 'video:tag'; content: string };

/**
 * Open Graph content type with optional type-specific metadata properties.
 */
type OpenGraphType =
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
 * Open Graph metadata configuration for rich social media previews.
 */
export interface OpenGraphOptions {
  title?: string;
  description?: string;
  url?: string | URL;
  locale?: string;
  image?: {
    url: string | URL;
    alt?: string;
    type?: string;
    width?: number;
    height?: number;
  };
  type?: OpenGraphType;
}

/**
 * Twitter player card metadata properties for video and audio content.
 */
type TwitterPlayerProperty =
  | { name: 'twitter:player'; content: string | URL }
  | { name: 'twitter:player:width'; content: number }
  | { name: 'twitter:player:height'; content: number }
  | { name: 'twitter:player:stream'; content: string | URL };

/**
 * Twitter app card metadata properties for mobile app installations.
 */
type TwitterAppProperty =
  | { name: 'twitter:app:id:iphone'; content: string | number }
  | { name: 'twitter:app:id:ipad'; content: string | number }
  | { name: 'twitter:app:id:googleplay'; content: string }
  | { name: 'twitter:app:url:iphone'; content: string | URL }
  | { name: 'twitter:app:url:ipad'; content: string | URL }
  | { name: 'twitter:app:url:googleplay'; content: string | URL }
  | { name: 'twitter:app:name:iphone'; content: string }
  | { name: 'twitter:app:name:ipad'; content: string }
  | { name: 'twitter:app:name:googleplay'; content: string }
  | { name: 'twitter:app:country'; content: string };

/**
 * Twitter Card type with optional card-specific metadata.
 */
type TwitterCard =
  | { name: 'summary' }
  | { name: 'summary_large_image' }
  | {
      name: 'player';
      properties: TwitterPlayerProperty[];
    }
  | {
      name: 'app';
      properties: TwitterAppProperty[];
    };

/**
 * Twitter Card metadata configuration for rich previews on Twitter/X.
 */
export interface TwitterOptions {
  title?: string;
  description?: string;
  site?: string;
  siteId?: string;
  creator?: string;
  creatorId?: string;
  image?: {
    url: string | URL;
    alt?: string;
  };
  card?: TwitterCard;
}

/**
 * Locale key type supporting 'x-default', specific locale strings, or custom values.
 */
type AlternateLocaleKey<TLocale extends string> =
  | ('x-default' | TLocale)
  | (string & {});

/**
 * Alternate locale/language mapping for internationalization, linking language codes to their corresponding URLs.
 */
export type AlternateLocaleOptions<TLocale extends string> = Record<
  AlternateLocaleKey<TLocale>,
  string | URL
>;

/**
 * Icon preset type with autocomplete for common icon types while allowing custom values.
 */
export type IconPreset = 'icon' | 'apple' | 'shortcut' | (string & {});

/**
 * Icon configuration with href required and rel determined by the preset parameter.
 */
export type IconOptions = Omit<HeadAttributeTypeMap['link'], 'rel' | 'href'> & {
  href: string | URL;
};

/**
 * Stylesheet configuration with additional link attributes, excluding rel and href which are set automatically.
 */
export type StylesheetOptions = Omit<HeadLinkAttributes, 'rel' | 'href'>;

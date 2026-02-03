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

/**
 * OpenGraph article metadata properties
 * Used for news articles, blog posts, and other written content
 * @see https://ogp.me/#type_article
 */
type ArticleMetadataProperty =
  | { name: 'article:published_time'; content: string }
  | { name: 'article:modified_time'; content: string }
  | { name: 'article:expiration_time'; content: string }
  | { name: 'article:author'; content: string }
  | { name: 'article:section'; content: string }
  | { name: 'article:tag'; content: string };

/**
 * OpenGraph book metadata properties
 * Used for books and publications
 * @see https://ogp.me/#type_book
 */
type BookMetadataProperty =
  | { name: 'book:isbn'; content: string }
  | { name: 'book:release_date'; content: string }
  | { name: 'book:author'; content: string }
  | { name: 'book:tag'; content: string };

/**
 * OpenGraph profile metadata properties
 * Used for user profiles and personal pages
 * @see https://ogp.me/#type_profile
 */
type ProfileMetadataProperty =
  | { name: 'profile:first_name'; content: string }
  | { name: 'profile:last_name'; content: string }
  | { name: 'profile:username'; content: string }
  | { name: 'profile:gender'; content: string };

/**
 * OpenGraph music.song metadata properties
 * Used for individual music songs
 * @see https://ogp.me/#type_music.song
 */
type MusicSongMetadataProperty =
  | { name: 'music:duration'; content: string }
  | { name: 'music:album'; content: string }
  | { name: 'music:album:disc'; content: string }
  | { name: 'music:album:track'; content: string }
  | { name: 'music:musician'; content: string };

/**
 * OpenGraph music.album metadata properties
 * Used for music albums
 * @see https://ogp.me/#type_music.album
 */
type MusicAlbumMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:musician'; content: string }
  | { name: 'music:release_date'; content: string };

/**
 * OpenGraph music.playlist metadata properties
 * Used for music playlists
 * @see https://ogp.me/#type_music.playlist
 */
type MusicPlaylistMetadataProperty =
  | { name: 'music:song'; content: string }
  | { name: 'music:song:disc'; content: string }
  | { name: 'music:song:track'; content: string }
  | { name: 'music:creator'; content: string };

/**
 * OpenGraph music.radio_station metadata properties
 * Used for radio stations
 * @see https://ogp.me/#type_music.radio_station
 */
interface MusicRadioStationMetadataProperty {
  name: 'music:creator';
  content: string;
}

/**
 * OpenGraph video.movie metadata properties
 * Used for movies
 * @see https://ogp.me/#type_video.movie
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
 * OpenGraph video.episode metadata properties
 * Used for TV show episodes
 * @see https://ogp.me/#type_video.episode
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
 * OpenGraph video.tv_show metadata properties
 * Used for TV shows
 * @see https://ogp.me/#type_video.tv_show
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
 * OpenGraph video.other metadata properties
 * Used for other video content that doesn't fit into movie, episode, or tv_show
 * @see https://ogp.me/#type_video.other
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
 * OpenGraph type property with optional type-specific metadata
 * Supports all standard OpenGraph content types (article, book, music.*, video.*, profile, website)
 * Each type can include its own specific metadata properties
 * @see https://ogp.me/#types
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
 * OpenGraph metadata options
 * @see https://ogp.me/
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
 * Twitter player card metadata properties
 * Used for video and audio content
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/player-card
 */
type TwitterPlayerProperty =
  | { name: 'twitter:player'; content: string | URL }
  | { name: 'twitter:player:width'; content: number }
  | { name: 'twitter:player:height'; content: number }
  | { name: 'twitter:player:stream'; content: string | URL };

/**
 * Twitter app card metadata properties
 * Used for mobile app installations
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/app-card
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
 * Twitter Card type property with optional card-specific metadata
 * Supports summary, summary_large_image, player, and app card types
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
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
 * Twitter Card metadata options
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
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

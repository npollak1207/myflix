// Minimal subset of Jellyfin's BaseItemDto and friends — expand as needed.

export interface UserData {
  PlaybackPositionTicks?: number
  PlayedPercentage?: number
  Played?: boolean
  IsFavorite?: boolean
}

export interface MediaStream {
  Index: number
  Type: string // Video | Audio | Subtitle | EmbeddedImage
  Codec?: string
  Language?: string
  DisplayTitle?: string
  IsDefault?: boolean
  IsExternal?: boolean
  IsForced?: boolean
  IsTextSubtitleStream?: boolean
  Channels?: number
  Height?: number
  Width?: number
  VideoRange?: string // SDR | HDR
  VideoRangeType?: string // HDR10 | DOVI | HLG | ...
}

export interface MediaSource {
  Id: string
  Name?: string
  Container?: string
  SupportsDirectPlay?: boolean
  SupportsDirectStream?: boolean
  SupportsTranscoding?: boolean
  TranscodingUrl?: string
  TranscodingContainer?: string
  MediaStreams?: MediaStream[]
  DefaultAudioStreamIndex?: number
  DefaultSubtitleStreamIndex?: number
}

export interface Person {
  Id: string
  Name: string
  Role?: string
  Type: string // Actor | Director | Writer | Producer | ...
  PrimaryImageTag?: string
}

export interface Chapter {
  StartPositionTicks: number
  Name?: string
  ImageTag?: string
}

export interface NameIdPair {
  Id: string
  Name: string
}

export interface BaseItemDto {
  Id: string
  Name: string
  Type: string // Movie | Series | Episode | BoxSet | CollectionFolder | ...
  CollectionType?: string // movies | tvshows | music | ...
  Overview?: string
  ProductionYear?: number
  RunTimeTicks?: number
  CommunityRating?: number
  OfficialRating?: string
  // TV hierarchy
  IndexNumber?: number // episode number (or season number on a Season)
  ParentIndexNumber?: number // season number on an Episode
  SeriesName?: string
  SeriesId?: string
  SeasonName?: string
  SeasonId?: string
  Genres?: string[]
  GenreItems?: NameIdPair[]
  Studios?: NameIdPair[]
  Taglines?: string[]
  CriticRating?: number
  People?: Person[]
  Chapters?: Chapter[]
  ChildCount?: number
  RemoteTrailers?: { Url: string; Name?: string }[]
  ImageTags?: Record<string, string>
  // { Primary: { <imageTag>: <hash> }, Backdrop: {...}, ... }
  ImageBlurHashes?: Record<string, Record<string, string>>
  BackdropImageTags?: string[]
  UserData?: UserData
  MediaSources?: MediaSource[]
  // Present on list responses when Fields=MediaStreams is requested.
  MediaStreams?: MediaStream[]
}

export interface ItemsResponse {
  Items: BaseItemDto[]
  TotalRecordCount: number
}

export interface PlaybackInfoResponse {
  MediaSources: MediaSource[]
  PlaySessionId: string
}

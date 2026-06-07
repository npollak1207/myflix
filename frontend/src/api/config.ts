// Same-origin base path. In dev, Vite proxies /jellyfin -> your server.
// In prod, Caddy proxies /jellyfin -> the jellyfin container.
// Requires Jellyfin's "Base URL" to be set to /jellyfin in its dashboard.
export const API_BASE = '/jellyfin'

export const CLIENT_NAME = 'MyFlix'
export const CLIENT_VERSION = '0.1.0'

// Default ("Auto") cap for transcoded streams. ~20 Mbps is a high-quality 1080p.
// The player offers a 4K tier above this; lower tiers for slow connections.
export const STREAM_MAX_BITRATE = 20_000_000

// Cap transcode resolution. Encoding cost scales with pixels, so downscaling 4K
// sources to 1080p is what actually makes software transcoding fast. Set to 0 to
// keep source resolution (e.g. on a Quick Sync server playing to a 4K display).
export const STREAM_MAX_WIDTH = 1920

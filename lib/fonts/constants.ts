export const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

export const FETCH_TIMEOUT = 10_000

export const MAX_IMPORT_DEPTH = 5

export const MAX_CSS_SIZE = 5 * 1024 * 1024 // 5MB

export const FORMAT_PRIORITY: Record<string, number> = {
  woff2: 0,
  woff: 1,
  truetype: 2,
  opentype: 3,
  "embedded-opentype": 4,
  svg: 5,
}

export const EXTENSION_TO_FORMAT: Record<string, string> = {
  ".woff2": "woff2",
  ".woff": "woff",
  ".ttf": "truetype",
  ".otf": "opentype",
  ".eot": "embedded-opentype",
  ".svg": "svg",
}

export const FORMAT_TO_EXTENSION: Record<string, string> = {
  woff2: ".woff2",
  woff: ".woff",
  truetype: ".ttf",
  opentype: ".otf",
  "embedded-opentype": ".eot",
  svg: ".svg",
}

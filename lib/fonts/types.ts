export type FontFormat =
  | "woff2"
  | "woff"
  | "truetype"
  | "opentype"
  | "embedded-opentype"
  | "svg"

export interface FontSource {
  url: string
  format: FontFormat
}

export interface FontVariant {
  weight: string
  style: string
  sources: FontSource[]
  unicodeRange?: string
}

export interface FontFamily {
  family: string
  variants: FontVariant[]
}

export interface ExtractionResult {
  fonts: FontFamily[]
  sourceUrl: string
  errors: string[]
}

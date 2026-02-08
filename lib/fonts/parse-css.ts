import postcss from "postcss"
import type { FontFormat, FontSource, FontVariant } from "./types"
import { EXTENSION_TO_FORMAT } from "./constants"

const SRC_URL_RE =
  /url\(\s*['"]?([^'")\s]+)['"]?\s*\)\s*(?:format\(\s*['"]?([^'")\s]+)['"]?\s*\))?/g

function inferFormat(url: string): FontFormat | null {
  try {
    const pathname = new URL(url, "https://placeholder.com").pathname
    const ext = pathname.substring(pathname.lastIndexOf("."))
    return (EXTENSION_TO_FORMAT[ext] as FontFormat) ?? null
  } catch {
    return null
  }
}

function parseSrcDescriptor(
  src: string,
  stylesheetUrl: string,
): FontSource[] {
  const sources: FontSource[] = []
  let match: RegExpExecArray | null

  SRC_URL_RE.lastIndex = 0
  while ((match = SRC_URL_RE.exec(src)) !== null) {
    const rawUrl = match[1]
    if (rawUrl.startsWith("data:")) continue

    let resolved: string
    try {
      resolved = new URL(rawUrl, stylesheetUrl).href
    } catch {
      continue
    }

    const format =
      (match[2] as FontFormat) ?? inferFormat(rawUrl) ?? "truetype"
    sources.push({ url: resolved, format })
  }

  return sources
}

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, "")
}

export function parseCss(
  cssText: string,
  stylesheetUrl: string,
): FontVariant[] {
  const variants: FontVariant[] = []
  let root: postcss.Root
  try {
    root = postcss.parse(cssText)
  } catch {
    return variants
  }

  root.walkAtRules("font-face", (atRule) => {
    let family = ""
    let weight = "400"
    let style = "normal"
    let src = ""
    let unicodeRange: string | undefined

    atRule.walkDecls((decl) => {
      switch (decl.prop.toLowerCase()) {
        case "font-family":
          family = stripQuotes(decl.value)
          break
        case "font-weight":
          weight = decl.value
          break
        case "font-style":
          style = decl.value
          break
        case "src":
          src = decl.value
          break
        case "unicode-range":
          unicodeRange = decl.value
          break
      }
    })

    if (!family || !src) return

    const sources = parseSrcDescriptor(src, stylesheetUrl)
    if (sources.length === 0) return

    variants.push({ weight, style, sources, unicodeRange })
    // Attach family name for later grouping
    ;(variants[variants.length - 1] as FontVariant & { _family: string })._family = family
  })

  return variants
}

export function extractImportUrls(
  cssText: string,
  stylesheetUrl: string,
): string[] {
  const urls: string[] = []
  let root: postcss.Root
  try {
    root = postcss.parse(cssText)
  } catch {
    return urls
  }

  root.walkAtRules("import", (atRule) => {
    const match = atRule.params.match(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)|['"]([^'"]+)['"]/)
    if (match) {
      const rawUrl = match[1] ?? match[2]
      try {
        urls.push(new URL(rawUrl, stylesheetUrl).href)
      } catch {
        // ignore invalid URLs
      }
    }
  })

  return urls
}

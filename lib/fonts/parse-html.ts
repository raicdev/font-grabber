import { parse as parseHtml } from "node-html-parser"
import { EXTENSION_TO_FORMAT } from "./constants"

export interface HtmlParseResult {
  stylesheetUrls: string[]
  inlineCss: string[]
  preloadedFontUrls: string[]
}

export function parseHtmlForFonts(
  html: string,
  pageUrl: string,
): HtmlParseResult {
  const root = parseHtml(html)
  const stylesheetUrls: string[] = []
  const inlineCss: string[] = []
  const preloadedFontUrls: string[] = []

  // Extract all <link> tags
  for (const link of root.querySelectorAll("link")) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase()
    const href = link.getAttribute("href")
    if (!href) continue

    let resolved: string
    try {
      resolved = new URL(href, pageUrl).href
    } catch {
      continue
    }

    // Stylesheet links (including Google Fonts, Typekit, self-hosted CSS, etc.)
    if (rel.includes("stylesheet")) {
      stylesheetUrls.push(resolved)
    }

    // Preloaded font files
    const asAttr = (link.getAttribute("as") ?? "").toLowerCase()
    if (rel.includes("preload") && asAttr === "font") {
      preloadedFontUrls.push(resolved)
    }
  }

  // Extract @import from <style> blocks and collect inline CSS
  for (const style of root.querySelectorAll("style")) {
    const text = style.textContent
    if (!text) continue
    inlineCss.push(text)

    // Also extract @import URLs from inline styles
    const importRe = /@import\s+(?:url\(\s*['"]?([^'")\s]+)['"]?\s*\)|['"]([^'"]+)['"])/g
    let match: RegExpExecArray | null
    while ((match = importRe.exec(text)) !== null) {
      const rawUrl = match[1] ?? match[2]
      try {
        stylesheetUrls.push(new URL(rawUrl, pageUrl).href)
      } catch {
        // ignore invalid URLs
      }
    }
  }

  return { stylesheetUrls, inlineCss, preloadedFontUrls }
}

export function inferFormatFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url, "https://placeholder.com").pathname
    const ext = pathname.substring(pathname.lastIndexOf(".")).toLowerCase()
    return EXTENSION_TO_FORMAT[ext] ?? null
  } catch {
    return null
  }
}

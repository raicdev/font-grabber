import { BROWSER_UA, FETCH_TIMEOUT, FORMAT_PRIORITY, MAX_CSS_SIZE, MAX_IMPORT_DEPTH } from "./constants"
import { extractImportUrls, parseCss } from "./parse-css"
import { inferFormatFromUrl, parseHtmlForFonts } from "./parse-html"
import type { ExtractionResult, FontFamily, FontFormat, FontVariant } from "./types"

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": BROWSER_UA },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  })
}

async function fetchCss(
  url: string,
  visited: Set<string>,
  depth: number,
  errors: string[],
): Promise<{ css: string; url: string }[]> {
  if (depth > MAX_IMPORT_DEPTH || visited.has(url)) return []
  visited.add(url)

  let cssText: string
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) {
      errors.push(`Failed to fetch stylesheet: ${url} (${res.status})`)
      return []
    }
    const contentLength = res.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > MAX_CSS_SIZE) {
      errors.push(`Stylesheet too large, skipping: ${url}`)
      return []
    }
    cssText = await res.text()
  } catch (e) {
    errors.push(`Error fetching stylesheet: ${url} - ${e instanceof Error ? e.message : String(e)}`)
    return []
  }

  const results = [{ css: cssText, url }]

  // Follow @import rules
  const importUrls = extractImportUrls(cssText, url)
  const nested = await Promise.all(
    importUrls.map((importUrl) => fetchCss(importUrl, visited, depth + 1, errors)),
  )
  for (const n of nested) {
    results.push(...n)
  }

  return results
}

type VariantWithFamily = FontVariant & { _family: string }

function groupIntoFamilies(variants: VariantWithFamily[]): FontFamily[] {
  const map = new Map<string, FontFamily>()

  for (const v of variants) {
    const family = v._family
    if (!map.has(family)) {
      map.set(family, { family, variants: [] })
    }
    const { _family: _, ...variant } = v
    map.get(family)!.variants.push(variant)
  }

  // Sort sources within each variant by format priority
  for (const fam of map.values()) {
    for (const v of fam.variants) {
      v.sources.sort(
        (a, b) => (FORMAT_PRIORITY[a.format] ?? 99) - (FORMAT_PRIORITY[b.format] ?? 99),
      )
    }
  }

  return Array.from(map.values())
}

function deduplicateFamilies(families: FontFamily[]): FontFamily[] {
  const map = new Map<string, FontFamily>()

  for (const fam of families) {
    if (!map.has(fam.family)) {
      map.set(fam.family, { family: fam.family, variants: [] })
    }
    const existing = map.get(fam.family)!

    for (const variant of fam.variants) {
      const key = `${variant.weight}|${variant.style}|${variant.sources[0]?.url}`
      const alreadyExists = existing.variants.some((v) => {
        const vKey = `${v.weight}|${v.style}|${v.sources[0]?.url}`
        return vKey === key
      })
      if (!alreadyExists) {
        existing.variants.push(variant)
      }
    }
  }

  return Array.from(map.values())
}

export async function extractFonts(targetUrl: string): Promise<ExtractionResult> {
  const errors: string[] = []

  // Step 1: Fetch the HTML page
  let html: string
  try {
    const res = await fetchWithTimeout(targetUrl)
    if (!res.ok) {
      return { fonts: [], sourceUrl: targetUrl, errors: [`Failed to fetch page: ${res.status}`] }
    }
    html = await res.text()
  } catch (e) {
    return {
      fonts: [],
      sourceUrl: targetUrl,
      errors: [`Error fetching page: ${e instanceof Error ? e.message : String(e)}`],
    }
  }

  // Step 2: Parse HTML for stylesheets, inline CSS, and preloaded fonts
  const { stylesheetUrls, inlineCss, preloadedFontUrls } = parseHtmlForFonts(html, targetUrl)

  // Step 3: Fetch all external stylesheets
  const visited = new Set<string>()
  const cssResults = await Promise.all(
    stylesheetUrls.map((url) => fetchCss(url, visited, 0, errors)),
  )
  const allCss = cssResults.flat()

  // Step 4: Parse all CSS (external + inline) for @font-face
  const allVariants: VariantWithFamily[] = []

  for (const { css, url } of allCss) {
    const variants = parseCss(css, url) as VariantWithFamily[]
    allVariants.push(...variants)
  }

  for (const css of inlineCss) {
    const variants = parseCss(css, targetUrl) as VariantWithFamily[]
    allVariants.push(...variants)
  }

  // Step 5: Group variants into families and deduplicate
  const families = groupIntoFamilies(allVariants)
  const deduplicated = deduplicateFamilies(families)

  // Step 6: Add preloaded font files that weren't already discovered via @font-face
  const knownUrls = new Set(
    deduplicated.flatMap((f) => f.variants.flatMap((v) => v.sources.map((s) => s.url))),
  )
  const unknownPreloads = preloadedFontUrls.filter((u) => !knownUrls.has(u))
  if (unknownPreloads.length > 0) {
    // Group preloaded fonts that weren't matched to any @font-face
    for (const fontUrl of unknownPreloads) {
      const format = (inferFormatFromUrl(fontUrl) ?? "woff2") as FontFormat
      // Try to guess font name from the URL path
      const pathname = new URL(fontUrl).pathname
      const filename = pathname.split("/").pop() ?? "Unknown"
      const family = filename
        .replace(/\.[^.]+$/, "")            // remove extension
        .replace(/[-_]/g, " ")              // normalize separators
        .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces

      deduplicated.push({
        family,
        variants: [
          {
            weight: "400",
            style: "normal",
            sources: [{ url: fontUrl, format }],
          },
        ],
      })
    }
  }

  return {
    fonts: deduplicated,
    sourceUrl: targetUrl,
    errors,
  }
}

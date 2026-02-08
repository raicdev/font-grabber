"use server"

import { extractFonts } from "@/lib/fonts/extract"
import type { ExtractionResult } from "@/lib/fonts/types"

export async function extractFontsAction(
  _prev: ExtractionResult | null,
  formData: FormData,
): Promise<ExtractionResult> {
  const rawUrl = formData.get("url")

  if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return { fonts: [], sourceUrl: "", errors: ["Please enter a URL."] }
  }

  let url = rawUrl.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  try {
    new URL(url)
  } catch {
    return { fonts: [], sourceUrl: url, errors: ["Invalid URL format."] }
  }

  return extractFonts(url)
}

import { NextRequest, NextResponse } from "next/server"
import { zipSync } from "fflate"
import { BROWSER_UA, FETCH_TIMEOUT, FORMAT_TO_EXTENSION } from "@/lib/fonts/constants"

interface FontDownloadItem {
  url: string
  family: string
  weight: string
  style: string
  format: string
}

export async function POST(request: NextRequest) {
  let body: { fonts: FontDownloadItem[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!Array.isArray(body.fonts) || body.fonts.length === 0) {
    return NextResponse.json({ error: "No fonts provided" }, { status: 400 })
  }

  const files: Record<string, Uint8Array> = {}

  const results = await Promise.allSettled(
    body.fonts.map(async (font) => {
      const res = await fetch(font.url, {
        headers: { "User-Agent": BROWSER_UA },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      })
      if (!res.ok) return null

      const buffer = await res.arrayBuffer()
      const ext = FORMAT_TO_EXTENSION[font.format] ?? ".woff2"
      const safeName = font.family.replace(/[^a-zA-Z0-9\s-]/g, "").trim()
      const weightStyle =
        font.style === "italic" ? `${font.weight}italic` : font.weight
      const filename = `${safeName}/${safeName}-${weightStyle}${ext}`

      return { filename, data: new Uint8Array(buffer) }
    }),
  )

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      files[result.value.filename] = result.value.data
    }
  }

  if (Object.keys(files).length === 0) {
    return NextResponse.json({ error: "Failed to download any fonts" }, { status: 502 })
  }

  const zipped = zipSync(files, { level: 0 })

  return new NextResponse(zipped.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="fonts.zip"',
    },
  })
}

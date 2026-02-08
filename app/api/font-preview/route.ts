import { NextRequest, NextResponse } from "next/server"
import { BROWSER_UA, FETCH_TIMEOUT } from "@/lib/fonts/constants"

const FORMAT_CONTENT_TYPE: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  truetype: "font/ttf",
  opentype: "font/otf",
  "embedded-opentype": "application/vnd.ms-fontobject",
  svg: "image/svg+xml",
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  const format = request.nextUrl.searchParams.get("format") ?? "woff2"

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream returned ${res.status}` }, { status: 502 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = FORMAT_CONTENT_TYPE[format] ?? "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch font" },
      { status: 502 },
    )
  }
}

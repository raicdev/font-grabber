"use client"

import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { FontFamily } from "@/lib/fonts/types"
import { FORMAT_TO_EXTENSION } from "@/lib/fonts/constants"

interface DownloadButtonProps {
  fonts: FontFamily[]
  label?: string
}

export function DownloadButton({ fonts, label }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const items = fonts.flatMap((fam) =>
        fam.variants.map((v) => ({
          url: v.sources[0].url,
          family: fam.family,
          weight: v.weight,
          style: v.style,
          format: v.sources[0].format,
        })),
      )

      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fonts: items }),
      })

      if (!res.ok) throw new Error("Download failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fonts.length === 1 ? `${fonts[0].family}.zip` : "fonts.zip"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? <Loader2 className="animate-spin" /> : <Download />}
      {label ?? "Download"}
    </Button>
  )
}

interface SingleFontDownloadProps {
  family: string
  url: string
  format: string
  weight: string
  style: string
}

export function SingleFontDownload({
  family,
  url,
  format,
  weight,
  style,
}: SingleFontDownloadProps) {
  const ext = FORMAT_TO_EXTENSION[format] ?? ".woff2"
  const proxyUrl = `/api/font-preview?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`
  const weightStyle = style === "italic" ? `${weight}italic` : weight
  const filename = `${family}-${weightStyle}${ext}`

  return (
    <Button variant="ghost" size="xs" asChild>
      <a href={proxyUrl} download={filename}>
        <Download />
        {format}
      </a>
    </Button>
  )
}

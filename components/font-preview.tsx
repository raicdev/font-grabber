"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface FontPreviewProps {
  family: string
  previewUrl: string
  format: string
}

export function FontPreview({ family, previewUrl, format }: FontPreviewProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const uniqueFamily = `preview-${family.replace(/\s+/g, "-")}-${previewUrl.slice(-8)}`

  useEffect(() => {
    const proxyUrl = `/api/font-preview?url=${encodeURIComponent(previewUrl)}&format=${encodeURIComponent(format)}`

    const style = document.createElement("style")
    style.textContent = `
      @font-face {
        font-family: '${uniqueFamily}';
        src: url('${proxyUrl}') format('${format}');
        font-display: swap;
      }
    `
    document.head.appendChild(style)
    styleRef.current = style

    const face = new FontFace(uniqueFamily, `url(${proxyUrl})`)
    face
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace)
        setLoaded(true)
      })
      .catch(() => {
        setError(true)
      })

    return () => {
      style.remove()
    }
  }, [uniqueFamily, previewUrl, format])

  if (error) {
    return <p className="text-muted-foreground text-sm italic">Preview unavailable</p>
  }

  if (!loaded) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <p
      className="text-2xl leading-relaxed truncate"
      style={{ fontFamily: `'${uniqueFamily}', sans-serif` }}
    >
      The quick brown fox jumps over the lazy dog
    </p>
  )
}

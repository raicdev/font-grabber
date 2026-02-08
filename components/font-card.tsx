"use client"

import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FontPreview } from "@/components/font-preview"
import { DownloadButton, SingleFontDownload } from "@/components/download-button"
import type { FontFamily } from "@/lib/fonts/types"

interface FontCardProps {
  font: FontFamily
}

function weightLabel(weight: string): string {
  const map: Record<string, string> = {
    "100": "Thin",
    "200": "ExtraLight",
    "300": "Light",
    "400": "Regular",
    "500": "Medium",
    "600": "SemiBold",
    "700": "Bold",
    "800": "ExtraBold",
    "900": "Black",
  }
  return map[weight] ?? weight
}

export function FontCard({ font }: FontCardProps) {
  // Pick the first variant for preview
  const previewVariant = font.variants.find((v) => v.weight === "400" && v.style === "normal")
    ?? font.variants[0]
  const previewSource = previewVariant?.sources[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{font.family}</CardTitle>
        <CardAction>
          <DownloadButton fonts={[font]} label="Download" />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewSource && (
          <FontPreview
            family={font.family}
            previewUrl={previewSource.url}
            format={previewSource.format}
          />
        )}

        <div className="space-y-2">
          {font.variants.map((variant, i) => (
            <div
              key={`${variant.weight}-${variant.style}-${i}`}
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <Badge variant="secondary">
                {weightLabel(variant.weight)}
                {variant.style === "italic" ? " Italic" : ""}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {variant.sources.length} format{variant.sources.length > 1 ? "s" : ""}
              </span>
              <div className="flex gap-1">
                {variant.sources.map((source) => (
                  <SingleFontDownload
                    key={source.url}
                    family={font.family}
                    url={source.url}
                    format={source.format}
                    weight={variant.weight}
                    style={variant.style}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

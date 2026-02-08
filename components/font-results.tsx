"use client"

import { FontCard } from "@/components/font-card"
import { DownloadButton } from "@/components/download-button"
import type { ExtractionResult } from "@/lib/fonts/types"

interface FontResultsProps {
  result: ExtractionResult
}

export function FontResults({ result }: FontResultsProps) {
  if (result.errors.length > 0 && result.fonts.length === 0) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        {result.errors.map((err, i) => (
          <p key={i}>{err}</p>
        ))}
      </div>
    )
  }

  if (result.fonts.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No fonts found on this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Found <span className="text-foreground font-medium">{result.fonts.length}</span> font
          {result.fonts.length > 1 ? " families" : " family"}
        </p>
        {result.fonts.length > 1 && (
          <DownloadButton fonts={result.fonts} label="Download All" />
        )}
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-3 text-xs text-yellow-700 dark:text-yellow-400">
          <p className="font-medium mb-1">Some issues occurred:</p>
          {result.errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {result.fonts.map((font) => (
          <FontCard key={font.family} font={font} />
        ))}
      </div>
    </div>
  )
}

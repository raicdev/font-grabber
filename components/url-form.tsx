"use client"

import { useActionState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extractFontsAction } from "@/actions/extract-fonts"
import type { ExtractionResult } from "@/lib/fonts/types"
import { FontResults } from "@/components/font-results"

export function UrlForm() {
  const [result, action, isPending] = useActionState<ExtractionResult | null, FormData>(
    extractFontsAction,
    null,
  )

  return (
    <div className="w-full space-y-8">
      <form action={action} className="flex gap-2">
        <Input
          name="url"
          type="url"
          placeholder="https://example.com"
          required
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search />
          )}
          {isPending ? "Scanning..." : "Grab Fonts"}
        </Button>
      </form>

      {result && <FontResults result={result} />}
    </div>
  )
}

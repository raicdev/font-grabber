import Image from "next/image";
import { UrlForm } from "@/components/url-form";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background font-sans">
      <main className="flex w-full max-w-2xl flex-col gap-10 px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="fixed top-4 right-4">
            <ThemeToggle />
          </div>
          <Logo className="size-20" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Font Grabber</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Enter a website URL to discover and download the fonts it uses.
          </p>
        </div>

        <UrlForm />
      </main>
    </div>
  );
}

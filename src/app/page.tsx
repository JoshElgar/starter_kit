import React from "react";
import Link from "next/link";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FontShowcase } from "../components/FontShowcase";
import { AnimatedWelcome } from "../components/AnimatedWelcome";
// import { AudioVisualizer } from "@/components/AudioVisualizer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 rounded-full border bg-background/80 backdrop-blur shadow-sm">
        <div className="flex h-12 items-center justify-between px-6">
          <nav className="flex items-center space-x-6">
            <Link
              href="/money"
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              )}
            >
              Make money
            </Link>
          </nav>
          <div className="flex mx-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">New Project</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link
              href="/broke"
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              )}
            >
              Stay broke
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="min-h-screen flex justify-center items-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-full flex-col items-center gap-4 text-center">
            <AnimatedWelcome />
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A wonderful idea is born.
            </p>
            <div className="h-4"></div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/money">Make money</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/broke">Stay broke</Link>
              </Button>
            </div>

            {/* Audio visualizer */}
            {/* <div className="relative w-screen h-[200px] mt-8 -mx-4 md:-mx-8 lg:-mx-16">
              <div className="absolute inset-0">
                <AudioVisualizer />
              </div>
            </div> */}

            <div className="mx-auto w-full mt-8">
              <FontShowcase />
            </div>
            <p className="text-sm text-muted-foreground">
              Next.js 14 • Tailwind CSS • shadcn/ui • tRPC • TypeScript • ESLint
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ by{" "}
            <a
              href="https://github.com"
              className="font-medium underline underline-offset-4"
            >
              you
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

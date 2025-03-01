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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">New Project</span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Link
              href="/money"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary"
              )}
            >
              Money
            </Link>
            <Link
              href="/broke"
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              )}
            >
              Broke
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="min-h-screen flex justify-center items-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
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
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-24 border-t">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl leading-[1.1] sm:text-2xl md:text-3xl">
              Typography
            </h2>
          </div>
          <div className="mx-auto max-w-[58rem] mt-8">
            <FontShowcase />
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-12">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-2xl leading-[1.1] sm:text-2xl md:text-3xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              This starter kit includes everything you need to build modern web
              applications.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Next.js 14</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  The React framework for building modern web applications.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tailwind CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  A utility-first CSS framework for rapid UI development.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>shadcn/ui</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautifully designed components built with Radix UI and
                  Tailwind CSS.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>tRPC</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end typesafe APIs made easy.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  A strongly typed programming language that builds on
                  JavaScript.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ESLint</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find and fix problems in your JavaScript code.
                </CardDescription>
              </CardContent>
            </Card>
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

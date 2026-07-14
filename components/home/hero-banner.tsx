"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryHref } from "@/lib/category-utils";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

const AUTOPLAY_MS = 5500;

export function HeroBanner({ slides }: HeroBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-muted">
      <div className="relative h-[280px] sm:h-[360px] lg:h-[440px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.name}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-lg"
              >
                <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Featured Collection
                </span>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.name}
                </h1>
                <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">{slide.description}</p>
                <Button
                  size="lg"
                  className="mt-6 rounded-full"
                  nativeButton={false}
                  render={<Link href={categoryHref(slide.slug)}>Shop Now</Link>}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}

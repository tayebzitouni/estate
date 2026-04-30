import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDzd(value: number, locale = "ar-DZ") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date,
  locale = "th-TH",
  options?: Intl.DateTimeFormatOptions
) {
  return new Date(date).toLocaleDateString(locale, options);
}

export function formatNumber(num: number, locale = "th-TH") {
  return Number(num).toLocaleString(locale);
}

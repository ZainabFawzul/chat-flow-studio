/**
 * @file utils.ts
 * @description Utility functions including cn() for className merging with Tailwind
 * 
 * @dependencies clsx, tailwind-merge
 * @usage Import cn() for conditional className composition
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

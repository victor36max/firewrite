import { twMerge } from 'tailwind-merge'
import { ClassValue, clsx } from 'clsx'

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes))
}

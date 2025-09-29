import { twMerge } from 'tailwind-merge'
import { ClassValue, clsx } from 'clsx'

export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes))
}

export const isValidUrl = (url: string): boolean => {
  const regex =
    /^(https:\/\/)(?:localhost|(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3})|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+))(?::\d{2,5})?(?:[/?#][^\s]*)?$/i
  return regex.test(url)
}

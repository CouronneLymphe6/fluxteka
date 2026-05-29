import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // 'as-needed': default locale (fr) has no prefix → existing URLs unchanged
  // Other locales get prefixed: /en/, /es/, /de/
  localePrefix: 'as-needed',
  localeDetection: false,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

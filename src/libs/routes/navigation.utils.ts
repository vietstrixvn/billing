

/**
 * Check if a pathname matches a navigation item URL
 */
export function isNavItemActive(pathname: string, itemUrl: string): boolean {
  return pathname === itemUrl || pathname.startsWith(itemUrl + '/');
}

/**
 * Transform navigation items to include property ID in URLs
 */

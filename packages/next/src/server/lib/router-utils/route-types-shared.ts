import path from 'path'
import {
  getRouteRegex,
  type Group,
} from '../../../shared/lib/router/utils/route-regex'

export interface RouteInfo {
  path: string
  groups: { [groupName: string]: Group }
}

export interface RouteTypesManifest {
  appRoutes: Record<string, RouteInfo>
  pageRoutes: Record<string, RouteInfo>
  layoutRoutes: Record<string, RouteInfo | (RouteInfo & { slots: string[] })>
  // New: Separate route types for validation
  appPageRoutes: Record<string, RouteInfo>
  appRouteHandlers: Record<string, RouteInfo>
  pagesRouterPages: Record<string, RouteInfo>
  pagesApiRoutes: Record<string, RouteInfo>
  appPaths: Set<string>
  pagePaths: Set<string>
  layoutPaths: Set<string>
  // New: Separate paths for validation
  appPagePaths: Set<string>
  appRouteHandlerPaths: Set<string>
  pagesRouterPagePaths: Set<string>
  pagesApiRoutePaths: Set<string>
}

/**
 * Extracts route parameters from a route pattern
 */
export function extractRouteParams(route: string) {
  const regex = getRouteRegex(route)
  return regex.groups
}

/**
 * Determines if a route should be skipped during type generation
 */
export function shouldSkipRoute(filePath: string): boolean {
  return (
    filePath.includes('(..)') ||
    filePath.includes('(.)') ||
    filePath.includes('(...)') ||
    filePath.includes('@')
  )
}

/**
 * Creates a layout file regex for the given page extensions
 */
export function createLayoutFileRegex(pageExtensions: string[]): RegExp {
  const getExtensionRegexString = (extensions: string[]) =>
    `(?:${extensions.join('|')})`
  return new RegExp(
    `[\\\\/]layout\\.${getExtensionRegexString(pageExtensions)}$`
  )
}

/**
 * Extracts parallel route slot information from a normalized page name
 */
export function extractSlotFromPageName(normalizedPageName: string): {
  parentPath: string
  slotName: string
} | null {
  const slotMatch = normalizedPageName.match(/^(.*)\/(@[^/]+)\//)
  if (slotMatch) {
    const parentPath = slotMatch[1] || '/'
    const slotName = slotMatch[2].substring(1) // Remove '@' prefix
    return { parentPath, slotName }
  }
  return null
}

/**
 * Creates a route info object with path and groups
 */
export function createRouteInfo(
  route: string,
  filePath: string,
  baseDir: string
): RouteInfo {
  return {
    path: path.relative(baseDir, filePath),
    groups: extractRouteParams(route),
  }
}

/**
 * Creates a unified route types manifest from processed route data
 */
export function createUnifiedRouteTypesManifest({
  dir,
  pageRoutes,
  appRoutes,
  layoutRoutes,
  appPaths,
  pagePaths,
  layoutPaths,
}: {
  dir: string
  pageRoutes: Array<{ route: string; filePath: string }>
  appRoutes: Array<{ route: string; filePath: string }>
  layoutRoutes: Array<{
    route: string
    filePath: string
    slots?: string[]
  }>
  appPaths: Set<string>
  pagePaths: Set<string>
  layoutPaths: Set<string>
}): RouteTypesManifest {
  const manifest: RouteTypesManifest = {
    appRoutes: {},
    pageRoutes: {},
    layoutRoutes: {},
    // Initialize new route type categories
    appPageRoutes: {},
    appRouteHandlers: {},
    pagesRouterPages: {},
    pagesApiRoutes: {},
    appPaths,
    pagePaths,
    layoutPaths,
    // Initialize new path categories
    appPagePaths: new Set<string>(),
    appRouteHandlerPaths: new Set<string>(),
    pagesRouterPagePaths: new Set<string>(),
    pagesApiRoutePaths: new Set<string>(),
  }

  // Process page routes (Pages Router)
  for (const { route, filePath } of pageRoutes) {
    if (shouldSkipRoute(filePath)) continue

    const routeInfo = createRouteInfo(route, filePath, dir)
    manifest.pageRoutes[route] = routeInfo

    // Categorize by type
    if (route.startsWith('/api/')) {
      manifest.pagesApiRoutes[route] = routeInfo
      manifest.pagesApiRoutePaths.add(routeInfo.path)
    } else {
      manifest.pagesRouterPages[route] = routeInfo
      manifest.pagesRouterPagePaths.add(routeInfo.path)
    }
  }

  // Process app routes (App Router)
  for (const { route, filePath } of appRoutes) {
    if (shouldSkipRoute(filePath)) continue

    const routeInfo = createRouteInfo(route, filePath, dir)
    manifest.appRoutes[route] = routeInfo

    // Categorize by file type - check if it's route.ts/tsx or page.ts/tsx
    const isRouteHandler = /[/\\]route\.[^.]+$/.test(filePath)

    if (isRouteHandler) {
      manifest.appRouteHandlers[route] = routeInfo
      manifest.appRouteHandlerPaths.add(routeInfo.path)
    } else {
      manifest.appPageRoutes[route] = routeInfo
      manifest.appPagePaths.add(routeInfo.path)
    }
  }

  // Process layout routes
  for (const { route, filePath, slots } of layoutRoutes) {
    if (shouldSkipRoute(filePath)) continue
    const routeInfo = createRouteInfo(route, filePath, dir)

    if (slots && slots.length > 0) {
      manifest.layoutRoutes[route] = {
        ...routeInfo,
        slots: slots.sort(),
      }
    } else {
      manifest.layoutRoutes[route] = routeInfo
    }
  }

  return manifest
}

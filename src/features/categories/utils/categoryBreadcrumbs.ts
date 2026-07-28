import type { CategoryMenuItem } from "../types";


export function findCategoryPath(
  categories: CategoryMenuItem[],
  targetSlug: string,
  currentPath: CategoryMenuItem[] = [],
): CategoryMenuItem[] | null {
  for (const category of categories) {
    // Add the current category to our running path
    const path = [...currentPath, category];

    // If we found our target, return the full path array
    if (category.slug === targetSlug) {
      return path;
    }

    // If there are children, search them recursively
    if (category.children && category.children.length > 0) {
      const foundPath = findCategoryPath(category.children, targetSlug, path);
      if (foundPath) return foundPath;
    }
  }

  return null;
}
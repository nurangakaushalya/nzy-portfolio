import type { Category, Project } from '../types/portfolio';

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function filterPublicProjects(
  projects: Project[],
  selectedCategoryId: string,
  searchQuery: string
): Project[] {
  const query = searchQuery.trim().toLowerCase();

  return sortProjects(projects).filter((project) => {
    if (project.status !== 'published') {
      return false;
    }

    if (selectedCategoryId !== 'all' && project.categoryId !== selectedCategoryId) {
      return false;
    }

    if (!query) {
      return true;
    }

    const matchesTitle = project.title.toLowerCase().includes(query);
    const matchesDescription = project.description.toLowerCase().includes(query);
    return matchesTitle || matchesDescription;
  });
}

export interface CategoryWithCount {
  category: Category;
  publishedCount: number;
  totalCount: number;
  coverThumbnail: string | null;
}

export function getCategoryCounts(
  projects: Project[],
  categories: Category[]
): CategoryWithCount[] {
  const orderedProjects = sortProjects(projects);

  return sortCategories(categories).map((category) => {
    const inCategory = orderedProjects.filter((p) => p.categoryId === category.id);
    const publishedInCategory = inCategory.filter((p) => p.status === 'published');

    return {
      category,
      publishedCount: publishedInCategory.length,
      totalCount: inCategory.length,
      coverThumbnail: publishedInCategory[0]?.thumbnailUrl ?? null,
    };
  });
}

export function canDeleteCategory(
  categoryId: string,
  projects: Project[]
): { allowed: boolean; projectCount: number; reason?: string } {
  const assignedCount = projects.filter((p) => p.categoryId === categoryId).length;
  if (assignedCount > 0) {
    return {
      allowed: false,
      projectCount: assignedCount,
      reason: `Cannot delete this category while ${assignedCount} ${
        assignedCount === 1 ? 'project is' : 'projects are'
      } still assigned to it. Reassign or delete those projects first.`,
    };
  }
  return { allowed: true, projectCount: 0 };
}

export function reorderProjects(
  projects: Project[],
  projectId: string,
  direction: 'up' | 'down'
): Project[] {
  const ordered = sortProjects(projects);
  const index = ordered.findIndex((p) => p.id === projectId);
  if (index === -1) {
    return ordered;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const swapped = [...ordered];
  const current = swapped[index];
  swapped[index] = swapped[targetIndex];
  swapped[targetIndex] = current;

  return swapped.map((item, idx) => ({
    ...item,
    order: idx,
  }));
}

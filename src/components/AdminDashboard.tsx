import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Info,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { Category, PortfolioData, Project } from '../types/portfolio';
import {
  canDeleteCategory,
  reorderProjects,
  sortCategories,
  sortProjects,
} from '../utils/portfolioFilters';
import { ThumbnailImage } from './ThumbnailImage';
import { AdminProjectForm } from './AdminProjectForm';

interface AdminDashboardProps {
  data: PortfolioData;
  storageError: string | null;
  onSaveData: (nextData: PortfolioData) => boolean;
  onResetDemoData: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  storageError,
  onSaveData,
  onResetDemoData,
  onExitAdmin,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const orderedCategories = useMemo(
    () => sortCategories(data.categories),
    [data.categories]
  );
  const orderedProjects = useMemo(
    () => sortProjects(data.projects),
    [data.projects]
  );

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    data.categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [data.categories]);

  const handleSaveProject = (project: Project): boolean => {
    const exists = data.projects.some((p) => p.id === project.id);
    const nextProjects = exists
      ? data.projects.map((p) => (p.id === project.id ? project : p))
      : [...data.projects, project];

    const saved = onSaveData({
      ...data,
      projects: nextProjects,
    });
    if (saved) {
      setEditingProject(null);
      setIsAddingProject(false);
    }
    return saved;
  };

  const handleToggleStatus = (projectId: string) => {
    const nextProjects = data.projects.map((p) =>
      p.id === projectId
        ? { ...p, status: p.status === 'published' ? ('hidden' as const) : ('published' as const) }
        : p
    );
    onSaveData({ ...data, projects: nextProjects });
  };

  const handleMoveProject = (projectId: string, direction: 'up' | 'down') => {
    const nextProjects = reorderProjects(data.projects, projectId, direction);
    onSaveData({ ...data, projects: nextProjects });
  };

  const handleConfirmDeleteProject = () => {
    if (!pendingDeleteProject) {
      return;
    }
    const nextProjects = data.projects
      .filter((p) => p.id !== pendingDeleteProject.id)
      .map((p, idx) => ({ ...p, order: idx }));
    onSaveData({ ...data, projects: nextProjects });
    setPendingDeleteProject(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    setCategoryError(null);

    if (!trimmed) {
      setCategoryError('Enter a category name.');
      return;
    }

    const duplicate = data.categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setCategoryError(`Category "${trimmed}" already exists.`);
      return;
    }

    const nextCategory: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      order: data.categories.length,
    };
    const ok = onSaveData({
      ...data,
      categories: [...data.categories, nextCategory],
    });
    if (ok) {
      setNewCategoryName('');
    }
  };

  const handleCommitRenameCategory = (categoryId: string) => {
    const trimmed = renameDraft.trim();
    setCategoryError(null);

    if (!trimmed) {
      setCategoryError('Category name cannot be empty.');
      return;
    }

    const duplicate = data.categories.some(
      (c) => c.id !== categoryId && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setCategoryError(`Another category is already named "${trimmed}".`);
      return;
    }

    const nextCategories = data.categories.map((c) =>
      c.id === categoryId ? { ...c, name: trimmed } : c
    );
    onSaveData({ ...data, categories: nextCategories });
    setRenamingCategoryId(null);
    setRenameDraft('');
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryError(null);
    const check = canDeleteCategory(category.id, data.projects);
    if (!check.allowed) {
      setCategoryError(check.reason ?? 'Category still contains projects.');
      return;
    }

    const nextCategories = data.categories
      .filter((c) => c.id !== category.id)
      .map((c, idx) => ({ ...c, order: idx }));
    onSaveData({ ...data, categories: nextCategories });
  };

  return (
    <section
      aria-labelledby="admin-heading"
      className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Demo prototype disclaimer */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#FF6A00]/35 bg-[#FF6A00]/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-sm text-white">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A00]" aria-hidden="true" />
          <div>
            <span className="font-semibold">Demo admin · changes saved in this browser</span>
            <p className="mt-0.5 text-xs text-white/70">
              Frontend demonstration only. Production authentication, database persistence, and shared upload storage will be connected later.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExitAdmin}
          className="depth-btn inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium text-[#F1F1F1]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>View public portfolio</span>
        </button>
      </div>

      {storageError && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          <span>{storageError}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1
            id="admin-heading"
            className="font-display text-2xl font-semibold text-white sm:text-3xl"
          >
            Portfolio Manager
          </h1>
          <p className="mt-1 text-sm text-white/60">
            <span className="font-mono tabular-nums">{orderedProjects.length}</span> total projects ·{' '}
            <span className="font-mono tabular-nums">
              {orderedProjects.filter((p) => p.status === 'published').length}
            </span>{' '}
            published
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="depth-btn inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-[#F1F1F1]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset demo data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#181818] px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <span className="text-xs text-white">Restore default 12 projects?</span>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmingReset(false);
                  setEditingProject(null);
                  setIsAddingProject(false);
                }}
                className="depth-btn-active rounded-lg px-2.5 py-1 text-xs"
              >
                Confirm reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="depth-btn rounded-lg px-2.5 py-1 text-xs font-medium text-[#F1F1F1]"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingProject(null);
              setIsAddingProject(true);
            }}
            className="depth-btn-active inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add project</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Project Form */}
      {(isAddingProject || editingProject) && (
        <div className="mb-8">
          <AdminProjectForm
            key={editingProject?.id ?? 'new-project'}
            categories={orderedCategories}
            initialProject={editingProject}
            nextOrder={orderedProjects.length}
            onSave={handleSaveProject}
            onCancel={() => {
              setIsAddingProject(false);
              setEditingProject(null);
            }}
          />
        </div>
      )}

      {/* Delete Project Confirmation Banner */}
      {pendingDeleteProject && (
        <div
          role="alertdialog"
          aria-labelledby="delete-project-title"
          className="mb-6 rounded-xl border border-red-500/45 bg-red-950/35 p-4 sm:p-5"
        >
          <h2 id="delete-project-title" className="font-display text-base font-semibold text-white">
            Delete “{pendingDeleteProject.title}”?
          </h2>
          <p className="mt-1 text-sm text-white/75">
            Deleting a website project removes it from this portfolio only and does not delete its source YouTube video.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConfirmDeleteProject}
              className="inline-flex h-9 items-center rounded-lg bg-[#F1F1F1] px-4 text-xs font-semibold text-[#0F0F0F] hover:bg-white"
            >
              Yes, delete project
            </button>
            <button
              type="button"
              onClick={() => setPendingDeleteProject(null)}
              className="inline-flex h-9 items-center rounded-lg bg-[#272727] px-4 text-xs font-medium text-[#F1F1F1] hover:bg-[#3F3F3F]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Split: Projects List + Categories Manager */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Projects List (8 cols on wide) */}
        <div className="xl:col-span-8">
          <h2 className="font-display mb-4 text-lg font-semibold text-white">
            Projects
          </h2>

          {orderedProjects.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0D0D0D] p-8 text-center text-sm text-white/60">
              No projects found. Click “Add project” or “Reset demo data” to restore demonstration items.
            </div>
          ) : (
            <div className="space-y-3">
              {orderedProjects.map((project, index) => {
                const isFirst = index === 0;
                const isLast = index === orderedProjects.length - 1;
                const catName =
                  categoryNameMap.get(project.categoryId) ?? 'Uncategorized';
                const isPublished = project.status === 'published';

                return (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0D0D0D] p-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#151515]">
                        <ThumbnailImage
                          src={project.thumbnailUrl}
                          alt={project.title}
                          fallbackTitle={project.title}
                          projectType={project.type}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display truncate text-sm font-semibold text-white sm:text-base">
                          {project.title}
                        </h3>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-white/60">
                          <span>{catName}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {project.type === 'video' ? 'Video' : 'Graphic Design'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              isPublished ? 'text-emerald-400' : 'text-amber-300'
                            }`}
                          >
                            {isPublished ? (
                              <Eye className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <EyeOff className="h-3 w-3" aria-hidden="true" />
                            )}
                            <span>{isPublished ? 'Published' : 'Hidden'}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveProject(project.id, 'up')}
                        aria-label={`Move up "${project.title}"`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveProject(project.id, 'down')}
                        aria-label={`Move down "${project.title}"`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(project.id)}
                        aria-label={`${isPublished ? 'Hide' : 'Publish'} "${project.title}"`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#272727] px-2.5 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
                      >
                        {isPublished ? 'Hide' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProject(false);
                          setEditingProject(project);
                        }}
                        aria-label={`Edit "${project.title}"`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#272727] px-2.5 text-xs font-medium text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingDeleteProject(project)}
                        aria-label={`Delete "${project.title}"`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F] hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories Manager (4 cols on wide) */}
        <div className="xl:col-span-4">
          <div className="depth-panel rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">
              Categories
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Changes reflect immediately across filters and public navigation.
            </p>

            <form onSubmit={handleAddCategory} className="mt-4 flex gap-2">
              <label htmlFor="new-category-input" className="sr-only">
                New category name
              </label>
              <input
                id="new-category-input"
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (categoryError) {
                    setCategoryError(null);
                  }
                }}
                placeholder="New category name..."
                className="h-9 flex-1 rounded-xl depth-input px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="depth-btn-active inline-flex h-9 items-center gap-1 rounded-xl px-3.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </form>

            {categoryError && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-950/35 p-3 text-xs text-red-200"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" />
                <span>{categoryError}</span>
              </div>
            )}

            <ul className="mt-4 divide-y divide-white/10">
              {orderedCategories.map((category) => {
                const count = data.projects.filter(
                  (p) => p.categoryId === category.id
                ).length;
                const isRenaming = renamingCategoryId === category.id;

                return (
                  <li key={category.id} className="py-3 first:pt-1 last:pb-1">
                    {isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label={`Rename ${category.name}`}
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          className="h-8 flex-1 rounded border border-[#FF6A00] bg-black px-2.5 text-sm text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommitRenameCategory(category.id)}
                          aria-label={`Save name for ${category.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F1F1] text-[#0F0F0F] hover:bg-white"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {category.name}
                          </p>
                          <p className="font-mono tabular-nums text-xs text-white/50">
                            {count} {count === 1 ? 'project' : 'projects'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryError(null);
                              setRenamingCategoryId(category.id);
                              setRenameDraft(category.name);
                            }}
                            aria-label={`Rename category "${category.name}"`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F]"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            aria-label={`Delete category "${category.name}"`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#272727] text-[#F1F1F1] transition-colors hover:bg-[#3F3F3F] hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export type ProjectType = 'video' | 'design';

export type ProjectStatus = 'published' | 'hidden';

export type NavSection = 'work' | 'services' | 'categories' | 'about' | 'contact' | 'admin';

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  categoryId: string;
  description: string;
  services: string[];
  thumbnailUrl: string;
  youtubeUrl?: string;
  previewUrl?: string;
  fullVideoUrl?: string;
  duration?: string;
  galleryImages?: string[];
  status: ProjectStatus;
  order: number;
  aspectRatio?: '16:9' | '9:16';
  orientation?: 'landscape' | 'portrait';
}

export interface PortfolioData {
  categories: Category[];
  projects: Project[];
}

export interface ContactEnquiryPrefill {
  projectTitle?: string;
  suggestedService?: string;
}

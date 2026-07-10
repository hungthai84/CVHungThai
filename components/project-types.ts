export interface Project {
    id: string;
    title: string;
    description: string;
    group: string;
    stage: string;
    hashtags: string[];
    imageUrl: string;
}

export type ViewMode = 'grid' | 'list' | 'masonry';

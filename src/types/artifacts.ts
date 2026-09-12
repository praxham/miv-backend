export interface ArtifactEntity {
  id: string;

  byArtist: string;

  slug: string;

  images: string;

  title: string;

  category: string;

  description: string;

  amount: number;

  deliverableFileFormats: string;

  deliverableFiles: string;

  isPublished: string;

  createdAt: Date;

  updatedAt: Date;

  page: number;

  limit: number;
}

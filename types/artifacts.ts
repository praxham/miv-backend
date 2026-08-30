import { Artifact } from '@prisma/client';
import { IsNotEmpty, IsString, IsDate, IsNumber } from 'class-validator';

export class ArtifactEntity implements Artifact {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Artist reference is required' })
  byArtist: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString()
  images: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsString()
  deliverableFileFormats: string;

  @IsString()
  deliverableFiles: string;

  @IsString()
  isPublished: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}

import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ArtifactEntity } from 'types/artifacts';

export class CreateArtifactDTO extends PickType(ArtifactEntity, [
  'slug',
  'title',
  'category',
  'description',
  'amount',
  'isPublished',
] as const) {
  @IsNotEmpty({ message: `token is required to create artifact` })
  token: string;

  @IsOptional()
  imageFiles: any;

  @IsOptional()
  deliverableFiles: any;
}

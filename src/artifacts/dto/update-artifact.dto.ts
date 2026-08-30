import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ArtifactEntity } from 'types/artifacts';

export class UpdateArtifactDTO extends PartialType(
  PickType(ArtifactEntity, [
    'id',
    'slug',
    'title',
    'category',
    'description',
    'amount',
    'deliverableFileFormats',
    'deliverableFiles',
    'isPublished',
  ] as const),
) {
  @IsNotEmpty({ message: `token is required to create artifact` })
  token: string;

  @IsOptional()
  imageFiles: any;

  @IsOptional()
  deliverableFiles: any;
}

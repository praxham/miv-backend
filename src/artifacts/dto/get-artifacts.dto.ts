import { PickType } from '@nestjs/mapped-types';
import { ArtifactEntity } from 'types/artifacts';
export class GetArtifactsDTO extends PickType(ArtifactEntity, [
  'byArtist',
  'slug',
  'isPublished',
  'page',
  'limit',
] as const) {}

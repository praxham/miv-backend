export type CommonResponse = {
  status: 200 | 400 | 500;
  success: boolean;
  message: string;
  data?: any;
};

export interface FileValidationOptions {
  maxSizeInMb?: number;
  allowedTypes?: string[];
  message?: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export type AvailabilityField = { slug: string } | { username: string };

export type UserRole = "buyer" | "artist" | "admin" | (string & {});

export type PaymentStatus =
  | "pending_seller_confirmation"
  | "confirmed"
  | "rejected"
  | "failed"
  | (string & {});

export interface User {
  id: string;

  email_id: string;

  otp: string;

  otp_expires_at: Date;

  upi_id: string | null;

  role: UserRole;

  username: string | null;

  profile_photo: string | null;

  wa_number: string | null;

  description: string | null;

  socials: string | null; // Stored as stringified JSON in SQLite

  created_at: Date;

  updated_at: Date;
}

export interface Artifact {
  id: string;

  byArtist: string;

  slug: string;

  images: string; // Stored as stringified JSON in SQLite

  title: string;

  category: string;

  description: string;

  amount: number;

  deliverable_file_formats: string; // Stored as stringified JSON in SQLite

  deliverable_files: string; // Stored as stringified JSON in SQLite

  is_published: string; // "true" | "false" based on schema string default

  createdAt: Date;

  updatedAt: Date;
}

export interface Order {
  id: string;

  artifactId: string;

  soldById: string;

  boughtById: string;

  sellerUpiId: string;

  buyerUpiId: string;

  amount: number;

  utrNumber: string;

  paymentStatus: PaymentStatus;

  createdAt: Date;

  updatedAt: Date;
}

export interface UserWithRelations extends User {
  artifacts?: Artifact[];

  sales?: Order[];

  purchases?: Order[];
}

export interface ArtifactWithRelations extends Artifact {
  artist?: User;

  orders?: Order[];
}

export interface OrderWithRelations extends Order {
  artifact?: Artifact;

  seller?: User;

  buyer?: User;
}

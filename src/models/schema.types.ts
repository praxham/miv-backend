export type UserRole = "buyer" | "artist" | "admin" | (string & {});

export type PaymentStatus =
  | "pending_seller_confirmation"
  | "confirmed"
  | "rejected"
  | "failed"
  | (string & {});

export interface User {
  id: string;

  emailId: string;

  otp: string;

  otp_expires_at: Date;

  upiId: string | null;

  role: UserRole;

  username: string | null;

  profilePhoto: string | null;

  waNumber: string | null;

  description: string | null;

  socials: string | null; // Stored as stringified JSON in SQLite

  createdAt: Date;

  updatedAt: Date;
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

  deliverableFileFormats: string; // Stored as stringified JSON in SQLite

  deliverableFiles: string; // Stored as stringified JSON in SQLite

  isPublished: string; // "true" | "false" based on schema string default

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

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  id?: string;

  role?: UserRole;

  socials?: string | null;
};

export type CreateArtifactInput = Omit<
  Artifact,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;

  images?: string;

  deliverableFileFormats?: string;

  deliverableFiles?: string;

  isPublished?: string;
};

export type CreateOrderInput = Omit<Order, "id" | "createdAt" | "updatedAt"> & {
  id?: string;

  paymentStatus?: PaymentStatus;
};

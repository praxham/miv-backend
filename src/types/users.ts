export interface UserEntity {
  id: string;

  emailId: string;

  otp: string;

  otp_expires_at: Date;

  upiId: string | null;

  role: string;

  username: string | null;

  profilePhoto: string | null;

  waNumber: string | null;

  description: string | null;

  socials: string | null;

  createdAt: Date;

  updatedAt: Date;
}

export type UserRole = "admin" | "staff" | "reader";

export interface User {
  id: string;
  readerId: string | null;
  username: string;
  role: UserRole;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: User;
}

export interface LoginInput {
  username: string;
  password: string;
}

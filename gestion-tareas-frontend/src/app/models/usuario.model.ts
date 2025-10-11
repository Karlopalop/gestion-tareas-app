export interface Usuario {
  id: number;
  username: string;
  email: string;
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
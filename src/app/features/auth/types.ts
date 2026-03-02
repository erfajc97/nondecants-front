export interface LoginPayload {
  email:    string;
  password: string;
  keepSession?: boolean;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}

export interface AuthResponse {
  access_token:  string;
  refresh_token: string;
  user: {
    id:    string;
    name:  string;
    email: string;
    role:  'ADMIN' | 'CLIENT';
  };
}

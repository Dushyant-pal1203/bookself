export interface User {
  id: number;
  email?: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_image_url?: string;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  phone_number?: string;
  otp?: string;
}

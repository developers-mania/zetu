export interface User {
  id: string
  phone: string
  displayName: string | null
  mpesaNumber: string | null
  createdAt: Date
}
 
export interface CreateUserDto {
  phone: string
  password: string
  displayName?: string
}
 
export interface LoginDto {
  phone: string
  password: string
}
 
export interface AuthResponse {
  accessToken: string
  user: Omit<User, 'createdAt'>
}


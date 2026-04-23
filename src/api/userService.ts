import apiClient from './apiClient';
import type { UserCreateDTO, User } from '../types/UserType';

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface UserReadDTO extends User {
  token?: string;
  refreshToken?: string;
  refreshTokenExpiration?: string;
}

export const UserService = {
  async create(userData: UserCreateDTO): Promise<void> {
    const formData = new FormData();

    formData.append('userCreateDTO.FirstName', userData.firstName);
    formData.append('userCreateDTO.LastName', userData.lastName);
    formData.append('userCreateDTO.Email', userData.email);
    formData.append('userCreateDTO.Password', userData.password);
    formData.append('userCreateDTO.UserType', userData.userType.toString());

    if (userData.photo instanceof File) {
      formData.append('image', userData.photo);
    }

    try {
      await apiClient.post('/user', formData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<UserReadDTO> {
    try {
      const response = await apiClient.post<UserReadDTO>('/user/login', {
        email,
        password
      }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Alias for backward compatibility
  async getByEmailAndPassword(email: string, password: string): Promise<UserReadDTO> {
    return this.login(email, password);
  }
};


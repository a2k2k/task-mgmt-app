/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateUserDTO,
  ListResponse,
  UpdateUserDTO,
  UserDetails,
} from '@tma/shared/api-model';
import { BASE_API_URL } from '../models/common';
import { httpDelete, httpGet, httpPOST, httpPUT } from '../utils/Utils';

export const UsersAPIService = {
  getCurrentUser: async (abortSignal?: AbortSignal): Promise<UserDetails> => {
    return httpGet(`${BASE_API_URL}/users/me`, abortSignal);
  },
  createUser: async (
    userDTO: CreateUserDTO,
    abortSignal?: AbortSignal
  ): Promise<UserDetails> => {
    return httpPOST(`${BASE_API_URL}/users`, userDTO, abortSignal);
  },
  updateUser: async (
    userId: string,
    userDTO: UpdateUserDTO,
    abortSignal?: AbortSignal
  ): Promise<UserDetails> => {
    return httpPUT(`${BASE_API_URL}/users/${userId}`, userDTO, abortSignal);
  },
  getUser: async (id: string): Promise<UserDetails> => {
    return httpGet(`${BASE_API_URL}/users/${id}`);
  },
  deleteUser: async (id: string): Promise<any> => {
    return httpDelete(`${BASE_API_URL}/users/${id}`);
  },
  getUsers: async (
    offset: number,
    limit: number,
    abortSignal?: AbortSignal
  ): Promise<ListResponse<UserDetails>> => {
    return httpGet(
      `${BASE_API_URL}/users?offset=${offset}&limit=${limit}`,
      abortSignal
    );
  },
};

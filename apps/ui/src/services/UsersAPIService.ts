import {
  CreateUserDTO,
  ListResponse,
  UserDetails,
} from '@tma/shared/api-model';
import { BASE_API_URL } from '../models/common';
import { httpGet, httpPOST } from '../utils/Utils';

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

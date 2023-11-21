import {
  CreateUserDTO,
  LoginRequest,
  TokenResponse,
} from '@tma/shared/api-model';
import { BASE_API_URL } from '../models/common';

export const AuthAPIService = {
  signin: async (
    userLoginRequest: LoginRequest,
    abortSignal?: AbortSignal
  ): Promise<TokenResponse> => {
    return fetch(`${BASE_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
      body: JSON.stringify(userLoginRequest),
    }).then((res) => {
      if (res.status !== 200) {
        return res.json().then((err) => {
          throw err;
        });
      }
      return res.json();
    });
  },
  signup: async (signupRequest: CreateUserDTO, abortSignal?: AbortSignal) => {
    return fetch(`${BASE_API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal,
      body: JSON.stringify(signupRequest),
    }).then((res) => {
      if (res.status !== 201) {
        return res.json().then((err) => {
          throw err;
        });
      }
      return res.json();
    });
  },
};

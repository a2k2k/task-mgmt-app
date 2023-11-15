import React, { createContext, useContext, useState } from 'react';
import { useCookies } from 'react-cookie';

import { useNavigate } from 'react-router-dom';
import { UsersAPIService } from '../services/UsersAPIService';
import { AuthAPIService } from '../services/AuthAPIService';
import { GlobalContext } from '../utils/GlobalContext';
import {
  CreateUserDTO,
  LoginRequest,
  TokenResponse,
  UserDetails,
} from '@tma/shared/api-model';

export interface AuthService {
  checkUser: () => Promise<UserDetails>;
  login: (loginReq: LoginRequest) => Promise<TokenResponse>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signup: (signupReq: CreateUserDTO) => Promise<any>;
  signout: () => void;
  setUser: (user: UserDetails) => void;
  getToken: () => string;
}

const authContext = createContext({} as AuthService);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthService();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = (): AuthService => {
  return useContext(authContext);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useAuthService(): any {
  const [cookies, setCookie, removeCookie] = useCookies(['Access-Token']);
  const [user, setUser] = useState<UserDetails | null>();
  const navigate = useNavigate();

  async function checkUser() {
    const token = cookies['Access-Token'];
    if (token == null) {
      return Promise.resolve(null);
    }
    if (user != null) {
      return user;
    }

    return UsersAPIService.getCurrentUser()
      .then((user: UserDetails) => {
        setUser(user);
        return user;
      })
      .catch(() => {
        GlobalContext.remove('access_token');
        removeCookie('Access-Token');
        return null;
      });
  }

  async function login(userLoginRequest: LoginRequest) {
    return AuthAPIService.signin(userLoginRequest)
      .then((tokenResponse: TokenResponse) => {
        setCookie('Access-Token', tokenResponse.access_token);
        GlobalContext.set('access_token', tokenResponse.access_token);
        return tokenResponse;
      })
      .catch((err) => Promise.reject(err));
  }

  async function signup(signupRequest: CreateUserDTO) {
    return AuthAPIService.signup(signupRequest)
      .then(() => {
        return Promise.resolve({ status: 'OK' });
      })
      .catch((err) => Promise.resolve({ status: 'ERROR', error: err }));
  }

  function signout() {
    removeCookie('Access-Token');
    GlobalContext.remove('access_token');
    setUser(null);
    navigate('/');
  }

  function getToken() {
    return cookies['Access-Token'];
  }

  return { checkUser, login, signup, signout, setUser, getToken };
}

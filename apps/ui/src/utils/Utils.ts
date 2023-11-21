import moment from 'moment';
import { GlobalContext } from './GlobalContext';

export function buildHttpHeaders(
  post = false,
  overrides?: { [name: string]: string }
): { [name: string]: string } {
  const headers: { [name: string]: string } = {};
  if (post) {
    headers['Content-Type'] = 'application/json';
  }
  const token = GlobalContext.get('access_token');
  if (token != null) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (overrides != null) {
    Object.assign(headers, overrides);
  }
  return headers;
}

export async function httpGet<T>(
  url: string,
  abortSignal?: AbortSignal,
  headers?: { [name: string]: string }
): Promise<T> {
  return fetch(url, {
    headers: buildHttpHeaders(false, headers),
    signal: abortSignal,
  }).then((res) => {
    if (res.status !== 200) {
      return res.json().then((err) => {
        throw err;
      });
    }
    return res.json();
  });
}

export async function httpPOST<X, T>(
  url: string,
  body: X,
  abortSignal?: AbortSignal,
  headers?: { [name: string]: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<T | any> {
  return fetch(url, {
    method: 'POST',
    headers: buildHttpHeaders(true, headers),
    signal: abortSignal,
    body: JSON.stringify(body),
  }).then((res) => {
    if (!(res.status >= 200 && res.status < 300)) {
      return res.json().then((err) => {
        throw err;
      });
    }
    return res;
  });
}

export async function httpPUT<X, T>(
  url: string,
  body: X,
  abortSignal?: AbortSignal,
  headers?: { [name: string]: string }
): Promise<T> {
  return fetch(url, {
    method: 'PUT',
    headers: buildHttpHeaders(true, headers),
    signal: abortSignal,
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
export async function httpDelete<T>(
  url: string,
  abortSignal?: AbortSignal,
  headers?: { [name: string]: string }
): Promise<T> {
  return fetch(url, {
    method: 'DELETE',
    headers: buildHttpHeaders(true, headers),
    signal: abortSignal,
  }).then((res) => res.json());
}

export async function httpPatch<X, T>(
  url: string,
  body: X,
  abortSignal?: AbortSignal,
  headers?: { [name: string]: string }
): Promise<T> {
  return fetch(url, {
    method: 'PATCH',
    headers: buildHttpHeaders(true, headers),
    signal: abortSignal,
    body: JSON.stringify(body),
  }).then((res) => res.json());
}
export function formatDate(date?: number | null) {
  return moment(date).format('yyyy-MM-DD HH:mm:ss');
}

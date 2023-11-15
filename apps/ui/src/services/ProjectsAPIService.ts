import {
  CreateProjectDTO,
  ListResponse,
  ProjectDTO,
} from '@tma/shared/api-model';
import { BASE_API_URL } from '../models/common';
import { buildHttpHeaders, httpPOST } from '../utils/Utils';

export const ProjectsAPIService = {
  createProject: async (
    data: CreateProjectDTO,
    abortSignal?: AbortSignal
  ): Promise<ProjectDTO> => {
    return httpPOST(`${BASE_API_URL}/projects`, data, abortSignal);
  },
  getProjects: async (
    offset: number,
    limit: number,
    abortSignal?: AbortSignal
  ): Promise<ListResponse<ProjectDTO>> => {
    return fetch(`${BASE_API_URL}/projects?offset=${offset}&limit=${limit}`, {
      headers: buildHttpHeaders(),
      signal: abortSignal,
    }).then((res) => res.json());
  },
};

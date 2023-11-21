/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AddProjectMemberDTO,
  CreateProjectDTO,
  CreateTaskDto,
  GenericSuccessResponse,
  ListResponse,
  ProjectDTO,
  ProjectMemberDTO,
  TaskDTO,
  UpdateProjectDTO,
  UpdateTaskDto,
} from '@tma/shared/api-model';
import { BASE_API_URL } from '../models/common';
import {
  httpDelete,
  httpGet,
  httpPOST,
  httpPUT,
  httpPatch,
} from '../utils/Utils';

export const ProjectsAPIService = {
  createProject: async (
    data: CreateProjectDTO,
    abortSignal?: AbortSignal
  ): Promise<ProjectDTO> => {
    return httpPOST(`${BASE_API_URL}/projects`, data, abortSignal);
  },
  updateProject: async (
    projectId: string,
    data: UpdateProjectDTO,
    abortSignal?: AbortSignal
  ): Promise<ProjectDTO> => {
    return httpPatch(`${BASE_API_URL}/projects/${projectId}`, data, abortSignal);
  },
  getProject: async (projectId: string): Promise<ProjectDTO> => {
    return httpGet(`${BASE_API_URL}/projects/${projectId}`);
  },
  createTask: async (
    projectId: string,
    data: CreateTaskDto,
    abortSignal?: AbortSignal
  ): Promise<ProjectDTO> => {
    return httpPOST(
      `${BASE_API_URL}/projects/${projectId}/tasks`,
      data,
      abortSignal
    );
  },
  updateTask: async (
    projectId: string,
    taskId: string,
    data: UpdateTaskDto,
    abortSignal?: AbortSignal
  ): Promise<ProjectDTO> => {
    return httpPatch(
      `${BASE_API_URL}/projects/${projectId}/tasks/${taskId}`,
      data,
      abortSignal
    );
  },
  addMember: async (
    projectId: string,
    data: AddProjectMemberDTO
  ): Promise<GenericSuccessResponse> => {
    return httpPOST(`${BASE_API_URL}/projects/${projectId}/members`, data);
  },
  deleteMember: async (
    projectId: string,
    userId: string
  ): Promise<GenericSuccessResponse> => {
    return httpDelete(
      `${BASE_API_URL}/projects/${projectId}/members/${userId}`
    );
  },
  deleteTask: async (projectId: string, taskId: string): Promise<any> => {
    return httpDelete(`${BASE_API_URL}/projects/${projectId}/tasks/${taskId}`);
  },
  deleteProject: async (projectId: string): Promise<any> => {
    return httpDelete(`${BASE_API_URL}/projects/${projectId}`);
  },
  getProjects: async (
    offset: number,
    limit: number,
    abortSignal?: AbortSignal
  ): Promise<ListResponse<ProjectDTO>> => {
    return httpGet(
      `${BASE_API_URL}/projects?offset=${offset}&limit=${limit}`,
      abortSignal
    );
  },
  getTasks: async (
    projectId: string,
    offset: number,
    limit: number,
    filter: string,
    abortSignal?: AbortSignal
  ): Promise<ListResponse<TaskDTO>> => {
    const flter =
      filter != null && filter.length > 0 ? `&filter=${filter}` : '';
    return httpGet(
      `${BASE_API_URL}/projects/${projectId}/tasks?offset=${offset}&limit=${limit}${flter}`,
      abortSignal
    );
  },
  getMembers: async (
    projectId: string,
    abortSignal?: AbortSignal
  ): Promise<ProjectMemberDTO[]> => {
    return httpGet(
      `${BASE_API_URL}/projects/${projectId}/members`,
      abortSignal
    );
  },
};

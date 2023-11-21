import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AddProjectMemberDTO,
  CreateProjectDTO,
  GenericSuccessResponse,
  ListResponse,
  ProjectDTO,
  ProjectMemberDTO,
  UpdateProjectDTO,
} from '@tma/shared/api-model';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../entities/project.entity';
import { ProjectMemberService } from './project-member.service';
import { User, UserDocument } from '../../entities/user';
import { TasksService } from '../tasks/tasks.service';
import { Task, TaskDocument } from '../../entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly model: Model<ProjectDocument>,
    private readonly memberService: ProjectMemberService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>
  ) {}

  async create(
    createProjectDTO: CreateProjectDTO,
    userId: string
  ): Promise<ProjectDTO> {
    const project = new Project();
    project.name = createProjectDTO.name;
    project.dateCreated = Date.now();
    project.dateModified = project.dateCreated;
    project.createdBy = new mongoose.Types.ObjectId(userId);
    project.modifiedBy = project.createdBy;
    project.active = true;
    project.description = createProjectDTO.description as string;

    const projectDoc = await new this.model(project).save();
    await this.memberService.addOwner(projectDoc, userId);
    return Promise.resolve(
      this.mapProjectEntityToDTO(projectDoc) as ProjectDTO
    );
  }

  async findAll(
    userId: string,
    offset: number,
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: { [key: string]: any }
  ): Promise<ListResponse<ProjectDTO>> {
    const projectList = await this.memberService.getMemberProjects(
      userId,
      offset,
      limit,
      filter
    );
    const listResp: ListResponse<ProjectDTO> = {
      totalItems: projectList.totalItems,
      items: projectList.items.map(
        (project: ProjectDocument) =>
          this.mapProjectEntityToDTO(project) as ProjectDTO
      ),
    };
    return Promise.resolve(listResp);
  }

  async getProject(id: string, userId: string): Promise<ProjectDTO | null> {
    const projectDoc = await this.model
      .findById(id)
      .populate('createdBy', '_id name email username')
      .populate('modifiedBy', '_id name email username')
      .exec();
    if (projectDoc == null) {
      throw new NotFoundException();
    }
    await this.memberService.checkProjectAccess(projectDoc.id, userId);
    return Promise.resolve(this.mapProjectEntityToDTO(projectDoc));
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDTO,
    userId: string
  ): Promise<ProjectDTO> {
    const projectDoc = await this.model.findById(id).exec();
    if (projectDoc == null) {
      throw new NotFoundException();
    }
    await this.memberService.checkProjectAccess(projectDoc.id, userId);
    projectDoc.dateModified = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectDoc.modifiedBy = new mongoose.Types.ObjectId(userId) as any;
    projectDoc.name = updateProjectDto.name;
    projectDoc.description = updateProjectDto.description as string;
    projectDoc.active = updateProjectDto.active;
    await projectDoc.save();
    return Promise.resolve(
      this.mapProjectEntityToDTO(projectDoc) as ProjectDTO
    );
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const projectDoc = await this.model.findById(id).exec();
    if (projectDoc == null) {
      throw new NotFoundException();
    }
    await this.memberService.checkProjectAccess(projectDoc.id, userId);
    const delResult = await this.model.deleteOne({ id: id }).exec();
    await this.taskModel.deleteMany({ projectId: id });
    await this.memberService.deleteProjectEntries(projectDoc.id);
    return Promise.resolve(delResult.deletedCount == 1);
  }

  async getMembers(id: string, userId: string): Promise<ProjectMemberDTO[]> {
    await this.memberService.checkProjectAccess(id, userId, false);
    return this.memberService.getProjectMembers(id);
  }

  async addMember(
    currentUser: string,
    projectId: string,
    member: AddProjectMemberDTO
  ): Promise<GenericSuccessResponse> {
    return this.memberService.updateMember(currentUser, projectId, member);
  }

  async removeMember(
    currentUser: string,
    projectId: string,
    member: string
  ): Promise<GenericSuccessResponse> {
    return this.memberService.removeMember(currentUser, projectId, member);
  }

  private mapProjectEntityToDTO(
    projectDoc: ProjectDocument | null
  ): ProjectDTO | null {
    return projectDoc == null
      ? null
      : {
          id: projectDoc._id,
          createdBy: {
            id: projectDoc.createdBy._id,
            name: projectDoc.createdBy.name,
          },
          dateCreated: projectDoc.dateCreated,
          dateModified: projectDoc.dateModified,
          modifiedBy: {
            id: projectDoc.modifiedBy._id,
            name: projectDoc.modifiedBy.name,
          },
          description: projectDoc.description,
          name: projectDoc.name,
          category: projectDoc.category as string,
          active: projectDoc.active,
        };
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProjectMember,
  ProjectMemberDocument,
} from '../../entities/project-member.entity';
import {
  GenericSuccessResponse,
  AddProjectMemberDTO,
  Role,
  ProjectMemberDTO,
  ListResponse,
} from '@tma/shared/api-model';
import { ProjectDocument } from '../../entities/project.entity';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectModel(ProjectMember.name)
    private readonly model: Model<ProjectMemberDocument>
  ) {}
  async getMemberProjects(
    userId: string,
    offset: number,
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any
  ): Promise<ListResponse<ProjectDocument>> {
    const filters = { userId };
    if (filter) {
      Object.assign(filters, filter);
    }
    const count = await this.model.countDocuments(filters).exec();
    const list = await this.model
      .find(filters)
      .skip(offset)
      .limit(limit)
      .populate('project')
      .exec();
    const docs: ProjectDocument[] = list.map((item) => {
      return item.project;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
    const response: ListResponse<ProjectDocument> = {
      items: docs,
      totalItems: count,
    };
    return Promise.resolve(response);
  }
  async getProjectMembers(projectId: string): Promise<ProjectMemberDTO> {
    const list = await this.model
      .find({ project: projectId })
      .populate('user')
      .exec();
    return Promise.resolve(
      list.map((item: ProjectMemberDocument) => {
        return {
          projectId,
          role: item.role,
          user: item.user,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    );
  }
  async addOwner(
    projectDoc: ProjectDocument,
    userId: string
  ): Promise<GenericSuccessResponse> {
    const member = new ProjectMember();
    member.project = projectDoc.id;
    member.role = Role.Owner;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    member.user = userId as any;
    await new this.model(member).save();
    return Promise.resolve({ result: 'success' });
  }
  async removeMember(
    currentUser: string,
    projectId: string,
    memberId: string
  ): Promise<GenericSuccessResponse> {
    this.checkProjectAccess(projectId, currentUser);
    await this.model.deleteOne({ project: projectId, user: memberId }).exec();
    return Promise.resolve({ result: 'success' });
  }

  async updateMember(
    currentUser: string,
    projectId: string,
    member: AddProjectMemberDTO
  ): Promise<GenericSuccessResponse> {
    this.checkProjectAccess(projectId, currentUser);
    await this.model
      .findOneAndUpdate(
        { project: projectId, user: member.userId },
        {
          project: projectId,
          user: member.userId,
          role: member.role,
        },
        {
          upsert: true,
        }
      )
      .exec();
    return Promise.resolve({
      result: 'success',
    });
  }
  async checkProjectAccess(
    projectId: string,
    userId: string,
    checkRole = true
  ): Promise<boolean> {
    const projectMember = await this.model
      .findOne({ project: projectId, user: userId })
      .exec();
    if (projectMember == null) {
      throw new ForbiddenException(`You don't have aacess to the project.`);
    }
    if (checkRole === true && projectMember.role !== Role.Owner) {
      throw new ForbiddenException(
        `Only project owners can update the project.`
      );
    }
    return Promise.resolve(true);
  }
  async deleteProjectEntries(
    projectId: string
  ): Promise<GenericSuccessResponse> {
    await this.model.deleteMany({ project: projectId }).exec();
    return Promise.resolve({ result: 'success' });
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { User, UserDocument } from '../../entities/user';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectModel(ProjectMember.name)
    private readonly model: Model<ProjectMemberDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}
  async getMemberProjects(
    userId: string,
    offset: number,
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any
  ): Promise<ListResponse<ProjectDocument>> {
    const userObjectId = new Types.ObjectId(userId);
    const filters = { user: userObjectId };
    if (filter) {
      Object.assign(filters, filter);
    }
    const count = await this.model.countDocuments(filters).exec();
    if (count == 0) {
      return Promise.resolve({
        items: [],
        totalItems: count,
      });
    }
    const list = await this.model
      .find(filters)
      .skip(offset)
      .limit(limit)
      .lean()
      .populate({
        path: 'project',
        populate: [
          {
            path: 'createdBy',
            select: 'name email username _id',
          },
          {
            path: 'modifiedBy',
            select: 'name email username _id',
          },
        ],
      })
      .exec();
    const docs: ProjectDocument[] = list.map((item) => {
      const prj = item.project;
      return prj;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
    const response: ListResponse<ProjectDocument> = {
      items: docs,
      totalItems: count,
    };
    return Promise.resolve(response);
  }
  async getProjectMembers(projectId: string): Promise<ProjectMemberDTO[]> {
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
    const members = await this.getProjectMembers(projectId);
    if (
      !members.some(
        (member) => member.role === Role.Owner && member.user.id !== memberId
      )
    ) {
      throw new BadRequestException('Project atleast needs one owner.');
    }
    await this.model.deleteOne({ project: projectId, user: memberId }).exec();
    return Promise.resolve({ result: 'success' });
  }

  async updateMember(
    currentUser: string,
    projectId: string,
    member: AddProjectMemberDTO
  ): Promise<GenericSuccessResponse> {
    this.checkProjectAccess(projectId, currentUser);
    const uId = new Types.ObjectId(member.userId);
    const pId = new Types.ObjectId(projectId);
    if (member.role == Role.Member) {
      const members = await this.getProjectMembers(projectId);
      if (
        !members.some(
          (member1) =>
            member1.role === Role.Owner && member1.user.id !== member.userId
        )
      ) {
        throw new BadRequestException('Project atleast needs one owner.');
      }
    }
    await this.model
      .findOneAndUpdate(
        { project: pId, user: uId },
        {
          project: pId,
          user: uId,
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
    const uId = new Types.ObjectId(userId);
    const pId = new Types.ObjectId(projectId);
    const projectMember = await this.model
      .findOne({ project: pId, user: uId })
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
  async deleteUserEntries(userId: string): Promise<GenericSuccessResponse> {
    await this.model.deleteMany({ user: userId }).exec();
    return Promise.resolve({ result: 'success' });
  }
}

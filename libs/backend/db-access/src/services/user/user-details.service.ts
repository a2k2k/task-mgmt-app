/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserDocument } from '../../entities/user';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  CreateUserDTO,
  UserDetails,
  UpdateUserDTO,
  ListResponse,
} from '@tma/shared/api-model';
import { UserCredsService } from './user-creds.service';
import { ProjectMemberService } from '../project/project-member.service';

@Injectable()
export class UserDetailsService {
  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    private userCredsService: UserCredsService,
    private projectMemberService: ProjectMemberService
  ) {}

  async getUsers(
    offset: number,
    limit: number,
    current: string
  ): Promise<ListResponse<UserDetails>> {
    const currentUser = await this.findUserById(current);
    if (!currentUser || !currentUser.admin) {
      throw new UnauthorizedException(
        'You are not unauthorized to perform this action.'
      );
    }
    const filter = { organization: { $eq: currentUser.organization } };
    const count = await this.model.countDocuments(filter).exec();
    const users: UserDocument[] = await this.model
      .find(filter)
      .skip(offset)
      .limit(limit)
      .exec();
    return Promise.resolve({
      items: users.map((user) => this.mapUserEntityToDTO(user) as UserDetails),
      totalItems: count,
    });
  }

  async findUserByUsername(username: string): Promise<UserDetails | null> {
    const userDoc: UserDocument | null = await this.model
      .findOne({ username })
      .exec();
    return Promise.resolve(this.mapUserEntityToDTO(userDoc));
  }
  async findUserById(id: string): Promise<UserDetails | null> {
    const userDoc = await this.model.findById(id).exec();
    return Promise.resolve(this.mapUserEntityToDTO(userDoc));
  }

  async findUserByEmailOrId(
    userIdOrEmail: string,
    user_id: string
  ): Promise<UserDetails | null> {
    const currUser = await this.checkCurrentUserAdmin(user_id);
    const condition: Array<any> = [{ email: { $eq: userIdOrEmail } }];
    if (userIdOrEmail.length === 24 && /^[a-fA-F0-9]+$/.test(userIdOrEmail)) {
      condition.push({
        _id: { $eq: new mongoose.Types.ObjectId(userIdOrEmail) },
      });
    }
    const userDoc: UserDocument | null = await this.model
      .findOne({
        $or: condition,
      })
      .exec();
    if (!userDoc || userDoc.organization !== currUser.organization) {
      throw new NotFoundException(
        `User ${userIdOrEmail} not found in organisation ${currUser.organization}`
      );
    }
    return Promise.resolve(this.mapUserEntityToDTO(userDoc));
  }

  async createUser(
    user: CreateUserDTO,
    currentUser: string | null,
    fromSignup = false
  ): Promise<UserDetails> {
    let existing = await this.model.findOne({ username: user.username });
    if (existing != null) {
      throw new BadRequestException(
        `An user with username "${user.username}" already exists.`
      );
    }
    existing = await this.model.findOne({ email: user.email });
    if (existing != null) {
      throw new BadRequestException(
        `An user with email "${user.email}" already exists.`
      );
    }
    if (!fromSignup) {
      const currUser = await this.checkCurrentUserAdmin(currentUser);
      user.organization = currUser.organization;
    } else if (user.organization == null) {
      throw new BadRequestException('User organization is required');
    }
    const userDoc = await new this.model({
      ...user,
      dateCreated: Date.now(),
      emailVerified: false,
    }).save();
    return Promise.resolve(this.mapUserEntityToDTO(userDoc) as UserDetails);
  }

  private async checkCurrentUserAdmin(
    currentUser: string | null
  ): Promise<UserDetails> {
    if (currentUser == null) {
      throw new ForbiddenException(
        'You are not authorized to perform this action.'
      );
    }
    const current = await this.findUserById(currentUser);
    if (current == null || !current.admin) {
      throw new ForbiddenException(
        'You are not authorized to perform this action.'
      );
    }
    return Promise.resolve(current);
  }

  async updateUser(
    currentUser: string,
    id: string,
    user: UpdateUserDTO
  ): Promise<UserDetails | null> {
    const existingUser = await this.model.findById(id);
    if (!existingUser) {
      throw Promise.resolve(null);
    }
    if (currentUser != id) {
      await this.checkCurrentUserAdmin(currentUser);
    }
    if (existingUser.email !== user.email) {
      existingUser.emailVerified = false;
    }
    existingUser.name = user.name;
    existingUser.phone = user.phone;
    existingUser.admin = user.admin;
    if (user.password) {
      await this.userCredsService.update({
        username: existingUser.username,
        password: user.password,
      });
    }
    const updatedUser = await existingUser.save();
    return this.mapUserEntityToDTO(updatedUser);
  }

  async deleteUser(
    id: string,
    currUserId: string
  ): Promise<UserDetails | null> {
    if (id === currUserId) {
      throw new BadRequestException('Cannot delete current user');
    }
    const currUser = await this.checkCurrentUserAdmin(currUserId);
    if (currUser == null || !currUser.admin) {
      throw new UnauthorizedException();
    }
    const userToDelete = await this.findUserById(id);
    if (userToDelete == null) {
      throw new NotFoundException();
    }
    if (userToDelete.organization != currUser.organization) {
      throw new UnauthorizedException(
        'User belongs to a different organization.'
      );
    }
    await this.projectMemberService.deleteUserEntries(userToDelete.id);
    await this.userCredsService.delete(userToDelete.id);
    const userDoc = await this.model.findByIdAndDelete(id).exec();
    return Promise.resolve(this.mapUserEntityToDTO(userDoc));
  }

  private mapUserEntityToDTO(user: UserDocument | null): UserDetails | null {
    if (!user) {
      return null;
    }
    const userDetails: UserDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified == null ? false : user.emailVerified,
      dateCreated: user.dateCreated,
      username: user.username,
      country: user.country,
      phone: user.phone,
      organization: user.organization,
      admin: user.admin,
    };
    return userDetails;
  }
}

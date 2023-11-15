/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User, UserDocument } from '../../entities/user';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateUserDTO,
  UserDetails,
  UpdateUserDTO,
  ListResponse,
} from '@tma/shared/api-model';

@Injectable()
export class UserDetailsService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async getUsers(): Promise<ListResponse<UserDetails>> {
    const count = await this.model.countDocuments().exec();
    const users: UserDocument[] = await this.model.find().exec();
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
      await this.checkCurrentUserAdmin(currentUser);
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
    if (current == null || current.admin) {
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
    const existingUser = await this.findUserById(id);
    if (!existingUser) {
      throw Promise.resolve(null);
    }
    if (currentUser != id) {
      await this.checkCurrentUserAdmin(currentUser);
    }
    if (existingUser.email !== user.email) {
      existingUser.emailVerified = false;
    }
    const updateObject: any = {};
    const keys: string[] = Object.keys(user);
    Object.keys(keys).forEach((key) => {
      const value = (user as any)[key];
      if (value == null || (value + '').trim() === '') {
        return;
      }
      updateObject[key] = value;
    });
    if (updateObject.email != null && updateObject.email != existingUser) {
      updateObject.emailVerified = false;
    }
    const userDoc: UserDocument | null = await this.model
      .findByIdAndUpdate(id, { $set: updateObject })
      .exec();
    return this.mapUserEntityToDTO(userDoc);
  }

  async deleteUser(id: string): Promise<UserDetails | null> {
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
      admin: user.admin,
    };
    return userDetails;
  }
}

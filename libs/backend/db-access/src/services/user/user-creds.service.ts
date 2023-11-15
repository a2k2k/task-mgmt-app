import { Injectable } from '@nestjs/common';
import { UserCreds } from '../../entities/user-creds';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Error } from '@tma/shared/api-model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserCredsService {
  constructor(
    @InjectModel(UserCreds.name) private readonly model: Model<UserCreds>
  ) {}

  async verify(requestCreds: UserCreds): Promise<Error | null> {
    const userCreds = await this.model.findOne({username: requestCreds.username}).exec();
    if (!userCreds) {
      return Promise.resolve({
        message: 'User not found',
      });
    }
    const result = await bcrypt.compare(
      requestCreds.password,
      userCreds.password
    );
    if (!result) {
      return Promise.resolve({
        message: 'Invalid Credentials',
      });
    }
    return Promise.resolve(null);
  }

  async create(userCreds: UserCreds): Promise<void> {
    const hashPassword: string = await this.encrypt(userCreds.password);
    new this.model({
      username: userCreds.username,
      password: hashPassword,
    }).save();
  }

  async update(userCreds: UserCreds): Promise<UserCreds | null> {
    const hashPassword: string = await this.encrypt(userCreds.password);
    return await this.model.findOneAndUpdate(
      { username: userCreds.username },
      { username: userCreds.username, password: hashPassword }
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  private async encrypt(passwd: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashPassword: string = await bcrypt.hash(passwd, salt);
    return Promise.resolve(hashPassword);
  }
}

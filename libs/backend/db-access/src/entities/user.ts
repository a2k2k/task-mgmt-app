import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class User {
  @Prop()
  name!: string;

  @Prop()
  username!: string;

  @Prop()
  email!: string;

  @Prop()
  emailVerified?: boolean;

  @Prop()
  dateCreated?: number | null;

  @Prop()
  country?: string;

  @Prop()
  phone?: number;

  @Prop()
  admin!: boolean;
  
  @Prop()
  organization!: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
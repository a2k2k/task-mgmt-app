/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Schema as MSchema } from 'mongoose';
import { User } from './user';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description!: string;

  @Prop({ required: true })
  dateCreated!: number;

  @Prop({ required: true, type: MSchema.Types.ObjectId, ref: 'User' })
  createdBy!: User | any;

  @Prop({ required: true })
  dateModified!: number;

  @Prop({ required: true, type: MSchema.Types.ObjectId, ref: 'User' })
  modifiedBy!: User | any;

  @Prop({ required: true })
  active!: boolean;

  @Prop()
  category?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

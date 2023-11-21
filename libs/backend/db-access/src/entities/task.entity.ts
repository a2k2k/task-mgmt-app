import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document, Schema as MSchema } from 'mongoose';
import { User } from './user';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  dateCreated!: number;

  @Prop({ required: true, type: MSchema.Types.ObjectId, ref: 'User' })
  createdBy!: User | mongoose.Types.ObjectId;

  @Prop({ required: true })
  dateModified!: number;

  @Prop({ required: true, type: MSchema.Types.ObjectId, ref: 'User' })
  modifiedBy!: User | mongoose.Types.ObjectId;

  @Prop({ required: true })
  status!: string;

  @Prop()
  assignee!: string;

  @Prop()
  startDate?: number;

  @Prop()
  endDate?: number;

  @Prop()
  impediment?: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

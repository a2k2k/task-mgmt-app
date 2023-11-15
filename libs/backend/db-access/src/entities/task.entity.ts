import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  projectId!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  expiry!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  dateCreated!: number;

  @Prop({ required: true })
  createdBy!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  dateModified!: number;

  @Prop({ required: true })
  modifiedBy!: mongoose.Types.ObjectId;

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

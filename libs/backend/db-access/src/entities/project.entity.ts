import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description!: string;

  @Prop({ required: true })
  dateCreated!: number;

  @Prop({ required: true })
  createdBy!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  dateModified!: number;

  @Prop({ required: true })
  modifiedBy!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  active!: boolean;

  @Prop()
  category?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

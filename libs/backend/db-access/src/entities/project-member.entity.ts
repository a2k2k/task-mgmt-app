import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Schema as MSchema } from 'mongoose';
import { User } from './user';
import { Project } from './project.entity';

export type ProjectMemberDocument = ProjectMember & Document;

@Schema()
export class ProjectMember {
  @Prop({ required: true,  type: MSchema.Types.ObjectId, ref: 'User' })
  user!: User;

  @Prop({ required: false })
  role!: string;

  @Prop({ required: true, type: MSchema.Types.ObjectId, ref: 'Project'  })
  project!: Project;
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);

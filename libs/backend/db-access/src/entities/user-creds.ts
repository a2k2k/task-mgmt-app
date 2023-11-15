import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserCreds {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  password!: string;
}

export const UserCredsSchema = SchemaFactory.createForClass(UserCreds);

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './database.config';
import { User, UserSchema } from './entities/user';
import { UserCredsService } from './services/user/user-creds.service';
import { UserDetailsService } from './services/user/user-details.service';
import { UserCreds, UserCredsSchema } from './entities/user-creds';
import { TasksService } from './services/tasks/tasks.service';
import { Task, TaskSchema } from './entities/task.entity';
import { ProjectsService } from './services/project/projects.service';
import { Project, ProjectSchema } from './entities/project.entity';
import {
  ProjectMember,
  ProjectMemberSchema,
} from './entities/project-member.entity';
import { ProjectMemberService } from './services/project/project-member.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserCreds.name,
        schema: UserCredsSchema,
      },
      {
        name: Task.name,
        schema: TaskSchema,
      },
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: ProjectMember.name,
        schema: ProjectMemberSchema,
      },
    ]),
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
        }),
      ],
      useFactory: (dbConfig: ConfigService) => {
        return {
          uri: dbConfig.get<string>('database.uri'),
          user: dbConfig.get<string>('database.user'),
          pass: dbConfig.get<string>('database.password'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    UserCredsService,
    UserDetailsService,
    TasksService,
    ProjectsService,
    ProjectMemberService
  ],
  exports: [UserCredsService, UserDetailsService, TasksService, ProjectsService],
})
export class DatabaseAccessModule {}

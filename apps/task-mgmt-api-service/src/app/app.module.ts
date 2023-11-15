import { Module } from '@nestjs/common';

import { AuthModule } from '@tma/backend/auth';
import { UsersController } from './users.controller';
import { DatabaseAccessModule } from '@tma/backend/db-access';
import { AuthController } from './auth.controller';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [
    DatabaseAccessModule,
    AuthModule
  ],
  controllers: [AuthController, UsersController, ProjectsController],
  providers: [],
})
export class AppModule {}

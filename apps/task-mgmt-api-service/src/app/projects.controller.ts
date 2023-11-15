import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@tma/backend/auth';
import { ProjectsService, TasksService } from '@tma/backend/db-access';
import {
  AddProjectMemberDTO,
  CreateProjectDTO,
  CreateTaskDto,
  CurrentUser,
  JwtTokenData,
  UpdateProjectDTO,
  UpdateTaskDto,
} from '@tma/shared/api-model';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private tasksService: TasksService
  ) {}
  @Post()
  async create(
    @Body() createProjectDTO: CreateProjectDTO,
    @CurrentUser() user: JwtTokenData
  ) {
    return this.projectsService.create(createProjectDTO, user.user_id);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtTokenData,
    @Query() query: { [key: string]: string }
  ) {
    const offset = query.offset ? parseInt(query.offset) : 0;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const filter = {};
    if (query.filter) {
      query.filter.split('::').forEach((f) => {
        const nv = f.split('=', 2);
        filter[nv[0]] = nv[1];
      });
    }
    return this.projectsService.findAll(user.user_id, offset, limit, filter);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtTokenData, @Param('id') id: string) {
    return this.projectsService.getProject(id, user.user_id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtTokenData,
    @Param('id') id: string,
    @Body() updateProjectDTO: UpdateProjectDTO
  ) {
    return this.projectsService.update(id, updateProjectDTO, user.user_id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtTokenData, @Param('id') id: string) {
    return this.projectsService.remove(id, user.user_id);
  }

  @Get(':id/tasks')
  async getTasks(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Query() query: { [key: string]: string }
  ) {
    const offset = query.offset ? parseInt(query.offset) : 0;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const filter = {};
    if (query.filter) {
      query.filter.split('::').forEach((f) => {
        const nv = f.split('=', 2);
        filter[nv[0]] = nv[1];
      });
    }
    return this.tasksService.findAll(
      projectId,
      user.user_id,
      offset,
      limit,
      filter
    );
  }
  @Post(':id/tasks')
  async createTask(
    @Param('id') projectId: string,
    @Body() createTaskDTO: CreateTaskDto,
    @CurrentUser() user: JwtTokenData
  ) {
    return this.tasksService.create(createTaskDTO, projectId, user.user_id);
  }

  @Get(':id/tasks/:taskId')
  async findTask(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Param('taskId') taskId: string
  ) {
    return this.tasksService.getTask(taskId, projectId, user.user_id);
  }

  @Patch(':id/tasks/:taskId')
  updateTask(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDTO: UpdateTaskDto
  ) {
    return this.tasksService.update(taskId, updateTaskDTO, user.user_id);
  }

  @Delete(':id/tasks/:taskId')
  async removeTask(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Param('taskId') taskId: string
  ) {
    return this.tasksService.remove(taskId, projectId, user.user_id);
  }

  @Get(':id/members')
  async getMembers(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string
  ) {
    return this.projectsService.getMembers(projectId, user.user_id);
  }
  @Post(':id/members')
  async addMember(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Body() addMemberDTO: AddProjectMemberDTO
  ) {
    return this.projectsService.addMember(
      user.user_id,
      projectId,
      addMemberDTO
    );
  }
  @Delete(':id/members')
  async removeMember(
    @CurrentUser() user: JwtTokenData,
    @Param('id') projectId: string,
    @Query() query: { memberId: string }
  ) {
    return this.projectsService.removeMember(
      user.user_id,
      projectId,
      query.memberId
    );
  }
}

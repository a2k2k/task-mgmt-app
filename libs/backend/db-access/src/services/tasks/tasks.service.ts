import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDTO,
  TaskStatus,
  ListResponse,
} from '@tma/shared/api-model';
import mongoose, { Model } from 'mongoose';
import { Task, TaskDocument } from '../../entities/task.entity';
import { ProjectMemberService } from '../project/project-member.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly model: Model<TaskDocument>,
    private memberService: ProjectMemberService
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    projectId: string,
    userId: string
  ): Promise<TaskDTO> {
    this.memberService.checkProjectAccess(projectId, userId, false);
    const task = new Task();
    task.projectId = new mongoose.Types.ObjectId(projectId);
    task.name = createTaskDto.name;
    task.dateCreated = Date.now();
    task.dateModified = task.dateCreated;
    task.createdBy = new mongoose.Types.ObjectId(userId);
    task.modifiedBy = task.createdBy;
    task.assignee = createTaskDto.assignee;
    task.description = createTaskDto.description;
    task.status = createTaskDto.status;
    const taskDoc = await new this.model(task).save();
    return Promise.resolve(this.mapTaskEntityToDTO(taskDoc) as TaskDTO);
  }

  async findAll(
    projectId: string,
    userId: string,
    offset: number,
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: any
  ): Promise<ListResponse<TaskDTO>> {
    this.memberService.checkProjectAccess(projectId, userId, false);
    const filters = { projectId };
    if (filter) {
      Object.assign(filters, filter);
    }
    const count = await this.model.countDocuments(filters).exec();
    const taskDocs: TaskDocument[] = await this.model
      .find(filters)
      .skip(offset)
      .limit(limit)
      .exec();
    return Promise.resolve({
      items: taskDocs.map(
        (taskDoc) => this.mapTaskEntityToDTO(taskDoc) as TaskDTO
      ),
      totalItems: count,
    });
  }

  async getTask(
    id: string,
    projectId: string,
    userId: string
  ): Promise<TaskDTO | null> {
    this.memberService.checkProjectAccess(projectId, userId, false);
    const taskDoc = await this.model.findById(id).exec();
    return Promise.resolve(this.mapTaskEntityToDTO(taskDoc));
  }

  async update(
    id: string,
    updatedTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<TaskDTO> {
    const taskDoc = await this.model.findById(id).exec();
    if (taskDoc == null) {
      throw new NotFoundException();
    }
    this.memberService.checkProjectAccess(
      taskDoc.projectId.toString(),
      userId,
      false
    );
    taskDoc.dateModified = Date.now();
    taskDoc.modifiedBy = new mongoose.Types.ObjectId(userId);
    taskDoc.name = updatedTaskDto.name;
    taskDoc.description = updatedTaskDto.description;
    if (updatedTaskDto.status != taskDoc.status) {
      switch (updatedTaskDto.status as TaskStatus) {
        case TaskStatus.InProgress:
          if (taskDoc.startDate == null) {
            taskDoc.startDate = Date.now();
          }
          break;
        case TaskStatus.Completed:
          if (taskDoc.startDate == null) {
            taskDoc.startDate = Date.now();
            taskDoc.endDate = taskDoc.startDate;
          } else {
            taskDoc.endDate = Date.now();
          }
          break;
      }
    }
    taskDoc.assignee = updatedTaskDto.assignee;
    await taskDoc.save();
    return Promise.resolve(this.mapTaskEntityToDTO(taskDoc) as TaskDTO);
  }

  async remove(
    id: string,
    projectId: string,
    userId: string
  ): Promise<boolean> {
    this.memberService.checkProjectAccess(projectId, userId);
    const delResult = await this.model.deleteOne({ id: id }).exec();
    return Promise.resolve(delResult.deletedCount == 1);
  }

  private mapTaskEntityToDTO(taskDoc: TaskDocument | null): TaskDTO | null {
    return taskDoc == null
      ? null
      : {
          id: taskDoc._id,
          assignee: taskDoc.assignee,
          createdBy: taskDoc.createdBy.toString(),
          dateCreated: taskDoc.dateCreated,
          dateModified: taskDoc.dateModified,
          modifiedBy: taskDoc.modifiedBy.toString(),
          status: taskDoc.status,
          start_date: taskDoc.startDate,
          end_date: taskDoc.endDate,
          description: taskDoc.description,
          name: taskDoc.name,
          projectId: taskDoc.projectId.toString(),
          impediment: taskDoc.impediment,
        };
  }
}

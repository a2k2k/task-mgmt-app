export interface CreateTaskDto {
    name: string;
    description?: string;
    status: string;
    assignee: string;
}

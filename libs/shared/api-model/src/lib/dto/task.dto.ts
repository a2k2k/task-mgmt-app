
export interface TaskDTO {
    id: string;
    name: string;
    description?: string;
    status: string;
    start_date?: number;
    end_date?: number;
    assignee: string;
    createdBy: string;
    modifiedBy: string;
    dateCreated: number;
    dateModified: number;
    impediment?: boolean;
    projectId: string;
}

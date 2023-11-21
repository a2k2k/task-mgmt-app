import { EntityRef } from "./common.dto";

export interface TaskDTO {
    id: string;
    name: string;
    description?: string;
    status: string;
    start_date?: number;
    end_date?: number;
    assignee: string;
    createdBy: EntityRef;
    modifiedBy: EntityRef;
    dateCreated: number;
    dateModified: number;
    impediment?: boolean;
    projectId: string;
}

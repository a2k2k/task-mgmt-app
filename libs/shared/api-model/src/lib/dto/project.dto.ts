import { EntityRef } from "./common.dto";

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  dateCreated: number;
  createdBy: EntityRef;
  dateModified: number;
  modifiedBy: EntityRef;
  active: boolean;
  category: string;
}

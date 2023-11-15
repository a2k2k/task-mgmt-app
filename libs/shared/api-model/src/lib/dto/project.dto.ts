export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  dateCreated: number;
  createdBy: string;
  dateModified: number;
  modifiedBy: string;
  active: boolean;
  category: string;
}

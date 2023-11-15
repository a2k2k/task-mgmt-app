import { UserDetails } from './user-details.dto';

export interface ProjectMemberDTO {
  user: UserDetails;
  role: string;
  projectId: string;
}

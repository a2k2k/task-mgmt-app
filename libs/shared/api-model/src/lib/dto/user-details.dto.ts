export interface UserDetails {
    name: string;
  
    username: string;
  
    email: string;
  
    emailVerified: boolean;
  
    dateCreated: number | null | undefined;
  
    country?: string;
  
    phone?: number;

    id: string;

    admin: boolean;

    organization: string;
  }
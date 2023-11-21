export interface UpdateUserDTO {
    name: string;
    email: string;
    country: string;
    phone: number;
    admin: boolean;
    password?: string;
}
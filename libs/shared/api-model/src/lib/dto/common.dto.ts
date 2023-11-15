export interface EntityRef {
    id: string;
    name: string;
    type?: string;
}
export interface ListResponse<T> {
    items: T[];
    totalItems: number;
}
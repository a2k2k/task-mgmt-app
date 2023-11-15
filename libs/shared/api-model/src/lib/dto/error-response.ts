export interface Error {
    errorCode?: number;
    message: string;
    details?: string[]; 
    helpLink?: string;
}
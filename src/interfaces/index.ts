import { roleT } from './userInterface';
export interface TokenPayloadI {
    userId: string;
    role: roleT | 'test';
    username: string;
}

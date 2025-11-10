// custom.d.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express'; // Import the necessary types from 'express'

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

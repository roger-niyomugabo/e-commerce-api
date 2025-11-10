import express from 'express';
import createServer from '../src/app';

const app = express();

createServer(app);

export default app;

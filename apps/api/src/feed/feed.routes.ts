import { Router } from 'express';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepo } from './feed.repo';
import { optionalAuthJwt } from '../auth/auth.middleware';

import { pool } from '../db';

export const feedRouter = Router();

const repo = new FeedRepo(pool);
const service = new FeedService(repo);
const controller = new FeedController(service);

feedRouter.get('/', optionalAuthJwt, controller.getFeed);
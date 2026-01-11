import { Request, Response } from 'express';
import { FeedService } from './feed.service';
import { FeedFilter } from './feed.types';

function parseMulti(q: any): string[] | undefined {
  if (!q) return undefined;
  if (Array.isArray(q)) return q.map(String);
  return [String(q)];
}

const VALID_FILTERS: FeedFilter[] = [
  'following',
  'my_campus',
  'all_campuses',
  'public',
];

export class FeedController {
  constructor(private service: FeedService) {}

  getFeed = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const campusIds = parseMulti(req.query.campusIds);
    const themeIds = parseMulti(req.query.themeIds);
    const includeEvents = req.query.includeEvents
      ? String(req.query.includeEvents) !== 'false'
      : true;

    const user = (req as any).user ?? null;

    let filter: FeedFilter | null = null;
    if (user && req.query.filter) {
      const f = String(req.query.filter) as FeedFilter;
      if (VALID_FILTERS.includes(f)) {
        filter = f;
      }
    }

    const viewer = {
      isAuthenticated: !!user,
      userId: user?.id,
      filter,
    };

    const data = await this.service.getFeed(
      { campusIds, themeIds, includeEvents, limit, cursor },
      viewer,
    );
    res.json(data);
  };
}

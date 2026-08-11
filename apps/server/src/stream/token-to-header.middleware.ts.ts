import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenToHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tokenFromQuery = req.query.token as string | undefined;

    if (tokenFromQuery && !req.headers['authorization']) {
      const authHeader = tokenFromQuery.startsWith('Bearer ')
        ? tokenFromQuery
        : `Bearer ${tokenFromQuery}`;

      req.headers['authorization'] = authHeader;
    }

    next();
  }
}

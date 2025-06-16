import { Request, Response, NextFunction } from 'express';

const publicRoutes = [
  { method: 'GET', path: '/api/all/(.*)' },
];

export function customCorsMiddleware(allowedOrigins: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    const isPublicRoute = publicRoutes.some(
      (route) =>
        route.method === req.method &&
        req.path.startsWith(route.path)
    );

    if (isPublicRoute) {
      // Allow any origin for public route
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else if (origin && allowedOrigins.includes(origin)) {
      // Allow only whitelisted origins
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Expires, expires, Cache-Control, cache-control, Pragma, pragma, Cookie'
    );
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  };
}

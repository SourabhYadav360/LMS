# LMS Deployment

## Render backend

Set the Render service root directory to `backend`, with `npm install` as the build command and `npm start` as the start command. Attach a managed PostgreSQL database and Redis-compatible service, then add these backend environment variables in Render:

- `DATABASE_URL`: the PostgreSQL connection URL from Render.
- `REDIS_URL`: the Redis/Key Value connection URL from Render.
- `JWT_SECRET`: a newly generated, private signing secret.
- `FRONTEND_URL`: `https://lms-beta-rosy-10.vercel.app` (comma-separated if additional frontend origins are needed). The production Vercel origin is also explicitly allowed by the API.
- `NODE_ENV`: `production`.

The backend `start` command applies pending migrations before starting the API, so the first deployment creates required database tables automatically. Keep `NODE_ENV=production` and `DATABASE_URL` configured in Render. You can also run `npm run db:migrate` from the backend service directory to apply migrations manually.

## Vercel frontend

Set the Vercel project's root directory to `frontend` and add this environment variable:

- `NEXT_PUBLIC_API_URL`: `https://lms-uh6q.onrender.com/api`.

Redeploy the frontend after setting it. The frontend defaults to this API URL if the variable is not set. Set `REDIS_URL` on Render to the full Redis connection URL shown in the Render Redis/Key Value dashboard; the service identifier by itself is not a connection URL. Do not put database, Redis, or JWT secrets in Vercel or frontend source files.

Keep `.env` files out of Git. If credentials were previously committed, rotate them in their respective providers; removing a file from a later commit does not remove it from Git history.

To stop tracking the existing backend env file without deleting your local copy, run `git rm --cached backend/.env` and commit the resulting removal.

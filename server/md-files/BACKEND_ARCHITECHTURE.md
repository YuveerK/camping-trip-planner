# Camping Trip Planner — Backend

A production-oriented REST API for planning and managing camping trips, built on a modular, feature-based architecture with a clean separation between transport, business logic, and data access.

---

## Tech Stack

| Concern       | Choice                            | Notes                                       |
| ------------- | --------------------------------- | ------------------------------------------- |
| Language      | TypeScript 5.6                    | Strict typing end to end                    |
| Runtime       | Node.js 22                        |                                             |
| Web framework | Express 4.21                      |                                             |
| ORM           | Prisma 5.22                       | PostgreSQL assumed                          |
| Validation    | Zod 3.23                          | Request parsing + env parsing               |
| Auth          | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless tokens, hashed passwords          |
| Security      | `helmet`, `cors`                  | Sensible HTTP defaults                      |
| Logging       | `morgan`                          | HTTP request logging                        |
| Config        | `dotenv`                          | Loaded once, validated via Zod              |
| Dev runner    | `tsx watch`                       | Fast TS execution, no separate build in dev |

---

## Architecture Overview

The codebase follows a **layered, feature-modular** pattern. Each feature (a "module") owns its full vertical slice — routing through to database access — and requests flow through clearly defined layers:

```
HTTP request
   │
   ▼
[ routes ]        URL + method → handler wiring, attaches validate() + auth
   │
   ▼
[ middleware ]    Zod validation, JWT auth, async error catching
   │
   ▼
[ controller ]   Reads req (params/body/query), shapes the HTTP response
   │
   ▼
[ service ]      Business logic, orchestration, hashing, token issuing
   │
   ▼
[ repository ]   The ONLY layer that talks to Prisma
   │
   ▼
[ Prisma / DB ]  PostgreSQL
```

**The golden rule:** dependencies point downward only. A controller never touches Prisma directly; a service never reads `req` or writes `res`. This keeps business logic testable in isolation and makes the HTTP layer swappable.

| Layer      | Knows about HTTP? | Knows about Prisma?  | Responsibility                      |
| ---------- | ----------------- | -------------------- | ----------------------------------- |
| Routes     | Yes               | No                   | Wire paths to handlers + middleware |
| Controller | Yes               | No                   | Translate HTTP ↔ service calls      |
| Service    | No                | No (uses repository) | Business rules, orchestration       |
| Repository | No                | Yes                  | Database queries only               |

---

## Project Structure

```
camping-trip-planner-server/
├── prisma/
│   ├── schema.prisma            # Database models & relationships
│   └── seed.ts                  # Initial database seed script
│
├── src/
│   ├── server.ts                # Boots the HTTP listener
│   ├── app.ts                   # Builds & configures the Express instance
│   │
│   ├── config/
│   │   └── env.ts               # Zod-parsed, type-safe environment variables
│   │
│   ├── db/
│   │   └── client.ts            # Prisma client singleton
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts   # JWT verification, attaches user to req
│   │   ├── error.middleware.ts  # Central error handler
│   │   └── validate.ts          # Generic Zod request validator
│   │
│   ├── modules/
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.schema.ts
│   │   │
│   │   └── trips/
│   │       ├── trips.routes.ts
│   │       ├── trips.controller.ts
│   │       ├── trips.service.ts
│   │       ├── trips.repository.ts
│   │       └── trips.schema.ts
│   │
│   └── utils/
│       ├── catchAsync.ts        # Wraps async handlers, forwards errors to next()
│       └── AppError.ts          # Operational error class with statusCode
```

> **Note on `app.ts` vs `server.ts`:** splitting them matters. `app.ts` exports a configured but un-started Express instance; `server.ts` imports it and calls `.listen()`. This lets integration tests import `app` and hit it with `supertest` without ever binding a port.

> **Why no `*.model.ts` files?** Prisma generates fully typed model types from `schema.prisma` at `prisma generate` time. Import them directly (`import { User } from '@prisma/client'`) rather than hand-writing model interfaces.

---

## Request Lifecycle (worked example)

A `POST /api/trips` request:

1. **Route** matches in `trips.routes.ts`. Middleware runs in order: `authenticate` → `validate(createTripSchema)`.
2. **`authenticate`** reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches `req.user`. Rejects with `401` if invalid.
3. **`validate`** parses `body`/`query`/`params` against the Zod schema. Malformed input → `400` with field-level errors.
4. **Controller** (`createTrip`) pulls the clean data off `req`, calls `tripsService.createTrip(...)`, and sends the result with the right status code.
5. **Service** applies business rules (e.g. the trip owner is the authenticated user, end date is after start date) and calls the repository.
6. **Repository** runs the Prisma query and returns the row.
7. Any thrown error bubbles through `catchAsync` to the **error middleware**, which formats a consistent JSON error response.

---

## Core Building Blocks

### 1. Type-safe environment config — `src/config/env.ts`

Validate env vars once at startup so a missing or malformed variable fails fast and loudly, and the rest of the app gets a fully typed config object.

```ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
```

Everywhere else, `import { env } from '../config/env'` instead of reading `process.env` directly.

### 2. Prisma client singleton — `src/db/client.ts`

A single shared instance avoids exhausting the connection pool, and guarding it on `globalThis` prevents `tsx watch` hot-reloads from spawning new clients on every change.

```ts
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

### 3. Generic Zod validator — `src/middlewares/validate.ts`

One reusable middleware validates any request shape. Note: it forwards to the error handler via `next(error)` rather than responding inline, so all error formatting stays in one place.

```ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // ZodError handled centrally in error.middleware.ts
    }
  };
```

### 4. Async error wrapper — `src/utils/catchAsync.ts`

Removes repetitive try/catch from every controller. Express 4 doesn't auto-catch rejected promises, so this is what routes a thrown async error to the error middleware.

```ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

> If you later move to Express 5 (your other projects are on it), promise rejections in handlers are forwarded automatically — but `catchAsync` is still a harmless, explicit habit.

### 5. Operational error class — `src/utils/AppError.ts`

```ts
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

Throw `new AppError(404, 'Trip not found')` from a service; the error middleware reads `statusCode`.

### 6. Central error handler — `src/middlewares/error.middleware.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({ status: "fail", errors: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: "fail", message: err.message });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    res
      .status(409)
      .json({ status: "fail", message: "Resource already exists" });
    return;
  }

  console.error("UNEXPECTED ERROR", err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
    ...(env.NODE_ENV === "development" && { detail: String(err) }),
  });
};
```

### 7. Auth middleware — `src/middlewares/auth.middleware.ts`

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AuthPayload {
  userId: string;
}

// Augment Express's Request type so req.user is typed everywhere
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or malformed authorization header");
  }
  try {
    req.user = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthPayload;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
};
```

### 8. Application assembly — `src/app.ts` & `src/server.ts`

```ts
// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import usersRoutes from "./modules/users/users.routes";
import tripsRoutes from "./modules/trips/trips.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/users", usersRoutes);
app.use("/api/trips", tripsRoutes);

app.use(errorHandler); // must be registered LAST

export default app;
```

```ts
// src/server.ts
import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(
    `🏕️  API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`,
  );
});
```

---

## Anatomy of a Module

Using `trips/` as the reference. Each file has one job.

**`trips.schema.ts`** — Zod schemas (and inferred types):

```ts
import { z } from "zod";

export const createTripSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).max(120),
      location: z.string().min(1),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine((d) => d.endDate >= d.startDate, {
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    }),
});

export type CreateTripInput = z.infer<typeof createTripSchema>["body"];
```

**`trips.repository.ts`** — Prisma only:

```ts
import prisma from "../../db/client";
import { CreateTripInput } from "./trips.schema";

export const tripsRepository = {
  create: (ownerId: string, data: CreateTripInput) =>
    prisma.trip.create({ data: { ...data, ownerId } }),

  findById: (id: string) => prisma.trip.findUnique({ where: { id } }),

  findManyByOwner: (ownerId: string) =>
    prisma.trip.findMany({ where: { ownerId }, orderBy: { startDate: "asc" } }),
};
```

**`trips.service.ts`** — business logic, no HTTP, no raw Prisma:

```ts
import { tripsRepository } from "./trips.repository";
import { CreateTripInput } from "./trips.schema";
import { AppError } from "../../utils/AppError";

export const tripsService = {
  create: (ownerId: string, input: CreateTripInput) =>
    tripsRepository.create(ownerId, input),

  getOwned: async (ownerId: string, tripId: string) => {
    const trip = await tripsRepository.findById(tripId);
    if (!trip) throw new AppError(404, "Trip not found");
    if (trip.ownerId !== ownerId) throw new AppError(403, "Not your trip");
    return trip;
  },
};
```

**`trips.controller.ts`** — thin HTTP adapter:

```ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { tripsService } from "./trips.service";

export const createTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await tripsService.create(req.user!.userId, req.body);
  res.status(201).json({ status: "success", data: trip });
});

export const listTrips = catchAsync(async (req: Request, res: Response) => {
  const trips = await tripsService.getOwned; // ... list logic
  res.json({ status: "success", data: trips });
});
```

**`trips.routes.ts`** — wiring:

```ts
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate";
import { createTripSchema } from "./trips.schema";
import * as tripsController from "./trips.controller";

const router = Router();

router.use(authenticate); // all trip routes require auth

router.post("/", validate(createTripSchema), tripsController.createTrip);
router.get("/", tripsController.listTrips);

export default router;
```

---

## API Conventions

- **Base path:** `/api`
- **Success envelope:** `{ "status": "success", "data": ... }`
- **Error envelope:** `{ "status": "fail" | "error", "message"?: string, "errors"?: {...} }`
- **Auth:** `Authorization: Bearer <jwt>` on protected routes.

| Status | When                            |
| ------ | ------------------------------- |
| `200`  | Successful GET/PATCH            |
| `201`  | Resource created                |
| `400`  | Zod validation failure          |
| `401`  | Missing/invalid token           |
| `403`  | Authenticated but not permitted |
| `404`  | Resource not found              |
| `409`  | Unique constraint violation     |
| `500`  | Unhandled/unexpected            |

---

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env   # then fill in DATABASE_URL, JWT_SECRET, etc.

# 3. Set up the database
npm run db:migrate     # creates tables from schema.prisma
npm run db:seed        # optional: seed initial data

# 4. Run
npm run dev            # tsx watch, hot reload
```

### Required `.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:pass@localhost:5432/camping?schema=public"
JWT_SECRET="replace-with-a-long-random-string-at-least-32-chars"
JWT_EXPIRES_IN="7d"
```

---

## NPM Scripts

| Script            | Command                   | Purpose                                       |
| ----------------- | ------------------------- | --------------------------------------------- |
| `dev`             | `tsx watch src/server.ts` | Local dev with hot reload                     |
| `build`           | `tsc`                     | Compile to `dist/`                            |
| `start`           | `node dist/server.js`     | Run compiled output                           |
| `db:generate`     | `prisma generate`         | Regenerate Prisma client after schema changes |
| `db:migrate`      | `prisma migrate dev`      | Create + apply a dev migration                |
| `db:migrate:prod` | `prisma migrate deploy`   | Apply pending migrations in prod              |
| `db:seed`         | `tsx prisma/seed.ts`      | Seed the database                             |
| `db:studio`       | `prisma studio`           | Visual DB browser                             |
| `db:reset`        | `prisma migrate reset`    | Drop, recreate, re-seed (destructive)         |

---

## Adding a New Module (checklist)

To add, say, a `gear/` module:

1. Create `src/modules/gear/` with the five files: `gear.schema.ts`, `gear.repository.ts`, `gear.service.ts`, `gear.controller.ts`, `gear.routes.ts`.
2. Add the model to `prisma/schema.prisma`, then `npm run db:migrate`.
3. Define Zod schemas first — they drive both validation and your inferred input types.
4. Keep Prisma calls confined to the repository.
5. Register the router in `app.ts`: `app.use('/api/gear', gearRoutes)`.

Following the same layering for every module is what keeps the codebase predictable as it grows.

---

## Suggested Next Steps

A few things worth adding as the project matures:

- **Testing:** `vitest` + `supertest` against the exported `app` for integration tests; unit-test services with a mocked repository.
- **Rate limiting:** `express-rate-limit` on auth endpoints.
- **Structured logging:** swap `morgan` for `pino` if you want JSON logs in production.
- **Refresh tokens:** the current setup issues a single access token; consider a refresh-token flow for longer sessions.
- **CORS hardening:** lock `cors()` to known origins in production rather than allowing all.
- **OpenAPI:** since schemas are already Zod, `zod-to-openapi` can generate API docs for free.

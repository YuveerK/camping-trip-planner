# Camping Trip Planner — Frontend

A React single-page application for planning and managing camping trips, built on a **feature-driven architecture** that mirrors the backend's modular layering. Each feature owns its full vertical slice — UI, data fetching, API calls, and types — so the app scales cleanly as features like maps, gear lists, and weather tracking are added.

---

## Tech Stack

| Concern       | Choice               | Notes                                                      |
| ------------- | -------------------- | ---------------------------------------------------------- |
| Language      | TypeScript 5.6       |                                                            |
| Build tool    | Vite 5.4             | Fast dev server + HMR                                      |
| UI library    | React 18.3           |                                                            |
| Styling       | Tailwind CSS 3.4     | Utility-first, + `clsx` for conditional classes            |
| Server state  | TanStack Query 5.59  | Caching, refetching, mutations                             |
| HTTP client   | Axios 1.7            | Single configured instance                                 |
| Routing       | React Router 6.27    |                                                            |
| Forms         | React Hook Form 7.53 | + `@hookform/resolvers` for Zod                            |
| Validation    | Zod 3.23             | Same library as the backend — share schemas where possible |
| Notifications | react-hot-toast 2.4  | Global toaster                                             |
| Dates         | date-fns 4.1         | Formatting + manipulation                                  |
| Linting       | ESLint               | `--max-warnings 0` in CI                                   |

---

## Architecture Overview

State is split into two distinct kinds, and keeping them apart is the core discipline of this codebase:

- **Server state** (trips, user profile, gear) → owned by **TanStack Query**. Never duplicated into `useState`.
- **Client/UI state** (modal open, form inputs, theme) → React local state, context, or React Hook Form.

Within each feature, data flows through clearly separated layers, mirroring the backend's controller → service → repository split:

```
Component / Page
   │  calls a hook, renders data
   ▼
Feature hook  (useTrips, useCreateTrip)
   │  owns queryKey + cache config, wraps useQuery/useMutation
   ▼
Service  (tripsApi.ts)
   │  pure Axios call, returns a typed promise — no React, no toasts
   ▼
Axios instance  (config/api.ts)
   │  base URL, auth header injection, response unwrapping
   ▼
Backend API
```

**The golden rule:** raw Axios calls live only in `services/`, and `useQuery`/`useMutation` live only in feature `hooks/`. A component never imports Axios directly and never writes a query key inline. This keeps caching logic in one place and components focused purely on rendering.

| Layer               | Knows about React? | Knows about Axios? | Responsibility                              |
| ------------------- | ------------------ | ------------------ | ------------------------------------------- |
| Page / Component    | Yes                | No                 | Render UI, call hooks                       |
| Feature hook        | Yes (Query hooks)  | No (calls service) | Cache keys, mutations, invalidation, toasts |
| Service (`*Api.ts`) | No                 | Yes                | Typed network calls returning pure data     |
| Axios instance      | No                 | Yes                | Base URL, interceptors, envelope unwrapping |

---

## Project Structure

```
camping-trip-planner-client/
├── index.html                   # Vite HTML entry
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
│
└── src/
    ├── main.tsx                 # Entry point — mounts <App>, sets up providers
    ├── App.tsx                  # Root layout + router outlet
    ├── index.css                # Tailwind directives + global styles
    │
    ├── assets/                  # Static assets (logos, fallback images)
    │
    ├── config/                  # Cross-cutting configuration
    │   ├── api.ts               # Configured Axios instance + interceptors
    │   └── queryClient.ts       # TanStack Query defaults
    │
    ├── components/              # GLOBAL, domain-agnostic reusable UI
    │   ├── ui/                  # Atoms: Button, Input, Modal, Spinner
    │   │   ├── Button.tsx
    │   │   └── Input.tsx
    │   └── layout/              # Navbar, Sidebar, Footer, ProtectedRoute
    │
    ├── hooks/                   # GLOBAL cross-cutting hooks
    │   ├── useAuth.ts           # Auth state access
    │   └── useDebounce.ts
    │
    ├── routes/                  # Central routing declarations
    │   └── index.tsx
    │
    ├── utils/                   # Global utilities
    │   └── formatters.ts        # date-fns + price/text formatters
    │
    └── features/               # DOMAIN MODULES (the core)
        ├── auth/
        │   ├── components/      # LoginForm, RegisterForm
        │   ├── hooks/           # useLogin, useRegister
        │   ├── pages/           # LoginPage, RegisterPage
        │   ├── services/        # authApi.ts
        │   └── types/
        │
        └── trips/
            ├── components/      # TripCard, TripForm
            ├── hooks/           # useTrips, useTrip, useCreateTrip
            ├── pages/           # TripsPage, TripDetailsPage
            ├── services/        # tripsApi.ts
            └── types/           # index.ts (shared trip types)
```

**The rule of placement:** if a component, hook, or type is used by more than one feature, it belongs in the top-level `components/`, `hooks/`, or `utils/`. If it's specific to one domain, it stays inside that feature folder. Start things inside a feature; promote to global only when a second feature actually needs it.

---

## Aligning Front & Back (important)

The original frontend sketch had two mismatches with the backend contract. Both are fixed in the examples below:

1. **Response envelope.** The backend wraps every success response as `{ "status": "success", "data": ... }`. A naive `return data` from Axios hands the component the _envelope_, not the array. The fix is to unwrap in the service (or once, in a response interceptor). These docs unwrap in the service for clarity.

2. **Type shape.** The backend `Trip` uses `title`, `location`, `startDate`, `endDate` (see `trips.schema.ts`), not `name` / `destination`. The frontend type below matches the backend so they don't drift.

> Because both ends use Zod, the cleanest long-term move is a shared package (or a copied `trips.schema.ts`) exporting `z.infer` types consumed by both. That makes the contract a single source of truth instead of two hand-maintained type lists.

---

## Core Building Blocks

### 1. Axios instance — `src/config/api.ts`

One configured client. Interceptors attach the JWT and unwrap the backend envelope so feature services stay clean.

```ts
import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap { status, data } and surface auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // optional: redirect to /login
    }
    const message =
      error.response?.data?.message ??
      "Something went wrong. Please try again.";
    toast.error(message);
    return Promise.reject(error);
  },
);
```

> `import.meta.env.VITE_API_URL` — Vite only exposes env vars prefixed with `VITE_`. Define it in `.env`.

### 2. Query client defaults — `src/config/queryClient.ts`

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — data considered fresh
      gcTime: 1000 * 60 * 30, // 30 min — cache retention
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. Provider setup — `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./config/queryClient";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

### 4. A UI atom with `clsx` — `src/components/ui/Button.tsx`

```tsx
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "rounded-lg px-4 py-2 font-medium transition disabled:opacity-50",
      {
        "bg-emerald-600 text-white hover:bg-emerald-700": variant === "primary",
        "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
        "text-emerald-700 hover:bg-emerald-50": variant === "ghost",
      },
      className,
    )}
    {...props}
  />
);
```

### 5. Central routing — `src/routes/index.tsx`

```tsx
import { Routes, Route } from "react-router-dom";
import { TripsPage } from "../features/trips/pages/TripsPage";
import { TripDetailsPage } from "../features/trips/pages/TripDetailsPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<TripsPage />} />
      <Route path="/trips/:id" element={<TripDetailsPage />} />
    </Route>
  </Routes>
);
```

---

## Anatomy of a Feature

Using `trips/` as the reference.

**`types/index.ts`** — domain types aligned to the backend:

```ts
export interface Trip {
  id: string;
  title: string;
  location: string;
  startDate: string; // ISO string from the API
  endDate: string;
  ownerId: string;
}

export interface CreateTripInput {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}
```

**`services/tripsApi.ts`** — pure Axios, no React, unwraps the envelope:

```ts
import { api } from "../../../config/api";
import { Trip, CreateTripInput } from "../types";

export const getTrips = async (): Promise<Trip[]> => {
  const { data } = await api.get("/trips");
  return data.data; // unwrap { status, data }
};

export const getTrip = async (id: string): Promise<Trip> => {
  const { data } = await api.get(`/trips/${id}`);
  return data.data;
};

export const createTrip = async (input: CreateTripInput): Promise<Trip> => {
  const { data } = await api.post("/trips", input);
  return data.data;
};
```

**`hooks/useTrips.ts`** — read query, owns the key + cache config:

```ts
import { useQuery } from "@tanstack/react-query";
import { getTrips } from "../services/tripsApi";

export const tripKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export const useTrips = () =>
  useQuery({
    queryKey: tripKeys.all,
    queryFn: getTrips,
  });
```

> Centralising query keys in a `tripKeys` object keeps invalidation typo-proof — mutations reference `tripKeys.all` instead of a loose `['trips']` string.

**`hooks/useCreateTrip.ts`** — mutation, owns invalidation + toasts:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTrip } from "../services/tripsApi";
import { tripKeys } from "./useTrips";

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      toast.success("Trip created!");
    },
  });
};
```

**`components/TripForm.tsx`** — React Hook Form + Zod, schema aligned with the backend:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useCreateTrip } from "../hooks/useCreateTrip";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(120),
    location: z.string().min(1, "Location is required"),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

export const TripForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { mutate, isPending } = useCreateTrip();

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values))}
      className="space-y-4"
    >
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
      />
      <Input
        label="Location"
        {...register("location")}
        error={errors.location?.message}
      />
      <Input
        type="date"
        label="Start"
        {...register("startDate")}
        error={errors.startDate?.message}
      />
      <Input
        type="date"
        label="End"
        {...register("endDate")}
        error={errors.endDate?.message}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Create Trip"}
      </Button>
    </form>
  );
};
```

**`pages/TripsPage.tsx`** — thin, render-only:

```tsx
import { useTrips } from "../hooks/useTrips";
import { TripCard } from "../components/TripCard";
import { Button } from "../../../components/ui/Button";

export const TripsPage = () => {
  const { data: trips, isLoading, isError } = useTrips();

  if (isLoading) return <div className="p-6">Loading trips…</div>;
  if (isError) return <div className="p-6">Couldn't load your trips.</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Camping Trips</h1>
        <Button variant="primary">Plan New Trip</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {trips?.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
};
```

Notice the page contains no Axios, no query key, no toast logic — all of that lives in the hooks and services beneath it.

---

## Conventions

- **Server state** always goes through TanStack Query. Don't copy query data into `useState`.
- **Query keys** are defined once per feature in a `*Keys` object, never inline strings.
- **Toasts and side effects** belong in mutation hooks (`onSuccess`/`onError`), not in services or components.
- **Forms** use React Hook Form + `zodResolver`; the Zod schema mirrors the backend rules.
- **Imports:** consider a Vite path alias (`@/`) to avoid `../../../` chains — see Next Steps.
- **Loading/error states** are handled at the page level from the query's `isLoading` / `isError`.

---

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure
echo 'VITE_API_URL=http://localhost:3000/api' > .env

# 3. Run (make sure the backend is running too)
npm run dev
```

### Environment variables

| Variable       | Purpose                                                                            |
| -------------- | ---------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API. Must be `VITE_`-prefixed to be exposed to the client. |

---

## NPM Scripts

| Script    | Command                                  | Purpose                                      |
| --------- | ---------------------------------------- | -------------------------------------------- |
| `dev`     | `vite`                                   | Dev server with HMR                          |
| `build`   | `tsc && vite build`                      | Type-check, then produce a production bundle |
| `preview` | `vite preview`                           | Serve the built bundle locally               |
| `lint`    | `eslint . --ext ts,tsx --max-warnings 0` | Lint; fails on any warning                   |

---

## Refactoring a Monolithic File

Sometimes a feature starts life as one giant file — a single `Trips.tsx` that fetches data, holds state, defines types, declares three sub-components, and renders the page. That's a normal starting point; the goal is to split it into the layout above _without breaking it mid-way_. This is the reverse of "Adding a New Feature": same destinations, opposite direction.

### Signs a file has outgrown itself

- It mixes more than one layer — e.g. an `axios` call **and** a `useQuery` **and** JSX all in the same file.
- You scroll to find things, or it's past ~200–300 lines.
- Multiple components are declared in one file and at least one is reused elsewhere.
- Inline `interface`/`type` blocks that other files would benefit from importing.
- You hesitate to touch it because you're not sure what else depends on what.

### Where each piece goes

| Crammed into the giant file                          | Extract to                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Inline `axios.get/post(...)` calls                   | `features/<x>/services/<x>Api.ts`                           |
| `useQuery` / `useMutation`, query keys, cache config | `features/<x>/hooks/use<X>.ts`                              |
| Inline `interface` / `type` definitions              | `features/<x>/types/index.ts`                               |
| Sub-components declared in the same file             | `features/<x>/components/<Name>.tsx`                        |
| Date / price / string helpers                        | `utils/formatters.ts` (or feature-local if domain-specific) |
| Zod form schema                                      | colocated with the form component, or `types/`              |
| The page shell + top-level JSX                       | `features/<x>/pages/<X>Page.tsx` (this is what stays)       |

### Extraction order (one move at a time, stay green)

Do these as **separate commits**, running the app (and `npm run lint`) after each so a mistake is easy to isolate:

1. **Types first.** They have no dependencies, so moving them can't break runtime behaviour. Pull `interface`/`type` blocks into `types/index.ts` and import them back.
2. **Pure helpers.** Move formatters/utilities out next — also dependency-free.
3. **The API call.** Lift the raw `axios` logic into `services/<x>Api.ts`, returning typed promises and unwrapping `data.data`.
4. **The data hook.** Wrap the fetching/mutation in `hooks/use<X>.ts` (query keys + cache live here). The component now calls the hook instead of holding `useEffect`/`useState` fetch logic.
5. **Sub-components.** Move each child component into `components/`, passing data in via props. Extract leaf components (no children of their own) first.
6. **The page is what remains.** Once the above is gone, the original file should be a thin shell — rename/relocate it to `pages/<X>Page.tsx`. If it's still doing a lot, repeat from step 5.

### Pitfalls

- **Don't extract everything at once.** A 6-file PR that doesn't compile is far harder to debug than six small green steps.
- **Avoid premature splitting.** A component used in exactly one place that's under ~150 lines is often fine where it is. Extract when there's reuse, real complexity, or a layer mismatch — not for tidiness alone.
- **Watch for circular imports.** If a hook imports a component that imports the hook, a type or constant probably needs to move to a neutral file (`types/` or `utils/`).
- **Props over prop-drilling.** When extracting sub-components, if you find yourself threading the same prop through three layers, that's a signal for context or a colocated hook — not deeper drilling.
- **Keep one component per file** once extracted, named to match the filename.

> This same order — types → helpers → data layer → hooks → child components → leave the shell last — transfers directly to decomposing large React components anywhere, not just this project.

---

## Adding a New Feature (checklist)

To add, say, a `gear/` feature:

1. Create `src/features/gear/` with `components/`, `hooks/`, `pages/`, `services/`, `types/`.
2. Define `types/index.ts` first — align with the backend's `gear.schema.ts`.
3. Write `services/gearApi.ts`: pure Axios calls returning typed promises, unwrapping `data.data`.
4. Write hooks: a `gearKeys` object, a `useGear` query, and `useCreateGear`-style mutations that invalidate keys and fire toasts.
5. Build domain UI in `components/` and route entry points in `pages/`.
6. Register routes in `src/routes/index.tsx`.

Promote anything to the global `components/` or `hooks/` only once a second feature needs it.

---

## Suggested Next Steps

- **Path aliases:** add `@/` to `vite.config.ts` and `tsconfig.json` to kill the deep relative imports (`../../../config/api` → `@/config/api`).
- **Shared types with the backend:** since both use Zod, extract a shared schema package or copy `trips.schema.ts` so the API contract has one source of truth.
- **`ProtectedRoute`:** implement the route guard referenced in routing — redirect to `/login` when there's no valid token.
- **Token storage:** `localStorage` is simple but XSS-exposed. For higher security, move to httpOnly cookies with a refresh-token flow (pairs with the backend's suggested refresh tokens).
- **Optimistic updates:** for snappy UX on create/delete, use TanStack Query's `onMutate` to update the cache before the server responds.
- **Suspense + Error Boundaries:** TanStack Query supports `useSuspenseQuery`, which can replace the manual `isLoading`/`isError` checks with declarative boundaries.
- **Testing:** Vitest + React Testing Library, with MSW to mock the API at the network layer.

# FlowerPlus frontend

Next.js storefront for the sibling `FlowerPlus` Spring Boot backend.

## Run locally (PowerShell)

1. In `FlowerPlus`, prepare `.env` from `.env.example`, then start PostgreSQL, Redis, and Mailpit:

   ```powershell
   docker compose up -d
   ```

2. In a backend terminal, load that `.env` into the process and start Spring Boot:

   ```powershell
   Get-Content .env | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object { $pair = $_ -split '=', 2; [Environment]::SetEnvironmentVariable($pair[0], $pair[1], 'Process') }
   .\mvnw.cmd spring-boot:run
   ```

   The backend listens at `http://localhost:8080`. Its `dev` profile uses the `flowerplus` database; backend tests use their own `flowerplus_test` database, so they never erase locally created data (ADR 0008).

3. In `flowerplusfrontend`, start Next.js:

   ```powershell
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`. Next.js forwards `/api/*` to `http://localhost:8080/api/*`, so browser requests and the backend's HttpOnly cookies share the frontend origin. If the backend uses a different address, set `FLOWERPLUS_API_ORIGIN` in `flowerplusfrontend/.env.local` and restart Next.js.

4. Register at `/login`. Open Mailpit at `http://localhost:8025` to read the verification code. After verification or login, `/account` loads the signed-in profile and `/account/info` manages addresses.

## Frontend structure

The project uses the Next.js App Router. Folders under `src/app` define URLs and compose the page-level UI; the larger domain UI and state live under `src/features`.

```text
src/
├── app/                 Routes and page composition (URL → which screen)
│   ├── (storefront)/    Storefront home and shop (route group; no URL prefix)
│   ├── account/ admin/ login/ cart/ checkout/ product/
│   └── layout.tsx       Root document, fonts, and shared providers
├── features/<domain>/   Screens for one domain
│   ├── hooks/           Screen state and actions (calls services, holds no markup)
│   └── *.tsx            Components that render what their hook gives them
├── components/
│   ├── layout/          Header, footer, navigation
│   └── ui/              Reusable visual building blocks (Button, Notice, ModalDialog…)
└── lib/
    ├── api/             api() fetch client, ApiError, shared error messages
    ├── services/        One file per backend domain: endpoints, types, error wording
    ├── hooks/           Generic hooks: useResource, useAsyncAction, useCountdown…
    ├── types.ts         Shapes of the mock data (screens without a backend yet)
    ├── mock-data.ts     Temporary data, only read through services
    └── utils.ts         Formatting helpers (VND, dates, waits)
```

### The three layers

| Layer | Lives in | Does | Never does |
| --- | --- | --- | --- |
| **Service** | `lib/services/*.ts` | Calls the backend through `api()`, owns the request/response types, turns every failure into an `ApiError` whose `message` (and `fieldErrors` for forms) is ready to show, and shapes responses for the UI (e.g. a cart line's `problem`, a product's `availability`). | Touch React state or markup. |
| **Hook** | `features/<domain>/hooks/*.ts` | Holds a screen's state, calls services, decides what happens after success or failure (reload a list, close a dialog, redirect). | Build error text or call `fetch`. |
| **UI** | `app/**/page.tsx`, `features/**/*.tsx` | Renders what the hook or service returns. | Call the backend, catch errors, or contain business rules. |

### How a backend request flows

1. A component calls an action from its hook (or a server component awaits a service directly).
2. The hook calls a typed function in `src/lib/services/<domain>.ts`.
3. The service calls `api()` from `src/lib/api`, passing the error wording for that call. In the browser the request stays same-origin (`/api/...`), and the rewrite in `next.config.ts` forwards it to `FLOWERPLUS_API_ORIGIN` (default `http://localhost:8080`).
4. On success the service returns typed, UI-ready data. On failure `api()` throws an `ApiError`: lookup is network → HTTP status → backend `errorCode` → fallback, and tables without their own fallback also use the shared Vietnamese messages in `lib/api/messages.ts`.
5. The hook stores the data or `error.message` / `error.fieldErrors`; the component renders it. The backend stays responsible for validation and business rules.

For example, on `/admin` the Materials screen is `features/admin/MaterialManager.tsx` (markup only), its state lives in `features/admin/hooks/use-material-manager.ts`, and every request and message comes from `lib/services/materials.ts`.

### Current API coverage

- `/admin`: Products (list, search, create/edit Drafts, images, activate/deactivate/return to Draft), Materials (search, filters, sorting, paging, create/edit, status changes, details with audit fields), the Staff list, and an Admin-only Address lookup by ID. Staff account mutations are not wired in yet.
- `/account/info` reads the signed-in profile and manages the customer's own addresses (loading, empty, error, field-validation and 20-address limit states).
- Login, registration, email verification/resend, and forgot/reset password use the Auth backend. Google sign-in remains a placeholder.
- Storefront product list/detail, the server Cart, and COD checkout (`/checkout/delivery` → `/confirm` → `/done`) use the backend. Order history, vouchers, notifications and the sale showcase still use mock data through `services/account.ts` and `services/products.ts`.

Shared theme tokens and typography are defined in `src/app/globals.css` and `src/app/layout.tsx`.

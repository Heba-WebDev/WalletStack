# WalletStack Backend (NestJS Scaffold)

Minimal NestJS setup mirroring the deenAI backend structure (abstract base entity, model actions, path aliases). Feature modules will be added later.

## Prerequisites
- Node 18+
- npm or yarn
- PostgreSQL (for future TypeORM integration)

## Install
```bash
npm install
```

## Run (dev)
```bash
npm run start:dev
```

## Build
```bash
npm run build
```

## Test (placeholder)
```bash
npm test
```

## Project Structure
- `src/main.ts` — Nest bootstrap
- `src/app.module.ts` — root module (empty for now, modules will be added later)
- `src/entities/base.entity.ts` — abstract base entity (id, timestamps)
- `src/shared/abstract-model-action.ts` — reusable CRUD/model helper
- `src/shared/helpers/pagination.helper.ts` — pagination meta calculator

## Path Aliases
Configured in `tsconfig.json`:
- `@config/*` → `src/config/*`
- `@database/*` → `src/database/*`
- `@entities/*` → `src/entities/*`
- `@shared/*` → `src/shared/*`
- `@helpers/*` → `src/shared/helpers/*`

## Environment
- Use `env.example` (since dotfiles are blocked) and copy to `.env` manually:
  - `cp env.example .env`
- Variables:
  - `PORT=3000`
  - `NODE_ENV=development`
  - `DATABASE_URL=postgres://user:password@localhost:5432/walletstack`
  - `JWT_SECRET=change_me`
  - `JWT_EXPIRES_IN=1d`
  - `PAYSTACK_PUBLIC_KEY=pk_test_change_me`
  - `PAYSTACK_SECRET_KEY=psk_test_change_me`
  - `PAYSTACK_WEBHOOK_SECRET=whsec_change_me`
  - `API_KEY_MAX_ACTIVE=5`
  - `LOG_LEVEL=info`

## Next Steps
- Add database config (TypeORM data-source) and migrations
- Add auth, wallet, transactions, and API key modules
- Wire Paystack client and webhook validation
- Add global pipes/filters/interceptors as needed


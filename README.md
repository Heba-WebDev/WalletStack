# WalletStack Backend 💳⚡

Reliable wallet and payments service built with NestJS. Implements deposits via Paystack, secure wallet balances, transfers, API keys, and webhook-first crediting.

## ✨ Highlights
- 🔐 Google JWT auth & service API keys (with permissions, expiry, max 5 active)
- 💰 Wallets with atomic balance updates and transaction history
- 💸 Paystack deposits with mandatory webhook verification (idempotent)
- 🔁 Wallet-to-wallet transfers with balance checks
- 📜 Readable schema and SQL migrations scaffold-ready

## 🛠️ Tech Stack
- NestJS 11, TypeScript 5
- TypeORM (PostgreSQL target)
- Jest for testing

## 🚀 Getting Started
### Prerequisites
- Node 18+
- npm or yarn
- PostgreSQL

### Install
```bash
npm install
```

### Run (dev)
```bash
npm run dev        # alias for start:dev
```

### Build
```bash
npm run build
```

### Test (placeholder)
```bash
npm test
```

## 🌿 Environment
Use `env.example` as a template:
```bash
cp env.example .env
```

## 📐 Data Model
- `users` — Google-auth users
- `wallets` — one per user, unique `wallet_number`, non-negative balance
- `transactions` — deposits & transfers, unique `reference`, `sender_wallet_id`, `recipient_wallet_id`
- `paystack_transactions` — Paystack references, webhook status, idempotency flags
- `api_keys` — hashed keys, permissions array, expiry, rollover via `parent_key_id`
- `audit_logs` — records critical actions (actor: user or API key), action type, target entity, metadata, timestamp

## 📎 Database Schema Reference
- Diagram: https://drawsql.app/teams/mercadotop/diagrams/walletstack

## 🧑‍💻 Author
- Heba Omar


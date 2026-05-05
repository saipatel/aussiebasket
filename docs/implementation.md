# Implementation Documentation

Technical architecture, decisions, and development guidelines for AussieBasket.

---

## Stack (Planned)

| Layer       | Technology          |
|-------------|---------------------|
| Frontend    | React / Next.js     |
| Backend     | Node.js / Express   |
| Database    | PostgreSQL           |
| Auth        | JWT + bcrypt        |
| Payments    | Stripe              |
| Hosting     | AWS / Vercel        |
| CI/CD       | GitHub Actions      |

---

## Architecture Overview

```
Client (React/Next.js)
    │
    ▼
API Layer (Node.js/Express)
    │
    ├── Auth Service
    ├── Product Service
    ├── Basket Service
    ├── Order Service
    └── Payment Service
    │
    ▼
Database (PostgreSQL)
```

---

## Directory Structure

```
aussiebasket/
├── README.md
├── CHANGELOG.md
├── docs/
│   ├── features.md          # Feature descriptions
│   └── implementation.md    # This file
├── src/
│   ├── components/          # React components
│   ├── pages/               # Next.js pages / routes
│   ├── services/            # Business logic
│   ├── models/              # DB models / schemas
│   └── utils/               # Shared helpers
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
└── package.json
```

---

## Key Technical Decisions

### Australian Market Specifics
- All prices display in AUD with GST (10%) shown separately
- Postcode-based shipping calculation using Australian postal zones
- ABN validation for business accounts

### Authentication
- JWT tokens with 1-hour expiry + refresh token rotation
- Passwords hashed with bcrypt (cost factor 12)

### Basket Persistence
- Guest baskets stored in localStorage / session cookies
- Authenticated baskets persisted in PostgreSQL
- Basket merges on login

### Payments
- Stripe for card payments (PCI DSS compliant)
- PayPal as secondary option
- All amounts processed in AUD cents

---

## Environment Variables

```
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=
```

---

## Implementation Update Log

| Date       | Section             | Change                        |
|------------|---------------------|-------------------------------|
| 2026-05-05 | All                 | Initial documentation created |

# Tix API

A REST API for booking event tickets. Users can browse concerts, sports and other events, buy tickets, and cancel bookings.

## Tech stack

- **Runtime / language:** Node.js, TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL, accessed with [pg-promise](https://github.com/vitaly-t/pg-promise) using parameterized queries
- **Auth:** JSON Web Tokens (`jsonwebtoken`), passwords hashed with `bcrypt`
- **Validation:** Zod
- **Testing:** Vitest + Supertest (integration tests against a real PostgreSQL database)

## Features

- **Authentication.** Users register and log in. Passwords are hashed with bcrypt, and the API returns a JWT that is valid for 7 days.
- **User profile.** A logged-in user can view, update (name, email, password) or delete their own account. Email addresses must be unique.
- **Events.** List all events with venue and category info, or fetch one event together with its ticket types.
- **Event filtering.** Filter by `category_id`, `venue_id`, `city` (case-insensitive partial match), `date_from` and `date_to`.
- **Venues and categories.** List and look up venues and categories, and list all events at a given venue.
- **Bookings.** A logged-in user can book tickets, list their own bookings and cancel a booking.
- **Business rules for bookings:**
  - You can't book more tickets than are available.
  - You can't book tickets for an event that has already happened.
  - A booking can only be cancelled 24 hours or more before the event starts.
  - A booking can't be cancelled twice. Users can only cancel their own bookings (otherwise `403`).
  - Creating a booking and cancelling one each run in a database transaction, which keeps ticket stock in sync. A booking takes tickets out of `available_quantity` and a cancellation puts them back.
- **Validation.** Request bodies are checked with Zod schemas. Invalid input returns `400` with field-level error details.

## Getting started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer

### 1. Install

```bash
git clone https://github.com/oddnyhalldora21/tix-api.git
cd tix-api
npm install
```

### 2. Environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable      | Description                         |
| ------------- | ----------------------------------- |
| `DB_HOST`     | PostgreSQL host (e.g. `localhost`)  |
| `DB_PORT`     | PostgreSQL port (e.g. `5432`)       |
| `DB_NAME`     | Database name (e.g. `tix_api`)      |
| `DB_USER`     | PostgreSQL user                     |
| `DB_PASSWORD` | PostgreSQL password                 |
| `JWT_SECRET`  | Secret used to sign JWTs            |
| `PORT`        | Port for the API (defaults to 3000) |

### 3. Database setup

Create the database, then run the schema and seed files:

```bash
createdb tix_api
psql -d tix_api -f database/schema.sql
psql -d tix_api -f database/seed.sql
```

The seed adds 3 users, 4 venues, 5 categories, 7 events, 11 ticket types and 4 bookings. The seed users' passwords are placeholders, not real hashes. To log in, register a new user through the API.

Event dates in the seed are relative to the day you run it. Events 1–6 are always in the future, and event 7 is always in the past so the past-event booking rule can be tested.

### 4. Run

```bash
npm run dev      # development, auto-restarts with nodemon
# or
npm run build    # compile TypeScript to dist/
npm start        # run the compiled build
```

The API runs at `http://localhost:3000`.

### 5. Tests

```bash
npm test         # watch mode
npx vitest run   # single run
```

There are 31 integration tests in 3 files (`auth`, `bookings`, `events`). They send real HTTP requests with Supertest against the database configured in `.env`. They expect the seed data to be loaded. Re-run `seed.sql` to reset the data between runs.

## API reference

Base URL: `http://localhost:3000`

Protected endpoints require the header `Authorization: Bearer <token>`. You get the token from `/api/auth/register` or `/api/auth/login`.

| Method | Endpoint                  | Description                                                    | Auth |
| ------ | ------------------------- | -------------------------------------------------------------- | ---- |
| GET    | `/`                       | Health check                                                   | –    |
| POST   | `/api/auth/register`      | Register a user (`name`, `email`, `password` ≥ 6 chars)        | –    |
| POST   | `/api/auth/login`         | Log in (`email`, `password`) and get a JWT                     | –    |
| GET    | `/api/users/profile`      | Get the current user's profile                                 | JWT  |
| PUT    | `/api/users/profile`      | Update `name`, `email` and/or `password`                       | JWT  |
| DELETE | `/api/users/account`      | Delete the current user's account                              | JWT  |
| GET    | `/api/events`             | List events. Optional query: `category_id`, `venue_id`, `city`, `date_from`, `date_to` | – |
| GET    | `/api/events/:id`         | Get one event with venue details and its ticket types          | –    |
| GET    | `/api/venues`             | List venues                                                    | –    |
| GET    | `/api/venues/:id`         | Get one venue                                                  | –    |
| GET    | `/api/venues/:id/events`  | List events at a venue                                         | –    |
| GET    | `/api/categories`         | List categories                                                | –    |
| GET    | `/api/categories/:id`     | Get one category                                               | –    |
| POST   | `/api/bookings`           | Book tickets (`ticket_id`, `quantity`)                         | JWT  |
| GET    | `/api/bookings`           | List the current user's bookings with event and venue details | JWT  |
| DELETE | `/api/bookings/:id`       | Cancel a booking (only your own, at least 24 hours before the event) | JWT |

## Example requests

These responses were captured from a local run against the seed data. JWTs are shortened with `…`.

### Success: book tickets (`201`)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ticket_id": 1, "quantity": 2}'
```

```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 5,
    "user_id": 4,
    "ticket_id": 1,
    "quantity": 2,
    "total_price": "17800.00",
    "booking_date": "2026-11-06T13:06:08.565Z",
    "status": "confirmed"
  }
}
```

### Validation error (`400`)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Anna", "email": "not-an-email", "password": "123"}'
```

```json
{
  "error": "Validation failed",
  "details": [
    {
      "origin": "string",
      "code": "invalid_format",
      "format": "email",
      "pattern": "/^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/",
      "path": [
        "email"
      ],
      "message": "Invalid email format"
    },
    {
      "origin": "string",
      "code": "too_small",
      "minimum": 6,
      "inclusive": true,
      "path": [
        "password"
      ],
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

A business-rule violation also returns `400`, for example booking a ticket for a past event (`{"ticket_id": 11, "quantity": 1}`):

```json
{ "error": "Cannot book tickets for past events" }
```

### Not found (`404`)

```bash
curl http://localhost:3000/api/events/99999
```

```json
{ "error": "Event not found" }
```

### Auth error (`401`)

```bash
curl http://localhost:3000/api/bookings
```

```json
{ "error": "No token provided" }
```

An invalid or expired token returns:

```json
{ "error": "Invalid or expired token" }
```

## Folder structure

```
tix-api/
├── database/
│   ├── schema.sql        # Tables: users, venues, categories, events, tickets, bookings
│   └── seed.sql          # Sample data
├── src/
│   ├── config/           # PostgreSQL connection (pg-promise)
│   ├── controllers/      # Request handlers: auth, users, events, venues, categories, bookings
│   ├── middleware/       # JWT authentication middleware
│   ├── models/           # Database queries and booking transactions
│   ├── routes/           # Express routers
│   ├── utils/            # Password hashing / JWT helpers, Zod schemas
│   └── index.ts          # App entry point
├── tests/                # Vitest + Supertest integration tests
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

Built as my final project for the Full Stack Development diploma at NTV Promennt (backend semester).

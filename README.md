# Valuexpert MySQL Dashboard

A production-oriented, read-only Next.js 15 App Router dashboard for managers to inspect every MySQL database whose name contains `valuexpert`, without exposing credentials or other databases.

## Install

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=readonly_user
DB_PASSWORD=your_password
```

Use a MySQL account with read-only permissions for the `valuexpert`-named databases you want to inspect.

If your `CEO_CaLeads.Auth` table still has a `role` column, run `sql/remove_auth_role.sql` once to align the schema with the app.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Security Notes

- Databases are allowlisted by name pattern in `src/utils/validators.js`.
- API routes validate the database name and table name on every request.
- Tables are allowlisted dynamically from each matching database with `SHOW TABLES FROM <database>`.
- All public routes are read-only and perform no write, schema, or destructive SQL operations.
- MySQL credentials stay server-side in `.env.local`.

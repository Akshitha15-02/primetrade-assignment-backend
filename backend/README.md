# Backend - Primetrade Intern Assignment

## Stack
- Node.js, Express
- SQLite (file)
- JWT authentication, bcrypt
- Simple role-based access (user, admin)

## Setup
1. Install Node.js (v16+ recommended)
2. In `backend/` run:
   ```bash
   npm install
   npm run init-db
   npm start
   ```
3. Default admin created:
   - email: admin@primetrade.local
   - password: Admin@123

## API highlights
- POST /v1/auth/register
- POST /v1/auth/login
- GET/POST /v1/tasks (protected)
- GET/PUT/DELETE /v1/tasks/:id (protected; delete allowed only for admin or owner)

See `docs/swagger.json` for minimal API docs.
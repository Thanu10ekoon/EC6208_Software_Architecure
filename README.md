# SmartFines

Traffic fine payment platform with a Spring Boot REST API and React SPA.

## Project structure

- backend/ Spring Boot API (Maven)
- frontend/ React SPA (Vite)
- database/ MySQL initialization scripts

## Prerequisites

- Java 17
- Maven 3.9+
- Node.js 20+
- MySQL 8+

## 1) Initialize the database locally

1. Start MySQL and create the schema + seed admin user:

```sql
-- from a MySQL client
SOURCE database/init.sql;
```

2. Default admin credentials (development):

- Username: `admin1`
- Password: `Password01G`

## 1a) Access MySQL (CLI)

If `mysql` is on your PATH:

```bash
mysql -h localhost -P 3306 -u root
```

If `mysql` is not on your PATH (Windows PowerShell example):

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -h localhost -P 3306 -u root
```

To verify the schema:

```sql
SHOW DATABASES;
SHOW TABLES FROM smartfines;
```

## 2) Configure backend

Edit [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml):

- `spring.datasource.username`
- `spring.datasource.password`
- `app.jwt.secret` (min 32 chars)
- `spring.mail.*` if you want email delivery to be wired

## 3) Start backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

## 4) Configure frontend

Create a local `.env` file based on the example:

```bash
cd frontend
copy .env.example .env
```

Update `VITE_API_URL` if backend runs on a different host.

## 5) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## App roles

- Admin: manage officers, view stats
- Traffic Officer: issue fines, track status
- Driver: view fines, make payments, upload receipts

## Key endpoints

- `POST /api/auth/login`
- `POST /api/auth/driver-signup`
- `POST /api/admin/officers`
- `GET /api/admin/stats`
- `POST /api/fines`
- `GET /api/fines/driver`
- `POST /api/payments`
- `POST /api/payments/{id}/receipt`
- `GET /api/notifications`

## Notes

- Receipt files are stored under `backend/storage/receipts` by default.
- For production, move secrets to environment variables and rotate the admin seed user.

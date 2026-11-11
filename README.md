# Zeno API

NestJS backend sử dụng Prisma và PostgreSQL.

## Chạy PostgreSQL

```bash
docker compose up -d postgres
```

## Cài đặt và cấu hình

```bash
bun install
Copy-Item .env.example .env
bun run prisma:generate
bun run prisma:migrate --name init
```

## Chạy API

```bash
bun run dev
```

Health check: `GET http://localhost:4000/api/health`

Backend mặc định chạy tại `http://localhost:4000`; cập nhật `FRONTEND_URL` trong `.env` nếu frontend chạy ở origin khác.

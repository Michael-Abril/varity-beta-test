# Varity Beta Deployment Matrix

Local sanity check ran on Linux 6.18.5, Node v22.22.2, Python 3.11.15, against
fresh clones at HEAD as of 2026-05-05.

Local pass/fail reflects only this sandbox — Varity's build environment may
have different toolchains (e.g. Python 3.14, libpq-dev), so a local ❌ does
not mean a Varity ❌. Use this as input, not a verdict.

| #  | Framework | Local path        | Upstream                                                  | Local install | Local build | Pushed to GitHub | Varity detected as | Hosting mode | Deploy status | Notes |
|----|-----------|-------------------|-----------------------------------------------------------|---------------|-------------|------------------|--------------------|--------------|---------------|-------|
| 1  | Next.js   | `js-ts/nextjs`    | `ixartz/Next-js-Boilerplate`                              | ✅            | ❌          | ⬜               |                    |              |               | Build runs `db:migrate` (drizzle-kit) before `next build`; needs `DATABASE_URL` to a reachable Postgres. Set env on Varity or override the build command to skip migrations. |
| 2  | React     | `js-ts/react`     | `stefanbobrowski/vite-react-ts-starter`                   | ✅            | ✅          | ⬜               |                    |              |               | Plain Vite + React + TS. Static SPA. |
| 3  | Vue       | `js-ts/vue`       | `lecoueyl/vue3-template`                                  | ✅            | ✅          | ⬜               |                    |              |               | pnpm lockfile — Varity must auto-detect pnpm. |
| 4  | Express   | `js-ts/express`   | `w3tecch/express-typescript-boilerplate`                  | ❌            | ⏭ skipped   | ⬜               |                    |              |               | `bcrypt` native build fails on Node 22 (V8 API change). Local-env issue; Varity may pull a prebuilt binary or use an older Node. yarn lockfile. |
| 5  | Fastify   | `js-ts/fastify`   | `yonathan06/fastify-typescript-starter`                   | ✅            | ✅          | ⬜               |                    |              |               | Fastify + TS. Long-running server (`npm start`). |
| 6  | NestJS    | `js-ts/nestjs`    | `nestjs/typescript-starter`                               | ✅            | ✅          | ⬜               |                    |              |               | Long-running server. |
| 7  | Koa       | `js-ts/koa`       | `javieraviles/node-typescript-koa-rest`                   | ✅            | ✅          | ⬜               |                    |              |               | Long-running server. Has TypeORM + Postgres deps — runtime needs `DATABASE_URL`. |
| 8  | Hono      | `js-ts/hono`      | `honojs/starter` (subdir `templates/nodejs`)              | ✅            | ✅          | ⬜               |                    |              |               | Only the `templates/nodejs/` subdir was kept; multi-template structure removed locally. |
| 9  | FastAPI   | `python/fastapi`  | `rafsaf/minimal-fastapi-postgres-template`                | ❌            | n/a         | ⬜               |                    |              |               | Locally fails: `pyproject.toml` pins `requires-python = ">=3.14,<3.15"`; sandbox has 3.11. Varity should be fine if it provisions Python 3.14. **Needs `DATABASE_URL` (Postgres) on Varity.** |
| 10 | Django    | `python/django`   | `fceruti/django-starter-project`                          | ❌            | n/a         | ⬜               |                    |              |               | Locally fails: poetry-locked dep chain is bit-rot (`setuptools_scm` import error: `No module named 'pkg_resources'` on modern setuptools). Repo dates to ~2020. **Needs `DATABASE_URL` (Postgres) + likely `REDIS_URL`** on Varity. |
| 11 | Flask     | `python/flask`    | `tko22/flask-boilerplate`                                 | ❌            | n/a         | ⬜               |                    |              |               | Locally fails: `psycopg2==2.7.5` source build needs `libpq-fe.h` (libpq-dev). **Needs `DATABASE_URL` (Postgres)** on Varity. May also need libpq in the build image. |

## Legend

- ✅ pass · ❌ fail · ⏭ skipped (prereq failed) · ⬜ not yet done · n/a not applicable
- "Hosting mode" — fill in `static` / `server` / `serverless` based on what Varity offers per framework.
- "Varity detected as" — what the dashboard auto-detects this repo as.
- "Deploy status" — `live` / `failed` / `pending`, plus URL once live.

## Env vars likely required on Varity

| Repo            | Suspected env vars                                        |
|-----------------|-----------------------------------------------------------|
| `js-ts/nextjs`  | `DATABASE_URL` (Postgres, for drizzle migrate at build)   |
| `js-ts/koa`     | `DATABASE_URL` (Postgres, runtime via TypeORM)            |
| `python/fastapi`| `DATABASE_URL` (Postgres)                                 |
| `python/django` | `DATABASE_URL` (Postgres), possibly `REDIS_URL`           |
| `python/flask`  | `DATABASE_URL` (Postgres)                                 |

The 6 stateless ones (React, Vue, Fastify, NestJS, Hono, plus Express once
bcrypt resolves) likely deploy with no env wiring.

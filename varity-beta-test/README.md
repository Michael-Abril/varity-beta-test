# Varity Beta-Test Harness

A controlled multi-framework deployment test for [Varity](https://docs.varity.so).
Each subdirectory is an independent, freshly-initialized git repo containing a
reference starter for one framework Varity claims to support. The plan: push
each one to GitHub, deploy each via the Varity dashboard, record which
frameworks Varity auto-detects correctly and which fail.

## Frameworks under test

### JavaScript / TypeScript (8)

| Slot              | Upstream                                                           |
|-------------------|--------------------------------------------------------------------|
| `js-ts/nextjs`    | `ixartz/Next-js-Boilerplate`                                       |
| `js-ts/react`     | `stefanbobrowski/vite-react-ts-starter`                            |
| `js-ts/vue`       | `lecoueyl/vue3-template`                                           |
| `js-ts/express`   | `w3tecch/express-typescript-boilerplate`                           |
| `js-ts/fastify`   | `yonathan06/fastify-typescript-starter`                            |
| `js-ts/nestjs`    | `nestjs/typescript-starter`                                        |
| `js-ts/koa`       | `javieraviles/node-typescript-koa-rest`                            |
| `js-ts/hono`      | `honojs/starter` (only `templates/nodejs/` was kept)               |

### Python (3)

| Slot              | Upstream                                                |
|-------------------|---------------------------------------------------------|
| `python/fastapi`  | `rafsaf/minimal-fastapi-postgres-template`              |
| `python/django`   | `fceruti/django-starter-project`                        |
| `python/flask`    | `tko22/flask-boilerplate`                               |

Each subdir has had its upstream `.git` removed and replaced with a fresh
single-commit `main` branch, so they can be pushed to standalone GitHub repos
without inheriting upstream history.

## Local sanity-check results

Run on Node v22.22.2 / Python 3.11.15 / Linux 6.18.5. Full per-repo logs live
in `.logs/`.

| #  | Slot              | Install | Build | Notes                                                                   |
|----|-------------------|---------|-------|-------------------------------------------------------------------------|
| 1  | `js-ts/nextjs`    | ✅      | ❌    | `build` runs `db:migrate` (drizzle-kit) → needs reachable Postgres      |
| 2  | `js-ts/react`     | ✅      | ✅    |                                                                         |
| 3  | `js-ts/vue`       | ✅      | ✅    | pnpm                                                                    |
| 4  | `js-ts/express`   | ❌      | ⏭     | `bcrypt` native build fails on Node 22 (V8 API change)                  |
| 5  | `js-ts/fastify`   | ✅      | ✅    |                                                                         |
| 6  | `js-ts/nestjs`    | ✅      | ✅    |                                                                         |
| 7  | `js-ts/koa`       | ✅      | ✅    |                                                                         |
| 8  | `js-ts/hono`      | ✅      | ✅    | `templates/nodejs` only                                                 |
| 9  | `python/fastapi`  | ❌      | n/a   | `pyproject.toml` requires Python 3.14, env has 3.11                     |
| 10 | `python/django`   | ❌      | n/a   | poetry-locked deps from ~2020; `setuptools_scm` build chain bit-rotted  |
| 11 | `python/flask`    | ❌      | n/a   | `psycopg2==2.7.5` source build needs `libpq-fe.h` (libpq-dev)           |

A local ❌ does **not** mean a Varity ❌ — Varity's build environment may
have Python 3.14, libpq-dev, prebuilt bcrypt wheels, etc. The local check is
just a cheap pre-filter so we know what to expect.

## How to push everything to GitHub

1. Make sure `gh` is authenticated: `gh auth login`.
2. From inside this directory, run:

   ```bash
   ./push-all.sh <your-github-username-or-org>
   ```

   Add `--https` as a second arg if you don't have SSH keys set up:

   ```bash
   ./push-all.sh <your-github-username-or-org> --https
   ```

The script will, for each of the 11 slots:

1. Create a private GitHub repo named `varity-test-<framework>` under the
   given owner (skips creation if it already exists).
2. Add/update a local `origin` remote pointing at it.
3. `git push -u origin main`.
4. Print a summary table of every resulting GitHub URL.

It is idempotent — re-running just re-pushes. It does **not** push to any
existing remote unrelated to Varity testing.

## Next steps

1. Run `./push-all.sh <owner>` and copy the printed URLs.
2. Open https://app.varity.so → Deploy → for each repo:
   - Pick the GitHub repo from the list.
   - Note what Varity auto-detects it as (framework, hosting mode, build cmd).
   - Wire up env vars where needed (see "Env vars" below).
   - Hit deploy.
3. Record outcomes in `DEPLOYMENT_MATRIX.md`:
   - "Pushed to GitHub" → ✅ once it lands
   - "Varity detected as" → whatever the dashboard says
   - "Hosting mode" → static / server / serverless
   - "Deploy status" → live URL, or failure mode

## Env vars likely required on Varity

Five of the eleven repos expect a database. You will need to either provision
one through Varity (if it offers add-ons) or paste a connection string into
the dashboard's env-var UI before the first deploy.

| Repo            | Suspected env vars                                       |
|-----------------|----------------------------------------------------------|
| `js-ts/nextjs`  | `DATABASE_URL` (Postgres — drizzle migrate at build)     |
| `js-ts/koa`     | `DATABASE_URL` (Postgres — TypeORM at runtime)           |
| `python/fastapi`| `DATABASE_URL` (Postgres)                                |
| `python/django` | `DATABASE_URL` (Postgres), possibly `REDIS_URL`          |
| `python/flask`  | `DATABASE_URL` (Postgres)                                |

The other six (React, Vue, Fastify, NestJS, Hono, Express) should deploy
without env wiring on the first try.

## Files in this workspace

| Path                    | Purpose                                                |
|-------------------------|--------------------------------------------------------|
| `js-ts/`, `python/`     | The 11 framework slots, each its own git repo          |
| `DEPLOYMENT_MATRIX.md`  | Tracking spreadsheet for the dashboard run             |
| `push-all.sh`           | Bulk-create GitHub repos and push each slot's `main`   |
| `.logs/`                | Per-repo install/build logs from the local sanity pass |
| `README.md`             | This file                                              |

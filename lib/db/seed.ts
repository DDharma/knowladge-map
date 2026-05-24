import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { tracks, sections, topics, topicStages, STAGES } from './schema'
import { sql } from 'drizzle-orm'

const sqlite = new Database(process.env.DATABASE_URL ?? './data/prep.db')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite)

const TRACK_DATA = [
  {
    slug: 'fe', name: 'Frontend', icon: '🌐', sortOrder: 1,
    sections: [
      {
        slug: 'js-deep', name: 'JavaScript Deep', emoji: '📜', color: '#F7DF1E',
        priority: 'CORE SKILL', dayRange: '16', why: '6yr exp means owning the runtime — event loop, closures, async, modules. No hand-waving.',
        topics: [
          { title: 'Event loop — call stack, task queue, microtasks, requestAnimationFrame, starvation', isCritical: true },
          { title: 'Closures, lexical scope, hoisting, temporal dead zone, IIFE patterns', isCritical: true },
          { title: 'Prototypes, this binding (call/apply/bind), prototypal vs class inheritance', isCritical: true },
          { title: 'Promises deep — chaining, Promise.all/race/allSettled/any, error propagation', isCritical: true },
          { title: 'Async/await patterns — sequential vs parallel, error handling, AbortController, cancellation', isCritical: true },
          { title: 'Generators & iterators — yield, async iterators, lazy sequences, coroutines', isCritical: false },
          { title: 'ES modules vs CommonJS — dynamic imports, top-level await, tree shaking implications', isCritical: false },
          { title: 'Memory & GC — leaks (closures, listeners, timers), WeakRef, FinalizationRegistry, profiling', isCritical: false },
          { title: 'Destructuring, spread/rest, optional chaining, nullish coalescing, logical assignment', isCritical: false },
          { title: 'Functional patterns — pure functions, immutability, composition, currying, partial application', isCritical: false },
          { title: 'Modern APIs — structuredClone, AbortSignal.timeout, Intl, Temporal preview', isCritical: false },
        ],
      },
      {
        slug: 'ts-deep', name: 'TypeScript', emoji: '🔷', color: '#3178C6',
        priority: 'CORE SKILL', dayRange: '17', why: 'Type system is your safety net at scale — generics, conditional types, inference design.',
        topics: [
          { title: 'Type fundamentals — primitives, unions, intersections, literal types, narrowing flow', isCritical: true },
          { title: 'Generics — T extends, defaults, multiple type params, generic constraints', isCritical: true },
          { title: 'Conditional types — T extends U ? X : Y, distributive conditionals, infer keyword', isCritical: false },
          { title: 'Mapped types — keyof, in, as, Pick, Omit, Partial, Required, Record, ReturnType', isCritical: true },
          { title: 'Discriminated unions — tagged unions, exhaustive checks with never', isCritical: true },
          { title: 'Template literal types — string manipulation in the type system', isCritical: false },
          { title: 'Type predicates — `is X`, `asserts`, type guards, narrowing helpers', isCritical: false },
          { title: 'tsconfig — strict, noUncheckedIndexedAccess, paths, project references, isolatedModules', isCritical: false },
          { title: 'Module augmentation — declaring third-party types, .d.ts files, ambient modules', isCritical: false },
          { title: 'Type-level performance — instantiation depth, tsc --extendedDiagnostics, build perf', isCritical: false },
          { title: 'Zod / Valibot / ArkType — runtime validation paired with static types, inference', isCritical: false },
        ],
      },
      {
        slug: 'react-deep', name: 'React', emoji: '⚛️', color: '#61DAFB',
        priority: 'CORE SKILL', dayRange: '18', why: 'Senior React = render model + hooks + RSC + performance — not just useState/useEffect.',
        topics: [
          { title: 'Rendering model — reconciliation, fiber, keys, batching, commit phase', isCritical: true },
          { title: 'useState, useReducer — when each fits, lazy init, functional updates, batching gotchas', isCritical: true },
          { title: 'useEffect deeply — dep array, cleanup, race conditions, AbortController, double-fire in StrictMode', isCritical: true },
          { title: 'useMemo, useCallback — when they matter, when they don\'t, costs, useMemo for objects', isCritical: false },
          { title: 'useRef patterns — DOM refs, mutable values, forwardRef, useImperativeHandle', isCritical: false },
          { title: 'Context — when to use, performance pitfalls, splitting contexts, selector pattern', isCritical: true },
          { title: 'Custom hooks — composition, naming, testing, abstraction boundaries', isCritical: false },
          { title: 'React Server Components — server vs client, streaming, hydration, server/client boundary', isCritical: true },
          { title: 'Suspense, ErrorBoundary, useTransition, useDeferredValue, concurrent rendering', isCritical: false },
          { title: 'State libraries — Zustand, Jotai, Redux Toolkit, TanStack Query — when each fits', isCritical: false },
          { title: 'Forms — react-hook-form, controlled vs uncontrolled, validation with Zod schemas', isCritical: false },
          { title: 'Performance — React Profiler, why-did-you-render, re-render audits, list virtualization', isCritical: false },
        ],
      },
      {
        slug: 'nextjs', name: 'Next.js', emoji: '▲', color: '#FFFFFF',
        priority: 'CORE SKILL', dayRange: '19', why: 'App Router + RSC is the default. Know the rendering modes and the data layer cold.',
        topics: [
          { title: 'App Router vs Pages Router — file conventions, layouts, metadata, loading.tsx, error.tsx', isCritical: true },
          { title: 'Server vs Client components — "use client", composition, prop serialization rules', isCritical: true },
          { title: 'Data fetching — fetch caching, revalidate, force-cache vs no-store, cache tags', isCritical: true },
          { title: 'Rendering modes — static, dynamic, ISR, streaming, partial pre-rendering (PPR)', isCritical: true },
          { title: 'Server Actions — forms, mutations, revalidatePath/revalidateTag, security pitfalls', isCritical: true },
          { title: 'Middleware — Edge runtime, matchers, redirects, rewrite, auth gating patterns', isCritical: false },
          { title: 'next/image, next/font, next/script — automatic optimization and gotchas', isCritical: false },
          { title: 'Routing — dynamic segments, route groups, parallel & intercepting routes, slots', isCritical: false },
          { title: 'Deployment — Vercel, edge vs node runtime, env vars, build outputs, Open Telemetry', isCritical: false },
          { title: 'Migration — Pages Router → App Router incremental adoption strategy', isCritical: false },
        ],
      },
      {
        slug: 'fe-perf', name: 'Frontend Performance & Build', emoji: '⚡', color: '#FF8A00',
        priority: 'IMPORTANT', dayRange: '20', why: 'Performance separates senior from staff. Know the metrics, the bundle, and the cache.',
        topics: [
          { title: 'Core Web Vitals — LCP, INP (replaced FID), CLS — what to measure, what tools', isCritical: true },
          { title: 'Bundle analysis — webpack-bundle-analyzer, source-map-explorer, what to cut', isCritical: false },
          { title: 'Code splitting — dynamic imports, route-based, component-level, prefetch hints', isCritical: false },
          { title: 'Tree shaking — sideEffects flag, ESM-only deps, what breaks shaking', isCritical: false },
          { title: 'Webpack 5 — entry/output/loaders/plugins, module federation, persistent cache', isCritical: false },
          { title: 'Vite & esbuild — native ESM dev, Rollup prod, when Vite wins over Webpack', isCritical: false },
          { title: 'Caching — long-term content hashes, service workers, HTTP cache headers, CDN', isCritical: false },
          { title: 'Image optimization — WebP/AVIF, responsive srcset, lazy loading, LQIP, art direction', isCritical: false },
          { title: 'Critical rendering path — CSS/JS blocking, preload, prefetch, modulepreload', isCritical: false },
          { title: 'Runtime performance — virtualization, debounce/throttle, requestIdleCallback, web workers', isCritical: false },
          { title: 'Memory & leak hunting — Chrome DevTools heap snapshots, detached DOM, retained size', isCritical: false },
        ],
      },
      {
        slug: 'realtime-web', name: 'Real-time Web (WebSocket + WebRTC)', emoji: '📡', color: '#00C8B0',
        priority: 'IMPORTANT', dayRange: '21', why: 'Modern apps need live data and peer-to-peer. Understand the protocols, not just the libraries.',
        topics: [
          { title: 'WebSocket protocol — handshake, frames, ping/pong, close codes, reconnection backoff', isCritical: true },
          { title: 'Socket.IO — rooms, namespaces, fallbacks, Redis adapter for horizontal scaling', isCritical: false },
          { title: 'Server-Sent Events vs WebSocket vs long polling — when to choose which', isCritical: true },
          { title: 'WebRTC signaling — SDP offer/answer, ICE candidates, trickle ICE', isCritical: false },
          { title: 'WebRTC NAT traversal — STUN, TURN, when each is needed, hosting cost', isCritical: false },
          { title: 'WebRTC media — getUserMedia, MediaStream, codecs (VP8/VP9/H.264/AV1), simulcast', isCritical: false },
          { title: 'WebRTC data channels — reliable vs unreliable, ordered vs unordered, use cases', isCritical: false },
          { title: 'Real-time auth — token refresh on long-lived connections, kicking sessions, rate limits', isCritical: false },
          { title: 'Scaling real-time — sticky sessions, pub/sub fan-out, presence systems, SFU vs MCU', isCritical: false },
          { title: 'Latency, jitter, packet loss — adaptive bitrate, FEC, NACK, jitter buffer', isCritical: false },
        ],
      },
    ],
  },
  {
    slug: 'be-python', name: 'Backend Python', icon: '🐍', sortOrder: 2,
    sections: [
      {
        slug: 'python-core', name: 'Python Core', emoji: '🐍', color: '#4FC3F7',
        priority: 'FOUNDATION', dayRange: '1-2', why: 'Everything runs on Python. Weak fundamentals — weak everything.',
        topics: [
          { title: 'Data structures — list, dict, set, tuple + time complexity of each', isCritical: true },
          { title: 'OOP — classes, inheritance, dunder methods (__str__, __repr__, __eq__), dataclasses', isCritical: true },
          { title: 'Decorators — how they work, functools.wraps, real-world use cases', isCritical: true },
          { title: 'Generators & iterators — yield, lazy evaluation, memory efficiency', isCritical: false },
          { title: 'Context managers — with statement, __enter__/__exit__, contextlib', isCritical: false },
          { title: 'Async Python — asyncio, event loop, async/await, asyncio.gather()', isCritical: true },
          { title: 'Type hints — typing module, Optional, Union, Generic, TypeVar', isCritical: false },
          { title: 'Error handling patterns — custom exceptions, exception hierarchy, re-raising', isCritical: false },
          { title: 'Python packaging — pip, poetry, virtual environments, pyproject.toml', isCritical: false },
          { title: 'Comprehensions + builtins — list/dict/set comprehensions, map, filter, zip, enumerate', isCritical: false },
          { title: 'Python performance — profiling with cProfile, GIL, memory optimization', isCritical: false },
        ],
      },
      {
        slug: 'system-design', name: 'System Design', emoji: '🏗️', color: '#FF6B35',
        priority: 'CRITICAL', dayRange: '3-4', why: 'Every architect / senior interview has this. Biggest gap to close.',
        topics: [
          { title: 'HLD components — Load Balancer, API Gateway, Cache, Queue, CDN', isCritical: true },
          { title: 'Scalability patterns — horizontal vs vertical, auto-scaling (AWS ASG, K8s HPA)', isCritical: true },
          { title: 'CAP theorem — Consistency, Availability, Partition tolerance + real examples', isCritical: true },
          { title: 'Microservices vs Monolith — when to use which, migration strategy', isCritical: true },
          { title: 'Trade-off communication — structured answer framework (clarify→diagnose→layers→trade-offs)', isCritical: true },
          { title: 'Rate limiting algorithms — token bucket, leaky bucket, fixed window, sliding window', isCritical: false },
          { title: 'Consistent hashing — what it solves, ring hash, virtual nodes', isCritical: false },
          { title: 'Circuit breaker pattern — failure isolation, closed/open/half-open states', isCritical: false },
          { title: 'Design end-to-end — URL shortener (hashing, redirects, analytics)', isCritical: false },
          { title: 'Design end-to-end — File upload system with async processing pipeline', isCritical: false },
          { title: 'Twitter Trending Topics — memory test, answer without notes', isCritical: false },
          { title: 'Saga pattern — distributed transactions across microservices (choreography vs orchestration)', isCritical: false },
          { title: 'CQRS — Command Query Responsibility Segregation, event sourcing intro', isCritical: false },
        ],
      },
      {
        slug: 'databases', name: 'Databases', emoji: '🗄️', color: '#4ECDC4',
        priority: 'CRITICAL', dayRange: '5-6', why: 'Every backend system has a database. Weak here — weak system design answers.',
        topics: [
          { title: 'DBMS fundamentals — transactions, locking (optimistic/pessimistic), normalization 1NF-3NF', isCritical: true },
          { title: 'SQL indexing — B-Tree, composite index, covering index, when NOT to index', isCritical: true },
          { title: 'SQL query optimization — EXPLAIN ANALYZE, JOIN types, subquery vs join', isCritical: true },
          { title: 'PostgreSQL specific — JSONB columns, CTEs, window functions, full-text search', isCritical: false },
          { title: 'NoSQL types — Document, Key-Value, Column, Graph + use cases for each', isCritical: true },
          { title: 'Redis deep dive — String, Hash, List, Set, ZSet, pub/sub, streams, TTL, eviction', isCritical: true },
          { title: 'ACID vs BASE — full understanding with real examples (MongoDB, DynamoDB)', isCritical: true },
          { title: 'Data modeling — normalization vs denormalization, schema design decisions', isCritical: false },
          { title: 'Replication — sync vs async, read replicas, replication lag consequences', isCritical: false },
          { title: 'Sharding — shard key selection, cross-shard queries, fan-out solution, celebrity problem', isCritical: false },
          { title: 'Connection pooling — PgBouncer, SQLAlchemy pool_size, max_overflow settings', isCritical: false },
          { title: 'ORM concepts — N+1 problem, eager vs lazy loading, joinedload', isCritical: true },
          { title: 'SQLAlchemy — models, CRUD, relationships, Alembic migrations', isCritical: false },
          { title: 'Zero-downtime migrations — additive changes, shadow tables, dual writes strategy', isCritical: false },
          { title: 'ChromaDB — local-first vector DB, persistent client, collections, metadata filtering', isCritical: false },
          { title: 'Pinecone — managed vector DB, indexes, namespaces, sparse-dense vectors, hybrid search', isCritical: false },
        ],
      },
      {
        slug: 'fastapi', name: 'FastAPI', emoji: '⚡', color: '#A8E6CF',
        priority: 'CORE SKILL', dayRange: '7', why: 'Your primary framework. Must know it deeply, not just at the surface.',
        topics: [
          { title: 'Request/response lifecycle — ASGI, Starlette base, middleware chain order', isCritical: true },
          { title: 'Dependency injection — Depends(), nested deps, scoped DB session pattern', isCritical: true },
          { title: 'Async vs sync routes — when to use each, blocking I/O in async routes', isCritical: true },
          { title: 'Pydantic v2 — models, field validators, response_model, model_config, aliases', isCritical: true },
          { title: 'JWT auth — OAuth2PasswordBearer, token creation, refresh token rotation flow', isCritical: true },
          { title: 'Router organization — APIRouter, prefix, tags, router-level dependencies', isCritical: false },
          { title: 'Background tasks — BackgroundTasks vs Celery, when sync background is enough', isCritical: false },
          { title: 'WebSockets — real-time connections, ConnectionManager pattern, broadcast', isCritical: false },
          { title: 'Middleware — CORS, request logging, timing middleware, custom middleware class', isCritical: false },
          { title: 'File uploads — UploadFile, streaming large files, direct S3 presigned URL upload', isCritical: false },
          { title: 'Custom exception handlers — HTTPException, global error handler, validation errors', isCritical: false },
          { title: 'Testing FastAPI — TestClient, pytest, async test client, dependency override', isCritical: false },
          { title: 'FastAPI + SQLAlchemy — session lifecycle, get_db dependency, async sessions', isCritical: false },
          { title: 'Streaming responses — StreamingResponse, Server-Sent Events (SSE) for LLM output', isCritical: false },
        ],
      },
      {
        slug: 'flask', name: 'Flask', emoji: '🌶️', color: '#7B68EE',
        priority: 'MODERATE', dayRange: '7', why: 'Many production systems still run on Flask. Know it well enough to maintain, debug, and migrate.',
        topics: [
          { title: 'Flask fundamentals — app factory pattern, request/response cycle, routing, url_for', isCritical: false },
          { title: 'Blueprints — modular app structure, nested blueprints, URL prefixes, register_blueprint', isCritical: false },
          { title: 'Jinja2 templates — control flow, filters, macros, template inheritance, autoescape', isCritical: false },
          { title: 'Flask-SQLAlchemy — db.Model, sessions, relationships, Flask-Migrate workflow', isCritical: false },
          { title: 'Flask extensions — Flask-Login, Flask-WTF, Flask-CORS, Flask-RESTful, Flask-Caching', isCritical: false },
          { title: 'Authentication — Flask-Login session flow, Flask-JWT-Extended, role-based access', isCritical: false },
          { title: 'WSGI deployment — gunicorn, uwsgi, sync workers, threading vs gevent vs eventlet', isCritical: false },
          { title: 'Flask vs FastAPI — sync vs async, ecosystem maturity, when to migrate or pick which', isCritical: false },
          { title: 'Testing Flask — test_client, pytest fixtures, app context, request context', isCritical: false },
          { title: 'Production Flask — config patterns, secrets, structured logging, error handlers, before/after request hooks', isCritical: false },
        ],
      },
      {
        slug: 'backend-patterns', name: 'Backend Patterns & API Design', emoji: '🔧', color: '#FFB347',
        priority: 'CORE SKILL', dayRange: '8', why: 'What separates juniors from senior engineers. Pure architecture thinking.',
        topics: [
          { title: 'REST API design — resource naming, HTTP verbs, status codes, idempotency', isCritical: true },
          { title: 'API versioning strategies — URL (/v1/), header versioning, trade-offs', isCritical: false },
          { title: 'Pagination — offset vs cursor pagination, when to use each', isCritical: false },
          { title: 'Consistent error response schema — error codes, messages, request ID', isCritical: false },
          { title: 'Repository pattern — separating DB logic from business logic', isCritical: true },
          { title: 'Service layer pattern — business logic isolation, thin route handlers', isCritical: true },
          { title: 'Clean architecture — layers (entity, use case, interface, infra), dependency rule', isCritical: false },
          { title: 'Webhook design — delivery guarantees, retries, HMAC signature verification', isCritical: false },
          { title: 'Idempotency keys — preventing duplicate operations, Redis-based implementation', isCritical: false },
          { title: 'API rate limiting — token bucket with Redis, X-RateLimit headers, 429 response', isCritical: false },
        ],
      },
      {
        slug: 'security', name: 'Security', emoji: '🔒', color: '#FF6B6B',
        priority: 'IMPORTANT', dayRange: '9', why: 'Every production system needs this. JD explicitly mentions security standards.',
        topics: [
          { title: 'OWASP Top 10 — injection, broken auth, IDOR, security misconfig + mitigations', isCritical: true },
          { title: 'SQL injection — how it works, parameterized queries, how ORM prevents it', isCritical: true },
          { title: 'JWT security — expiry, rotation strategy, storage (httpOnly cookies vs localStorage)', isCritical: true },
          { title: 'OAuth2 flows — authorization code, client credentials, PKCE explained', isCritical: false },
          { title: 'API key management — hashing stored keys, scope-based permissions, revocation', isCritical: false },
          { title: 'Input validation as security — Pydantic as first line of defense', isCritical: false },
          { title: 'Secrets management — .env files, AWS Secrets Manager, never hardcode credentials', isCritical: false },
          { title: 'CORS — same-origin policy, preflight requests, how to configure correctly', isCritical: false },
        ],
      },
      {
        slug: 'testing', name: 'Testing', emoji: '🧪', color: '#CE93D8',
        priority: 'IMPORTANT', dayRange: '9', why: 'Production engineer = engineer who tests. Non-negotiable for senior roles.',
        topics: [
          { title: 'pytest fundamentals — fixtures, marks, parametrize, conftest.py, scope', isCritical: true },
          { title: 'Unit testing — arrange/act/assert, test isolation, single responsibility', isCritical: true },
          { title: 'Integration testing — testing DB + API together, test database setup/teardown', isCritical: false },
          { title: 'Mocking — unittest.mock, pytest-mock, patch decorator, MagicMock vs AsyncMock', isCritical: false },
          { title: 'Testing FastAPI endpoints — TestClient, override dependencies, auth mocking', isCritical: false },
          { title: 'Testing async code — pytest-asyncio, async fixtures, event loop scope', isCritical: false },
          { title: 'Test coverage — pytest-cov, line vs branch coverage, what the 80% rule means', isCritical: false },
        ],
      },
      {
        slug: 'queues-jobs', name: 'Message Queues & Background Jobs', emoji: '📨', color: '#80DEEA',
        priority: 'IMPORTANT', dayRange: '10', why: 'Every production AI system needs async job processing. You already use Celery.',
        topics: [
          { title: 'Why async queues — decoupling, reliability, handling slow/heavy operations', isCritical: true },
          { title: 'Celery fundamentals — tasks, workers, brokers, result backends, task states', isCritical: true },
          { title: 'Celery advanced — retry with exponential backoff, chord, group, chain, canvas', isCritical: false },
          { title: 'Celery Beat — scheduled tasks, crontab syntax, periodic task management', isCritical: false },
          { title: 'Redis as message broker — lists, streams, RPUSH/BLPOP pattern vs Redis Streams', isCritical: false },
          { title: 'RabbitMQ basics — exchanges, queues, routing keys, when to choose over Redis', isCritical: false },
          { title: 'Dead letter queues — failed job handling, poison messages, retry limits', isCritical: false },
          { title: 'At-least-once vs exactly-once delivery — idempotent task design pattern', isCritical: false },
        ],
      },
      {
        slug: 'docker-k8s', name: 'Docker + Kubernetes', emoji: '🐳', color: '#FF8B94',
        priority: 'CRITICAL', dayRange: '11', why: '1/10 currently. Will be exposed in any senior / architect interview immediately.',
        topics: [
          { title: 'Container vs VM — isolation levels, startup time, resource overhead, use cases', isCritical: true },
          { title: 'Dockerfile — FROM, RUN, COPY, CMD vs ENTRYPOINT, EXPOSE, multi-stage builds', isCritical: true },
          { title: 'Docker Compose — services, networks, volumes, depends_on, health checks, env files', isCritical: true },
          { title: 'Docker networking — bridge, host, overlay networks, container-to-container DNS', isCritical: false },
          { title: 'Why K8s exists — orchestration problem, what Docker alone cannot solve at scale', isCritical: true },
          { title: 'K8s core — Pod, Deployment, Service (ClusterIP/NodePort/LoadBalancer), Ingress', isCritical: true },
          { title: 'K8s config — ConfigMap, Secret, PersistentVolume, PersistentVolumeClaim, Namespace', isCritical: false },
          { title: 'K8s autoscaling — HPA configuration, resource requests and limits, scaling triggers', isCritical: false },
          { title: 'Helm basics — charts, values.yaml, templating, release management, why it exists', isCritical: false },
          { title: 'K8s rolling updates — zero-downtime deploy, readiness/liveness/startup probes', isCritical: false },
        ],
      },
      {
        slug: 'cloud', name: 'Cloud (AWS)', emoji: '☁️', color: '#FFD93D',
        priority: 'IMPORTANT', dayRange: '12', why: 'Most production systems run on AWS. Need solid working knowledge.',
        topics: [
          { title: 'EC2 — instance types, AMI, security groups, key pairs, user data scripts', isCritical: false },
          { title: 'S3 — buckets, presigned URLs, lifecycle policies, versioning, event triggers', isCritical: true },
          { title: 'RDS — managed PostgreSQL, automated backups, read replicas, parameter groups', isCritical: false },
          { title: 'Lambda — serverless functions, triggers, cold start problem, memory/timeout config', isCritical: false },
          { title: 'API Gateway — REST vs HTTP API, Lambda proxy integration, rate limiting, auth', isCritical: false },
          { title: 'SQS + SNS — queues vs pub/sub, visibility timeout, DLQ, fan-out pattern', isCritical: false },
          { title: 'VPC — subnets (public/private), security groups vs NACLs, NAT Gateway, peering', isCritical: false },
          { title: 'IAM — users, roles, policies, least privilege, instance profiles, assume role', isCritical: true },
          { title: 'CloudWatch — log groups, metrics, alarms, structured logging, log insights queries', isCritical: false },
          { title: 'Serverless vs container deployment — Lambda vs ECS vs EKS trade-offs', isCritical: false },
        ],
      },
      {
        slug: 'cicd', name: 'CI/CD', emoji: '🔄', color: '#C3A6FF',
        priority: 'MODERATE', dayRange: '12', why: 'Every team uses CI/CD. Understand pipelines and deploy strategies.',
        topics: [
          { title: 'Pipeline stages — lint → test → build → push image → deploy, fail fast principle', isCritical: true },
          { title: 'GitHub Actions — workflow YAML, triggers, jobs, steps, secrets, matrix builds', isCritical: true },
          { title: 'Docker in CI — build and push to ECR/DockerHub, layer caching optimization', isCritical: false },
          { title: 'Blue-green deployment — zero downtime, instant rollback, infrastructure cost', isCritical: false },
          { title: 'Canary deployment — gradual rollout %, feature flags, monitoring during rollout', isCritical: false },
          { title: 'Environment strategy — dev/staging/prod parity, environment variable management', isCritical: false },
        ],
      },
    ],
  },
  {
    slug: 'gen-ai', name: 'Gen AI', icon: '🤖', sortOrder: 3,
    sections: [
      {
        slug: 'ai-engineering', name: 'AI Engineering — Core', emoji: '🤖', color: '#6BCB77',
        priority: 'YOUR EDGE', dayRange: '13', why: 'Your differentiator. Go deep here — this is what makes you an AI Engineer.',
        topics: [
          { title: 'LLM fundamentals — tokens, context window, temperature, top_p, top_k, frequency penalty', isCritical: true },
          { title: 'Prompt engineering — system prompts, few-shot, chain of thought, structured JSON output', isCritical: true },
          { title: 'RAG pipeline — chunking → embedding → vector search → context injection → generation', isCritical: true },
          { title: 'Chunking strategies — fixed size, recursive text splitter, semantic chunking, overlap', isCritical: true },
          { title: 'Embeddings deep dive — cosine similarity, dot product, HNSW index algorithm', isCritical: true },
          { title: 'Vector databases — pgvector vs Pinecone vs Weaviate — operational trade-offs', isCritical: true },
          { title: 'Streaming responses — SSE implementation in FastAPI for real-time LLM output', isCritical: false },
          { title: 'Tool calling / function calling — schema design, execution loop, error handling', isCritical: true },
          { title: 'LLM cost optimization — caching, model routing (GPT-4 vs GPT-4o-mini), prompt compression', isCritical: false },
          { title: 'Fine-tuning vs RAG — when each applies, data requirements, cost comparison', isCritical: false },
          { title: 'Multi-modal models — vision inputs (base64 images), audio, when to use', isCritical: false },
          { title: 'OpenAI SDK — chat completions, embeddings, batch API, async client, retries', isCritical: true },
          { title: 'Anthropic Claude SDK — messages API, streaming, vision, tool use', isCritical: false },
          { title: 'LiteLLM — unified interface across providers, fallbacks, model routing', isCritical: false },
        ],
      },
      {
        slug: 'agentic-ai', name: 'Agentic AI', emoji: '🧠', color: '#F48FB1',
        priority: 'YOUR EDGE', dayRange: '14', why: 'The frontier of AI engineering. Where the industry is moving fastest.',
        topics: [
          { title: 'Agent architectures — ReAct (reason + act), Plan-and-Execute, reflection loop', isCritical: true },
          { title: 'LangChain fundamentals — LCEL, runnables, prompt templates, output parsers', isCritical: true },
          { title: 'LangGraph — state machines, nodes, edges, conditional routing, cycles, checkpointing', isCritical: true },
          { title: 'Memory systems — short-term (context window), long-term (vector store), episodic', isCritical: false },
          { title: 'Multi-agent systems — supervisor pattern, parallel agents, agent handoffs', isCritical: false },
          { title: 'Tool design for agents — tool schemas, error handling, confirmation patterns', isCritical: false },
          { title: 'OpenAI Responses API / Assistants API — threads, runs, tool calls, file search', isCritical: false },
          { title: 'Agent evaluation — trajectory evaluation, tool use accuracy, faithfulness metrics', isCritical: false },
        ],
      },
      {
        slug: 'llmops', name: 'LLMOps & Production AI', emoji: '📊', color: '#FFCC02',
        priority: 'IMPORTANT', dayRange: '14', why: 'Building LLM systems is easy. Running them reliably in production is hard.',
        topics: [
          { title: 'LLM observability — LangSmith, Phoenix/Arize, Helicone — tracing LLM call chains', isCritical: true },
          { title: 'Hallucination mitigation — grounding, citations, self-consistency, retrieval verification', isCritical: true },
          { title: 'Guardrails — NeMo Guardrails, Guardrails AI, input/output content filtering', isCritical: false },
          { title: 'PII detection and redaction — before sending user data to external LLM APIs', isCritical: false },
          { title: 'LLM evaluation frameworks — RAGAS (faithfulness, answer relevance, context recall)', isCritical: true },
          { title: 'Semantic caching — exact vs semantic cache hits, GPTCache, Redis vector cache', isCritical: false },
          { title: 'Prompt versioning — treating prompts as code, A/B testing, rollback strategy', isCritical: false },
          { title: 'LLM rate limiting — handling 429s, exponential backoff, provider fallback chain', isCritical: false },
          { title: 'Responsible AI — bias detection, transparency, data privacy, usage policy design', isCritical: false },
        ],
      },
      {
        slug: 'observability-advanced', name: 'Observability & Advanced Patterns', emoji: '🔭', color: '#9E9E9E',
        priority: 'ADVANCED', dayRange: '15', why: 'Senior engineers think about ops, not just features. Shows maturity.',
        topics: [
          { title: 'Observability pillars — logs vs metrics vs traces — the difference and when to use each', isCritical: true },
          { title: 'Structured logging — JSON logs, correlation IDs, log levels, log aggregation (ELK)', isCritical: false },
          { title: 'Distributed tracing — OpenTelemetry, trace context propagation, Jaeger, Zipkin', isCritical: false },
          { title: 'Metrics — Prometheus, counters/gauges/histograms, Grafana dashboards, alerting', isCritical: false },
          { title: 'Event-driven architecture — Kafka vs SQS, partitions, consumer groups, pub/sub', isCritical: false },
          { title: 'Service mesh — Istio basics, sidecar proxy, mTLS, traffic management, canary', isCritical: false },
          { title: 'gRPC vs REST — when to use, protobuf, bidirectional streaming, service-to-service', isCritical: false },
          { title: 'Consistent hashing deep dive — ring hash, virtual nodes, load distribution proof', isCritical: false },
        ],
      },
    ],
  },
  { slug: 'ml', name: 'Machine Learning', icon: '📊', sortOrder: 4, sections: [] },
  { slug: 'react-native', name: 'React Native', icon: '📱', sortOrder: 5, sections: [] },
  { slug: 'be-node', name: 'Backend Node.js', icon: '🟢', sortOrder: 6, sections: [] },
  { slug: 'be-golang', name: 'Backend Go', icon: '🐹', sortOrder: 7, sections: [] },
  { slug: 'be-rust', name: 'Backend Rust', icon: '🦀', sortOrder: 8, sections: [] },
]

async function seed() {
  console.log('Seeding database...')

  for (const trackData of TRACK_DATA) {
    // Upsert track
    const [track] = await db
      .insert(tracks)
      .values({ slug: trackData.slug, name: trackData.name, icon: trackData.icon, sortOrder: trackData.sortOrder })
      .onConflictDoUpdate({ target: tracks.slug, set: { name: trackData.name, icon: trackData.icon, sortOrder: trackData.sortOrder } })
      .returning()

    console.log(`Track: ${track.name} (id=${track.id})`)

    for (let si = 0; si < trackData.sections.length; si++) {
      const secData = trackData.sections[si]

      // Upsert section
      const [section] = await db
        .insert(sections)
        .values({
          trackId: track.id, slug: secData.slug, name: secData.name,
          emoji: secData.emoji, color: secData.color, priority: secData.priority,
          dayRange: secData.dayRange, why: secData.why, sortOrder: si,
        })
        .onConflictDoNothing()
        .returning()

      let sectionId: number
      if (section) {
        sectionId = section.id
      } else {
        // Already exists — find it
        const existing = sqlite.prepare('SELECT id FROM sections WHERE track_id = ? AND slug = ?').get(track.id, secData.slug) as { id: number }
        sectionId = existing.id
      }

      for (let ti = 0; ti < secData.topics.length; ti++) {
        const topicData = secData.topics[ti]

        const [topic] = await db
          .insert(topics)
          .values({ sectionId, title: topicData.title, isCritical: topicData.isCritical, sortOrder: ti })
          .onConflictDoNothing()
          .returning()

        const topicId = topic ? topic.id : (sqlite.prepare('SELECT id FROM topics WHERE section_id = ? AND title = ?').get(sectionId, topicData.title) as { id: number }).id

        // Pre-seed all 5 stages as not completed (idempotent)
        for (const stage of STAGES) {
          await db
            .insert(topicStages)
            .values({ topicId, stage, completed: false })
            .onConflictDoNothing()
        }
      }
    }
  }

  const topicCount = (sqlite.prepare('SELECT COUNT(*) as n FROM topics').get() as { n: number }).n
  const stageCount = (sqlite.prepare('SELECT COUNT(*) as n FROM topic_stages').get() as { n: number }).n
  console.log(`Done! ${topicCount} topics, ${stageCount} stage rows seeded.`)
}

seed().catch(console.error).finally(() => sqlite.close())

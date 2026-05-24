import Database from 'better-sqlite3'

const sqlite = new Database(process.env.DATABASE_URL ?? './data/prep.db')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Map old topic IDs to (section_slug, 1-based index)
const TOPIC_MAP: Record<string, [string, number]> = {
  // Python Core
  py1: ['python-core', 1], py2: ['python-core', 2], py3: ['python-core', 3],
  py4: ['python-core', 4], py5: ['python-core', 5], py6: ['python-core', 6],
  py7: ['python-core', 7], py8: ['python-core', 8], py9: ['python-core', 9],
  py10: ['python-core', 10], py11: ['python-core', 11],

  // System Design
  sd1: ['system-design', 1], sd2: ['system-design', 2], sd3: ['system-design', 3],
  sd4: ['system-design', 4], sd5: ['system-design', 5], sd6: ['system-design', 6],
  sd7: ['system-design', 7], sd8: ['system-design', 8], sd9: ['system-design', 9],
  sd10: ['system-design', 10], sd11: ['system-design', 11], sd12: ['system-design', 12],
  sd13: ['system-design', 13],

  // Databases (db0 = index 1)
  db0: ['databases', 1], db1: ['databases', 2], db2: ['databases', 3],
  db3: ['databases', 4], db4: ['databases', 5], db5: ['databases', 6],
  db6: ['databases', 7], db7: ['databases', 8], db8: ['databases', 9],
  db9: ['databases', 10], db10: ['databases', 11], db11: ['databases', 12],
  db12: ['databases', 13], db13: ['databases', 14], db14: ['databases', 15],
  db15: ['databases', 16],

  // FastAPI
  fa1: ['fastapi', 1], fa2: ['fastapi', 2], fa3: ['fastapi', 3], fa4: ['fastapi', 4],
  fa5: ['fastapi', 5], fa6: ['fastapi', 6], fa7: ['fastapi', 7], fa8: ['fastapi', 8],
  fa9: ['fastapi', 9], fa10: ['fastapi', 10], fa11: ['fastapi', 11], fa12: ['fastapi', 12],
  fa13: ['fastapi', 13], fa14: ['fastapi', 14],

  // Flask
  fl1: ['flask', 1], fl2: ['flask', 2], fl3: ['flask', 3], fl4: ['flask', 4],
  fl5: ['flask', 5], fl6: ['flask', 6], fl7: ['flask', 7], fl8: ['flask', 8],
  fl9: ['flask', 9], fl10: ['flask', 10],

  // Backend Patterns
  bp1: ['backend-patterns', 1], bp2: ['backend-patterns', 2], bp3: ['backend-patterns', 3],
  bp4: ['backend-patterns', 4], bp5: ['backend-patterns', 5], bp6: ['backend-patterns', 6],
  bp7: ['backend-patterns', 7], bp8: ['backend-patterns', 8], bp9: ['backend-patterns', 9],
  bp10: ['backend-patterns', 10],

  // Security
  se1: ['security', 1], se2: ['security', 2], se3: ['security', 3], se4: ['security', 4],
  se5: ['security', 5], se6: ['security', 6], se7: ['security', 7], se8: ['security', 8],

  // Testing
  te1: ['testing', 1], te2: ['testing', 2], te3: ['testing', 3], te4: ['testing', 4],
  te5: ['testing', 5], te6: ['testing', 6], te7: ['testing', 7],

  // Message Queues
  mq1: ['queues-jobs', 1], mq2: ['queues-jobs', 2], mq3: ['queues-jobs', 3],
  mq4: ['queues-jobs', 4], mq5: ['queues-jobs', 5], mq6: ['queues-jobs', 6],
  mq7: ['queues-jobs', 7], mq8: ['queues-jobs', 8],

  // Docker + K8s
  dk1: ['docker-k8s', 1], dk2: ['docker-k8s', 2], dk3: ['docker-k8s', 3],
  dk4: ['docker-k8s', 4], dk5: ['docker-k8s', 5], dk6: ['docker-k8s', 6],
  dk7: ['docker-k8s', 7], dk8: ['docker-k8s', 8], dk9: ['docker-k8s', 9],
  dk10: ['docker-k8s', 10],

  // Cloud
  cl1: ['cloud', 1], cl2: ['cloud', 2], cl3: ['cloud', 3], cl4: ['cloud', 4],
  cl5: ['cloud', 5], cl6: ['cloud', 6], cl7: ['cloud', 7], cl8: ['cloud', 8],
  cl9: ['cloud', 9], cl10: ['cloud', 10],

  // CI/CD
  ci1: ['cicd', 1], ci2: ['cicd', 2], ci3: ['cicd', 3],
  ci4: ['cicd', 4], ci5: ['cicd', 5], ci6: ['cicd', 6],

  // AI Engineering
  ai1: ['ai-engineering', 1], ai2: ['ai-engineering', 2], ai3: ['ai-engineering', 3],
  ai4: ['ai-engineering', 4], ai5: ['ai-engineering', 5], ai6: ['ai-engineering', 6],
  ai7: ['ai-engineering', 7], ai8: ['ai-engineering', 8], ai9: ['ai-engineering', 9],
  ai10: ['ai-engineering', 10], ai11: ['ai-engineering', 11], ai12: ['ai-engineering', 12],
  ai13: ['ai-engineering', 13], ai14: ['ai-engineering', 14],

  // Agentic AI
  ag1: ['agentic-ai', 1], ag2: ['agentic-ai', 2], ag3: ['agentic-ai', 3],
  ag4: ['agentic-ai', 4], ag5: ['agentic-ai', 5], ag6: ['agentic-ai', 6],
  ag7: ['agentic-ai', 7], ag8: ['agentic-ai', 8],

  // LLMOps
  lo1: ['llmops', 1], lo2: ['llmops', 2], lo3: ['llmops', 3], lo4: ['llmops', 4],
  lo5: ['llmops', 5], lo6: ['llmops', 6], lo7: ['llmops', 7], lo8: ['llmops', 8],
  lo9: ['llmops', 9],

  // Observability
  ob1: ['observability-advanced', 1], ob2: ['observability-advanced', 2],
  ob3: ['observability-advanced', 3], ob4: ['observability-advanced', 4],
  ob5: ['observability-advanced', 5], ob6: ['observability-advanced', 6],
  ob7: ['observability-advanced', 7], ob8: ['observability-advanced', 8],

  // JS Deep
  js1: ['js-deep', 1], js2: ['js-deep', 2], js3: ['js-deep', 3], js4: ['js-deep', 4],
  js5: ['js-deep', 5], js6: ['js-deep', 6], js7: ['js-deep', 7], js8: ['js-deep', 8],
  js9: ['js-deep', 9], js10: ['js-deep', 10], js11: ['js-deep', 11],

  // TypeScript
  ts1: ['ts-deep', 1], ts2: ['ts-deep', 2], ts3: ['ts-deep', 3], ts4: ['ts-deep', 4],
  ts5: ['ts-deep', 5], ts6: ['ts-deep', 6], ts7: ['ts-deep', 7], ts8: ['ts-deep', 8],
  ts9: ['ts-deep', 9], ts10: ['ts-deep', 10], ts11: ['ts-deep', 11],

  // React
  rc1: ['react-deep', 1], rc2: ['react-deep', 2], rc3: ['react-deep', 3],
  rc4: ['react-deep', 4], rc5: ['react-deep', 5], rc6: ['react-deep', 6],
  rc7: ['react-deep', 7], rc8: ['react-deep', 8], rc9: ['react-deep', 9],
  rc10: ['react-deep', 10], rc11: ['react-deep', 11], rc12: ['react-deep', 12],

  // Next.js
  nx1: ['nextjs', 1], nx2: ['nextjs', 2], nx3: ['nextjs', 3], nx4: ['nextjs', 4],
  nx5: ['nextjs', 5], nx6: ['nextjs', 6], nx7: ['nextjs', 7], nx8: ['nextjs', 8],
  nx9: ['nextjs', 9], nx10: ['nextjs', 10],

  // FE Perf
  fp1: ['fe-perf', 1], fp2: ['fe-perf', 2], fp3: ['fe-perf', 3], fp4: ['fe-perf', 4],
  fp5: ['fe-perf', 5], fp6: ['fe-perf', 6], fp7: ['fe-perf', 7], fp8: ['fe-perf', 8],
  fp9: ['fe-perf', 9], fp10: ['fe-perf', 10], fp11: ['fe-perf', 11],

  // Real-time Web
  rt1: ['realtime-web', 1], rt2: ['realtime-web', 2], rt3: ['realtime-web', 3],
  rt4: ['realtime-web', 4], rt5: ['realtime-web', 5], rt6: ['realtime-web', 6],
  rt7: ['realtime-web', 7], rt8: ['realtime-web', 8], rt9: ['realtime-web', 9],
  rt10: ['realtime-web', 10],
}

const STAGE_KEY_MAP: Record<string, string> = {
  read: 'R', write: 'W', understand: 'U', revised: 'Rv', perfect: 'P',
}

const PROGRESS_DATA: Record<string, Record<string, boolean>> = {
  py1: { read: false, write: false, understand: false, revised: false, perfect: false },
  py2: { read: false, write: false, understand: false, revised: false, perfect: false },
  py3: { read: false, write: false, understand: false, revised: false, perfect: false },
  py4: { read: false, write: false, understand: false, revised: false, perfect: false },
  py5: { read: false, write: false, understand: false, revised: false, perfect: false },
  py6: { read: false, write: false, understand: false, revised: false, perfect: false },
  py7: { read: false, write: false, understand: false, revised: false, perfect: false },
  py8: { read: false, write: false, understand: false, revised: false, perfect: false },
  py9: { read: false, write: false, understand: false, revised: false, perfect: false },
  py10: { read: false, write: false, understand: false, revised: false, perfect: false },
  py11: { read: false, write: false, understand: false, revised: false, perfect: false },
  sd1: { read: true, write: true, understand: true, revised: false, perfect: false },
  sd2: { read: true, write: true, understand: true, revised: false, perfect: false },
  sd3: { read: true, write: true, understand: true, revised: false, perfect: false },
  sd4: { read: true, write: true, understand: false, revised: false, perfect: false },
  sd5: { read: true, write: false, understand: false, revised: false, perfect: false },
  sd6: { read: true, write: true, understand: true, revised: false, perfect: false },
  sd7: { read: true, write: true, understand: false, revised: false, perfect: false },
  sd8: { read: true, write: true, understand: false, revised: false, perfect: false },
  sd9: { read: false, write: false, understand: false, revised: false, perfect: false },
  sd10: { read: false, write: false, understand: false, revised: false, perfect: false },
  sd11: { read: false, write: false, understand: false, revised: false, perfect: false },
  sd12: { read: false, write: false, understand: false, revised: false, perfect: false },
  sd13: { read: false, write: false, understand: false, revised: false, perfect: false },
  db0: { read: true, write: true, understand: true, revised: false, perfect: false },
  db1: { read: true, write: true, understand: true, revised: false, perfect: false },
  db2: { read: true, write: true, understand: false, revised: false, perfect: false },
  db3: { read: false, write: false, understand: false, revised: false, perfect: false },
  db4: { read: true, write: true, understand: true, revised: false, perfect: false },
  db5: { read: false, write: false, understand: false, revised: false, perfect: false },
  db6: { read: true, write: true, understand: true, revised: false, perfect: false },
  db7: { read: false, write: false, understand: false, revised: false, perfect: false },
  db8: { read: true, write: true, understand: false, revised: false, perfect: false },
  db9: { read: true, write: true, understand: false, revised: false, perfect: false },
  db10: { read: false, write: false, understand: false, revised: false, perfect: false },
  db11: { read: true, write: false, understand: false, revised: false, perfect: false },
  db12: { read: true, write: false, understand: false, revised: false, perfect: false },
  db13: { read: false, write: false, understand: false, revised: false, perfect: false },
  db14: { read: false, write: false, understand: false, revised: false, perfect: false },
  db15: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa1: { read: true, write: true, understand: true, revised: false, perfect: false },
  fa2: { read: true, write: true, understand: true, revised: false, perfect: false },
  fa3: { read: true, write: true, understand: true, revised: false, perfect: false },
  fa4: { read: true, write: true, understand: true, revised: false, perfect: false },
  fa5: { read: true, write: false, understand: false, revised: false, perfect: false },
  fa6: { read: true, write: false, understand: false, revised: false, perfect: false },
  fa7: { read: true, write: false, understand: false, revised: false, perfect: false },
  fa8: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa9: { read: true, write: false, understand: false, revised: false, perfect: false },
  fa10: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa11: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa12: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa13: { read: false, write: false, understand: false, revised: false, perfect: false },
  fa14: { read: true, write: false, understand: false, revised: false, perfect: false },
  fl1: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl2: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl3: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl4: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl5: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl6: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl7: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl8: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl9: { read: false, write: false, understand: false, revised: false, perfect: false },
  fl10: { read: false, write: false, understand: false, revised: false, perfect: false },
  bp1: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp2: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp3: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp4: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp5: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp6: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp7: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp8: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp9: { read: true, write: false, understand: false, revised: false, perfect: false },
  bp10: { read: true, write: false, understand: false, revised: false, perfect: false },
  se1: { read: true, write: false, understand: false, revised: false, perfect: false },
  se2: { read: true, write: false, understand: false, revised: false, perfect: false },
  se3: { read: true, write: false, understand: false, revised: false, perfect: false },
  se4: { read: false, write: false, understand: false, revised: false, perfect: false },
  se5: { read: false, write: false, understand: false, revised: false, perfect: false },
  se6: { read: true, write: false, understand: false, revised: false, perfect: false },
  se7: { read: true, write: false, understand: false, revised: false, perfect: false },
  se8: { read: true, write: false, understand: false, revised: false, perfect: false },
  te1: { read: false, write: false, understand: false, revised: false, perfect: false },
  te2: { read: false, write: false, understand: false, revised: false, perfect: false },
  te3: { read: false, write: false, understand: false, revised: false, perfect: false },
  te4: { read: false, write: false, understand: false, revised: false, perfect: false },
  te5: { read: false, write: false, understand: false, revised: false, perfect: false },
  te6: { read: false, write: false, understand: false, revised: false, perfect: false },
  te7: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq1: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq2: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq3: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq4: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq5: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq6: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq7: { read: false, write: false, understand: false, revised: false, perfect: false },
  mq8: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk1: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk2: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk3: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk4: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk5: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk6: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk7: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk8: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk9: { read: false, write: false, understand: false, revised: false, perfect: false },
  dk10: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl1: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl2: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl3: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl4: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl5: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl6: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl7: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl8: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl9: { read: false, write: false, understand: false, revised: false, perfect: false },
  cl10: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci1: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci2: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci3: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci4: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci5: { read: false, write: false, understand: false, revised: false, perfect: false },
  ci6: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai1: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai2: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai3: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai4: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai5: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai6: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai7: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai8: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai9: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai10: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai11: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai12: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai13: { read: false, write: false, understand: false, revised: false, perfect: false },
  ai14: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag1: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag2: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag3: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag4: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag5: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag6: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag7: { read: false, write: false, understand: false, revised: false, perfect: false },
  ag8: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo1: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo2: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo3: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo4: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo5: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo6: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo7: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo8: { read: false, write: false, understand: false, revised: false, perfect: false },
  lo9: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob1: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob2: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob3: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob4: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob5: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob6: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob7: { read: false, write: false, understand: false, revised: false, perfect: false },
  ob8: { read: false, write: false, understand: false, revised: false, perfect: false },
  js1: { read: false, write: false, understand: false, revised: false, perfect: false },
  js2: { read: false, write: false, understand: false, revised: false, perfect: false },
  js3: { read: false, write: false, understand: false, revised: false, perfect: false },
  js4: { read: false, write: false, understand: false, revised: false, perfect: false },
  js5: { read: false, write: false, understand: false, revised: false, perfect: false },
  js6: { read: false, write: false, understand: false, revised: false, perfect: false },
  js7: { read: false, write: false, understand: false, revised: false, perfect: false },
  js8: { read: false, write: false, understand: false, revised: false, perfect: false },
  js9: { read: false, write: false, understand: false, revised: false, perfect: false },
  js10: { read: false, write: false, understand: false, revised: false, perfect: false },
  js11: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts1: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts2: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts3: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts4: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts5: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts6: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts7: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts8: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts9: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts10: { read: false, write: false, understand: false, revised: false, perfect: false },
  ts11: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc1: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc2: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc3: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc4: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc5: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc6: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc7: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc8: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc9: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc10: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc11: { read: false, write: false, understand: false, revised: false, perfect: false },
  rc12: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx1: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx2: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx3: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx4: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx5: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx6: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx7: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx8: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx9: { read: false, write: false, understand: false, revised: false, perfect: false },
  nx10: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp1: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp2: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp3: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp4: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp5: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp6: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp7: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp8: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp9: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp10: { read: false, write: false, understand: false, revised: false, perfect: false },
  fp11: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt1: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt2: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt3: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt4: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt5: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt6: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt7: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt8: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt9: { read: false, write: false, understand: false, revised: false, perfect: false },
  rt10: { read: false, write: false, understand: false, revised: false, perfect: false },
}

const getTopicId = sqlite.prepare(`
  SELECT t.id FROM topics t
  JOIN sections s ON s.id = t.section_id
  WHERE s.slug = ? AND t.sort_order = ?
`)

const upsertStage = sqlite.prepare(`
  INSERT INTO topic_stages (topic_id, stage, completed, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(topic_id, stage) DO UPDATE SET
    completed = excluded.completed,
    updated_at = excluded.updated_at
`)

let updated = 0
let skipped = 0

sqlite.transaction(() => {
  for (const [oldId, stages] of Object.entries(PROGRESS_DATA)) {
    const mapping = TOPIC_MAP[oldId]
    if (!mapping) { skipped++; continue }

    const [sectionSlug, position] = mapping
    const row = getTopicId.get(sectionSlug, position - 1) as { id: number } | undefined
    if (!row) { console.warn(`  ⚠ Not found: ${oldId} → ${sectionSlug}[${position}]`); skipped++; continue }

    for (const [stageKey, completed] of Object.entries(stages)) {
      const stage = STAGE_KEY_MAP[stageKey]
      upsertStage.run(row.id, stage, completed ? 1 : 0)
    }
    updated++
  }
})()

const stagesDone = (sqlite.prepare('SELECT COUNT(*) as n FROM topic_stages WHERE completed = 1').get() as { n: number }).n
console.log(`Done! ${updated} topics updated, ${skipped} skipped. ${stagesDone} total stages marked complete.`)

sqlite.close()

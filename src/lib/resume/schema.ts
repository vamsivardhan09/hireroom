import { z } from 'zod';

export const ResumeParsedSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  headline: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  about: z.string().nullable().default(null),
  skills: z.array(z.string()).default([]),
  experience: z.string().nullable().default(null),
  availability: z.string().nullable().default(null),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().default(''),
      })
    )
    .default([]),
  links: z
    .object({
      linkedin: z.string().nullable().default(null),
      github: z.string().nullable().default(null),
      portfolio: z.string().nullable().default(null),
    })
    .default({
      linkedin: null,
      github: null,
      portfolio: null,
    }),
  confidence: z.record(z.string(), z.enum(['high', 'medium', 'low'])).default({}),
  lowConfidenceFields: z.array(z.string()).default([]),
});

export type ResumeParsedData = z.infer<typeof ResumeParsedSchema>;

/**
 * Normalization alias map: variants mapped to canonical skill names.
 * Never invent skills.
 */
export const SKILL_ALIAS_MAP: Record<string, string> = {
  // Languages
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  python3: 'Python',
  golang: 'Go',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  cpp: 'C++',
  cplusplus: 'C++',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',

  // Frameworks & Libraries
  react: 'React',
  'react.js': 'React',
  reactjs: 'React',
  next: 'Next.js',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  vue: 'Vue.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  express: 'Express',
  fastapi: 'FastAPI',
  flask: 'Flask',
  django: 'Django',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  graphql: 'GraphQL',

  // Databases & Cloud
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  psql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  supabase: 'Supabase',
  firebase: 'Firebase',
  aws: 'AWS',
  amazonwebservices: 'AWS',
  gcp: 'Google Cloud',
  googlecloud: 'Google Cloud',
  azure: 'Azure',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',

  // Design & Product
  figma: 'Figma',
  ui: 'UI/UX Design',
  ux: 'UI/UX Design',
  'ui/ux': 'UI/UX Design',
  wireframing: 'Wireframing',
  prototyping: 'Prototyping',
  aftereffects: 'After Effects',
  premiere: 'Premiere Pro',
  'power bi': 'Power BI',
  powerbi: 'Power BI',
  tableau: 'Tableau',
  sql: 'SQL',
};

/**
 * Normalizes raw skill strings using the alias map and caps at 25 skills.
 */
export function normalizeSkills(rawSkills: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of rawSkills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase().replace(/[^a-z0-9#+.]/g, '');
    const canonical = SKILL_ALIAS_MAP[key] || trimmed;

    if (!seen.has(canonical.toLowerCase())) {
      seen.add(canonical.toLowerCase());
      normalized.push(canonical);
    }

    if (normalized.length >= 25) break; // Cap at 25 skills as required by spec
  }

  return normalized;
}

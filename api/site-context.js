// Site context fed into the Magic AI Search LLM as ground-truth.
// Team, leadership, and expertise data are imported live from the same
// modules the website uses, so any content edit there flows through
// automatically — no duplicate copy to maintain here.

import { DIRECTOR_PROFILES } from '../src/data/directors.js'
import { TEAM } from '../src/data/team.js'
import { EXPERTISE_CARDS } from '../src/data/expertise.js'

const PAGES = [
  {
    path: '/',
    name: 'Home',
    summary:
      'Hero tagline: "Engineering Tomorrow, In Real Time." Showcases the MW Futuretech journey, expertise areas, team, and the Magic AI Search.',
  },
  {
    path: '/about',
    name: 'About',
    summary:
      'A studio engineering tomorrow, today. MW Futuretech is a small team of engineers, designers, and researchers building intelligent software for ambitious teams.',
  },
  {
    path: '/services',
    name: 'Services',
    summary:
      'Services engineered for scale. From research to production we architect software that ships, operates, and adapts. Covers the six expertise areas (Web Development, UI/UX Design, Branding & Identity, Performance Marketing, Automation & AI, Growth Strategy).',
  },
  {
    path: '/work',
    name: 'Work',
    summary:
      'Work that ships, scales, and sticks. A glimpse into recent engagements across fintech, infrastructure, and intelligent applications.',
  },
  {
    path: '/contact',
    name: 'Contact',
    summary:
      'Get Started. Reach out to start a project, partnership, or conversation with MW Futuretech.',
  },
]

const JOURNEY = [
  { phase: '01', title: 'Signal Mapping', detail: 'We read live data patterns, operational gaps, and decision moments that shape the business.' },
  { phase: '02', title: 'Context Layer', detail: 'Streams become clean events, memory, and model-ready context every interface can understand.' },
  { phase: '03', title: 'Adaptive Screens', detail: 'Workspaces adjust to role, intent, and urgency so teams see what matters before the queue gets noisy.' },
  { phase: '04', title: 'Workflow Agents', detail: 'AI-assisted agents route approvals, follow-ups, and escalations across people, APIs, and products.' },
  { phase: '05', title: 'Decision Mesh', detail: 'Every launch keeps learning from outcomes, closing the loop between live signals and better decisions.' },
]

const PRODUCT_POSITIONING = [
  'MW Futuretech turns live data into intelligent workflows, adaptive interfaces, and automated decisions.',
  'The MW Futuretech Agent OS enriches transaction data in real time, adding structure, accuracy, and intelligence at every layer.',
  'Magic AI Search lets users explore the MW Futuretech database and answer product/ad/store questions in natural language.',
]

function buildDirectorsBlock() {
  return Object.values(DIRECTOR_PROFILES)
    .map((profile) => (
      `- ${profile.name} — ${profile.role} at ${profile.organization} (profile page: /directors/${profile.slug}). ${profile.statementLead} ${profile.statementBody} ${profile.narrative}`
    ))
    .join('\n')
}

function buildTeamBlock() {
  return TEAM
    .map((member) => (
      `- ${member.name} — ${member.role}. ${member.bio} Skills: ${member.skills.join(', ')}.`
    ))
    .join('\n')
}

function buildExpertiseBlock() {
  return EXPERTISE_CARDS
    .map((card) => `- ${card.title}: ${card.description}`)
    .join('\n')
}

export function buildSiteContext() {
  const pagesBlock = PAGES.map((page) => `- ${page.name} (${page.path}): ${page.summary}`).join('\n')
  const journeyBlock = JOURNEY.map((step) => `- ${step.phase} ${step.title}: ${step.detail}`).join('\n')
  const positioningBlock = PRODUCT_POSITIONING.map((line) => `- ${line}`).join('\n')

  return [
    'COMPANY: MW Futuretech — a studio building intelligent systems, adaptive design, and next-generation technology for ambitious teams.',
    '',
    'PAGES (always recommend the relevant page by name and path):',
    pagesBlock,
    '',
    'JOURNEY / HOW WE WORK:',
    journeyBlock,
    '',
    'PRODUCT POSITIONING:',
    positioningBlock,
    '',
    'EXPERTISE AREAS (covered on the Services page /services):',
    buildExpertiseBlock(),
    '',
    'LEADERSHIP (covered on the About page /about, individual profiles at /directors/<slug>):',
    buildDirectorsBlock(),
    '',
    'TEAM (shown on the Home page /, team section):',
    buildTeamBlock(),
  ].join('\n')
}

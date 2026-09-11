export interface CinemaFile {
  id: string;
  path: string;
  name: string;
  folder: string;
  extension: string;
  loc: number;
  churn: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  lastUpdated?: number;
  status?: 'created' | 'modified' | 'deleted' | 'idle';
}

export interface CinemaCommit {
  hash: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  date: string;
  message: string;
  tag: 'FEATURE' | 'REFACTOR' | 'FIX' | 'DOCS' | 'RELEASE' | 'CHORE';
  chapter?: string;
  commentary: string;
  additions: number;
  deletions: number;
  files: {
    path: string;
    action: 'add' | 'modify' | 'delete';
    loc: number;
  }[];
}

export interface CinemaTimeline {
  repoName: string;
  description: string;
  stars: number;
  forks: number;
  era: string;
  chapters: { title: string; commitIndex: number; description: string }[];
  commits: CinemaCommit[];
}

export const getFileColor = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case 'ts':
    case 'tsx':
      return '#38bdf8'; // sky blue
    case 'js':
    case 'jsx':
      return '#facc15'; // amber yellow
    case 'css':
    case 'scss':
    case 'html':
      return '#f472b6'; // pink
    case 'py':
      return '#34d399'; // emerald
    case 'json':
    case 'yaml':
    case 'yml':
      return '#fb923c'; // orange
    case 'md':
      return '#a78bfa'; // violet
    case 'rs':
      return '#ef4444'; // red
    case 'go':
      return '#22d3ee'; // cyan
    default:
      return '#94a3b8'; // slate
  }
};

// ==========================================
// PRESET 1: Facebook / React (The Fiber & Hooks Revolution)
// ==========================================
export const REACT_CINEMA: CinemaTimeline = {
  repoName: 'facebook/react',
  description: 'The library for web and native user interfaces',
  stars: 228000,
  forks: 46000,
  era: '2013 – 2026',
  chapters: [
    { title: 'The Genesis', commitIndex: 0, description: 'Jordan Walke commits initial JSX and Virtual DOM prototype' },
    { title: 'Component Lifecycle', commitIndex: 5, description: 'Introduction of class components and synthetic event system' },
    { title: 'The Fiber Rewrite', commitIndex: 12, description: 'Complete reconciliation rewrite for asynchronous scheduling' },
    { title: 'The Hooks Revolution', commitIndex: 18, description: 'Dan Abramov & team announce useState and useEffect' },
    { title: 'React Server Components', commitIndex: 25, description: 'Next-gen streaming architecture for client-server fusion' }
  ],
  commits: [
    {
      hash: 'a1b2c3d',
      author: { name: 'Jordan Walke', handle: 'zpao', avatar: 'https://avatars.githubusercontent.com/u/100200?v=4' },
      date: '2013-05-29',
      message: 'Initial open source release of React and JSX parser',
      tag: 'RELEASE',
      chapter: 'The Genesis',
      commentary: 'React is open-sourced at JSConf US! Critics are initially skeptical of JSX and putting HTML in JavaScript.',
      additions: 1240,
      deletions: 0,
      files: [
        { path: 'src/core/React.js', action: 'add', loc: 420 },
        { path: 'src/core/ReactCompositeComponent.js', action: 'add', loc: 310 },
        { path: 'src/dom/ReactDOM.js', action: 'add', loc: 280 },
        { path: 'src/dom/JSXParser.js', action: 'add', loc: 230 }
      ]
    },
    {
      hash: 'b2c3d4e',
      author: { name: 'Sophie Alpert', handle: 'sophiebits', avatar: 'https://avatars.githubusercontent.com/u/6820?v=4' },
      date: '2013-08-14',
      message: 'Implement SyntheticEvent pooling for cross-browser reliability',
      tag: 'FEATURE',
      commentary: 'Synthetic events normalize bubbling and browser event discrepancies across Internet Explorer and Chrome.',
      additions: 450,
      deletions: 40,
      files: [
        { path: 'src/event/SyntheticEvent.js', action: 'add', loc: 260 },
        { path: 'src/event/EventPluginHub.js', action: 'add', loc: 190 },
        { path: 'src/dom/ReactDOM.js', action: 'modify', loc: 295 }
      ]
    },
    {
      hash: 'c3d4e5f',
      author: { name: 'Sebastian Markbåge', handle: 'sebmarkbage', avatar: 'https://avatars.githubusercontent.com/u/63648?v=4' },
      date: '2014-02-19',
      message: 'Unify reconciliation diff algorithm with batched updates',
      tag: 'REFACTOR',
      commentary: 'The tree diff algorithm is optimized to O(n) heuristic, allowing high-performance UI repaints.',
      additions: 680,
      deletions: 310,
      files: [
        { path: 'src/core/ReactMultiChild.js', action: 'add', loc: 380 },
        { path: 'src/core/ReactReconcileTransaction.js', action: 'add', loc: 300 },
        { path: 'src/core/ReactCompositeComponent.js', action: 'modify', loc: 390 }
      ]
    },
    {
      hash: 'd4e5f6g',
      author: { name: 'Paul O’Shannessy', handle: 'zpao', avatar: 'https://avatars.githubusercontent.com/u/100200?v=4' },
      date: '2014-07-22',
      message: 'Introduce React.createClass and propTypes validation warnings',
      tag: 'FEATURE',
      commentary: 'Developer experience leap: propTypes warn contributors in development mode if data contracts fail.',
      additions: 510,
      deletions: 80,
      files: [
        { path: 'src/core/ReactPropTypes.js', action: 'add', loc: 320 },
        { path: 'src/core/React.js', action: 'modify', loc: 470 },
        { path: 'test/ReactPropTypes-test.js', action: 'add', loc: 190 }
      ]
    },
    {
      hash: 'e5f6g7h',
      author: { name: 'Dan Abramov', handle: 'gaearon', avatar: 'https://avatars.githubusercontent.com/u/810438?v=4' },
      date: '2015-09-02',
      message: 'Decouple ReactDOM package from React core package',
      tag: 'REFACTOR',
      chapter: 'Component Lifecycle',
      commentary: 'Major milestone: React splits into react and react-dom packages, paving the road for React Native and VR.',
      additions: 890,
      deletions: 740,
      files: [
        { path: 'packages/react/index.js', action: 'add', loc: 180 },
        { path: 'packages/react-dom/index.js', action: 'add', loc: 420 },
        { path: 'src/dom/ReactDOM.js', action: 'delete', loc: 0 },
        { path: 'packages/react/src/ReactChildren.js', action: 'add', loc: 290 }
      ]
    },
    {
      hash: 'f6g7h8i',
      author: { name: 'Sebastian Markbåge', handle: 'sebmarkbage', avatar: 'https://avatars.githubusercontent.com/u/63648?v=4' },
      date: '2016-04-10',
      message: 'Fiber Prototype: Cooperative scheduling and coroutine work loop',
      tag: 'FEATURE',
      chapter: 'The Fiber Rewrite',
      commentary: 'Project Fiber begins in secret: replacing the recursive call stack with linked-list fiber nodes.',
      additions: 1400,
      deletions: 120,
      files: [
        { path: 'packages/react-reconciler/src/ReactFiber.js', action: 'add', loc: 560 },
        { path: 'packages/react-reconciler/src/ReactFiberScheduler.js', action: 'add', loc: 620 },
        { path: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', action: 'add', loc: 220 }
      ]
    },
    {
      hash: 'g7h8i9j',
      author: { name: 'Andrew Clark', handle: 'acdlite', avatar: 'https://avatars.githubusercontent.com/u/3624098?v=4' },
      date: '2017-09-26',
      message: 'React 16 Release: First production deployment of React Fiber',
      tag: 'RELEASE',
      commentary: 'React 16 drops with 100% backward compatibility while running on an entirely new asynchronous engine.',
      additions: 2100,
      deletions: 1800,
      files: [
        { path: 'packages/react-reconciler/src/ReactFiberBeginWork.js', action: 'add', loc: 740 },
        { path: 'packages/react-reconciler/src/ReactFiberCompleteWork.js', action: 'add', loc: 680 },
        { path: 'packages/react-dom/src/client/ReactDOMComponent.js', action: 'modify', loc: 510 }
      ]
    },
    {
      hash: 'h8i9j0k',
      author: { name: 'Dan Abramov', handle: 'gaearon', avatar: 'https://avatars.githubusercontent.com/u/810438?v=4' },
      date: '2018-10-25',
      message: 'RFC & Alpha: React Hooks (useState, useEffect, useContext)',
      tag: 'FEATURE',
      chapter: 'The Hooks Revolution',
      commentary: 'Sophie Alpert and Dan Abramov announce Hooks at React Conf 2018, fundamentally changing how frontends are written.',
      additions: 1650,
      deletions: 210,
      files: [
        { path: 'packages/react/src/ReactHooks.js', action: 'add', loc: 410 },
        { path: 'packages/react-reconciler/src/ReactFiberHooks.js', action: 'add', loc: 850 },
        { path: 'packages/react/src/ReactSharedInternals.js', action: 'add', loc: 180 },
        { path: 'packages/react/index.js', action: 'modify', loc: 210 }
      ]
    },
    {
      hash: 'i9j0k1l',
      author: { name: 'Brian Vaughn', handle: 'bvaughn', avatar: 'https://avatars.githubusercontent.com/u/197597?v=4' },
      date: '2019-08-15',
      message: 'React DevTools v4: Interactive flamegraphs and hook inspections',
      tag: 'FEATURE',
      commentary: 'Redesigned React DevTools gives visual debugging into component re-renders and suspended trees.',
      additions: 1200,
      deletions: 400,
      files: [
        { path: 'packages/react-devtools/src/backend/agent.js', action: 'add', loc: 520 },
        { path: 'packages/react-devtools/src/views/Profiler/Flamegraph.js', action: 'add', loc: 480 },
        { path: 'packages/react-devtools/src/views/Components/Tree.js', action: 'add', loc: 200 }
      ]
    },
    {
      hash: 'j0k1l2m',
      author: { name: 'Lauren Tan', handle: 'poteto', avatar: 'https://avatars.githubusercontent.com/u/1390709?v=4' },
      date: '2020-12-21',
      message: 'React Server Components Prototype (Flight client/server protocol)',
      tag: 'FEATURE',
      chapter: 'React Server Components',
      commentary: 'RSC merges the speed of static rendering with client-side interactivity, sending zero JS bundle to the client.',
      additions: 2400,
      deletions: 310,
      files: [
        { path: 'packages/react-server-dom-webpack/src/ReactFlightServer.js', action: 'add', loc: 720 },
        { path: 'packages/react-server-dom-webpack/src/ReactFlightClient.js', action: 'add', loc: 680 },
        { path: 'packages/react/src/ReactServerContext.js', action: 'add', loc: 320 }
      ]
    },
    {
      hash: 'k1l2m3n',
      author: { name: 'Ricky Hanlon', handle: 'rickyhanlon', avatar: 'https://avatars.githubusercontent.com/u/2440089?v=4' },
      date: '2024-04-25',
      message: 'React 19 Release: Actions, useOptimistic, and React Compiler integration',
      tag: 'RELEASE',
      commentary: 'React 19 arrives! Forget useMemo and useCallback — the compiler automates memoization across the entire component tree.',
      additions: 3100,
      deletions: 1100,
      files: [
        { path: 'packages/react/src/ReactActionQueue.js', action: 'add', loc: 640 },
        { path: 'packages/react/src/ReactOptimistic.js', action: 'add', loc: 390 },
        { path: 'compiler/src/HIR/HIRBuilder.ts', action: 'add', loc: 950 },
        { path: 'compiler/src/Optimization/Memoize.ts', action: 'add', loc: 820 }
      ]
    }
  ]
};

// ==========================================
// PRESET 2: Express.js (The Node.js Backbone)
// ==========================================
export const EXPRESS_CINEMA: CinemaTimeline = {
  repoName: 'expressjs/express',
  description: 'Fast, unopinionated, minimalist web framework for Node.js',
  stars: 64000,
  forks: 16000,
  era: '2010 – 2026',
  chapters: [
    { title: 'TJ’s Creation', commitIndex: 0, description: 'TJ Holowaychuk builds minimalist HTTP wrapper on Connect' },
    { title: 'Middleware Pipeline', commitIndex: 3, description: 'The legendary app.use(req, res, next) design takes form' },
    { title: 'Express 4.0 Decoupling', commitIndex: 6, description: 'Built-in middleware extracted into standalone micro-packages' },
    { title: 'Community Governance', commitIndex: 9, description: 'Transition to OpenJS Foundation with async router upgrades' }
  ],
  commits: [
    {
      hash: 'e1x0001',
      author: { name: 'TJ Holowaychuk', handle: 'tj', avatar: 'https://avatars.githubusercontent.com/u/25254?v=4' },
      date: '2010-06-26',
      message: 'Initial release of Express routing and view rendering engine',
      tag: 'RELEASE',
      chapter: 'TJ’s Creation',
      commentary: 'TJ Holowaychuk crafts Express inspired by Sinatra, creating the foundation for the entire Node.js server ecosystem.',
      additions: 850,
      deletions: 0,
      files: [
        { path: 'lib/express.js', action: 'add', loc: 320 },
        { path: 'lib/view.js', action: 'add', loc: 240 },
        { path: 'lib/response.js', action: 'add', loc: 290 }
      ]
    },
    {
      hash: 'e1x0002',
      author: { name: 'TJ Holowaychuk', handle: 'tj', avatar: 'https://avatars.githubusercontent.com/u/25254?v=4' },
      date: '2011-03-12',
      message: 'Integrate Connect middleware layers with parametric routing',
      tag: 'FEATURE',
      chapter: 'Middleware Pipeline',
      commentary: 'The famous `app.use(middleware)` pattern is cemented: requests cascade down an interceptor pipeline.',
      additions: 620,
      deletions: 110,
      files: [
        { path: 'lib/router/index.js', action: 'add', loc: 410 },
        { path: 'lib/router/route.js', action: 'add', loc: 280 },
        { path: 'lib/request.js', action: 'add', loc: 190 }
      ]
    },
    {
      hash: 'e1x0003',
      author: { name: 'Douglas Christopher Wilson', handle: 'dougwilson', avatar: 'https://avatars.githubusercontent.com/u/41373?v=4' },
      date: '2014-04-09',
      message: 'Express 4.0: Remove built-in middleware in favor of modular npm modules',
      tag: 'RELEASE',
      chapter: 'Express 4.0 Decoupling',
      commentary: 'BodyParser, Session, and CookieParser become separate npm packages, shedding bloat and stabilizing the core.',
      additions: 920,
      deletions: 1400,
      files: [
        { path: 'lib/middleware/init.js', action: 'add', loc: 140 },
        { path: 'lib/middleware/query.js', action: 'add', loc: 110 },
        { path: 'lib/router/layer.js', action: 'add', loc: 310 },
        { path: 'lib/express.js', action: 'modify', loc: 290 }
      ]
    },
    {
      hash: 'e1x0004',
      author: { name: 'Wes Todd', handle: 'wesleytodd', avatar: 'https://avatars.githubusercontent.com/u/1027776?v=4' },
      date: '2024-09-10',
      message: 'Express 5.0 Release: Native Promise handling and router modernization',
      tag: 'RELEASE',
      chapter: 'Community Governance',
      commentary: 'Express 5.0 lands after a decade in testing: automatic rejected Promise catch and modern Node.js HTTP standards.',
      additions: 1150,
      deletions: 620,
      files: [
        { path: 'lib/router/index.js', action: 'modify', loc: 510 },
        { path: 'lib/router/route.js', action: 'modify', loc: 340 },
        { path: 'lib/response.js', action: 'modify', loc: 420 }
      ]
    }
  ]
};

// ==========================================
// PRESET 3: OpenSource-Connect (Our Project)
// ==========================================
export const OPENSOURCE_CONNECT_CINEMA: CinemaTimeline = {
  repoName: 'Ahiram15/OpenSource-Connect',
  description: 'AI-driven Open Source Contributor Intelligence, Real-time Tracker & Git Cinema',
  stars: 48,
  forks: 12,
  era: '2026',
  chapters: [
    { title: 'Inception & Core Bridge', commitIndex: 0, description: 'Express backend and GitHub OAuth authentication pipeline' },
    { title: 'Developer Intelligence & Charts', commitIndex: 3, description: 'Recharts visual analytics and developer skill radar' },
    { title: 'FirstIssue.dev Paradigm Shift', commitIndex: 6, description: 'Live Contribution Tracker, Status Pipeline, and Gemini Copilot' },
    { title: 'Cinema & Proof-of-Work PDF', commitIndex: 9, description: 'A4 Vector PDF portfolio export and interactive Git Cinema theater' }
  ],
  commits: [
    {
      hash: 'c01a01',
      author: { name: 'Ahiram', handle: 'Ahiram15', avatar: 'https://avatars.githubusercontent.com/u/987654?v=4' },
      date: '2026-03-01',
      message: 'feat: Initial project structure with Vite, React 19, and Express',
      tag: 'FEATURE',
      chapter: 'Inception & Core Bridge',
      commentary: 'Repository initialized with client-server architecture, modern styling tokens, and GitHub OAuth authentication.',
      additions: 980,
      deletions: 0,
      files: [
        { path: 'client/src/App.tsx', action: 'add', loc: 140 },
        { path: 'client/src/index.css', action: 'add', loc: 290 },
        { path: 'server/src/server.ts', action: 'add', loc: 210 },
        { path: 'server/src/routes/auth.ts', action: 'add', loc: 180 }
      ]
    },
    {
      hash: 'c02a02',
      author: { name: 'Ahiram', handle: 'Ahiram15', avatar: 'https://avatars.githubusercontent.com/u/987654?v=4' },
      date: '2026-03-03',
      message: 'feat: GitHub API integration & user profile extractor',
      tag: 'FEATURE',
      commentary: 'Connects directly to GitHub REST API to extract public repositories, star counts, and technical interests.',
      additions: 640,
      deletions: 40,
      files: [
        { path: 'client/src/services/api.ts', action: 'add', loc: 290 },
        { path: 'client/src/pages/Profile.tsx', action: 'add', loc: 320 },
        { path: 'server/src/routes/github.ts', action: 'add', loc: 190 }
      ]
    },
    {
      hash: 'c03a03',
      author: { name: 'Ahiram', handle: 'Ahiram15', avatar: 'https://avatars.githubusercontent.com/u/987654?v=4' },
      date: '2026-03-05',
      message: 'feat: Developer Intelligence Dashboard with Recharts & activity heatmap',
      tag: 'FEATURE',
      chapter: 'Developer Intelligence & Charts',
      commentary: 'Implemented high-impact visual dashboard with language distribution pie chart and commit activity heatmaps.',
      additions: 890,
      deletions: 60,
      files: [
        { path: 'client/src/pages/Dashboard.tsx', action: 'add', loc: 680 },
        { path: 'client/src/pages/IssueList.tsx', action: 'add', loc: 290 }
      ]
    },
    {
      hash: 'c04a04',
      author: { name: 'Ahiram', handle: 'Ahiram15', avatar: 'https://avatars.githubusercontent.com/u/987654?v=4' },
      date: '2026-03-08',
      message: 'feat: Contribution Tracker with live GitHub sync pipeline & merge rate',
      tag: 'FEATURE',
      chapter: 'FirstIssue.dev Paradigm Shift',
      commentary: 'Engineered FirstIssue.dev-inspired real-time contribution tracking: Saved, Applied, In Progress, Merged, and Closed.',
      additions: 1120,
      deletions: 110,
      files: [
        { path: 'client/src/pages/ContributionTracker.tsx', action: 'add', loc: 560 },
        { path: 'client/src/components/GlobalChatCopilot.tsx', action: 'add', loc: 490 },
        { path: 'client/src/App.tsx', action: 'modify', loc: 210 }
      ]
    },
    {
      hash: 'c05a05',
      author: { name: 'Ahiram', handle: 'Ahiram15', avatar: 'https://avatars.githubusercontent.com/u/987654?v=4' },
      date: '2026-03-10',
      message: 'feat: Verified Contributor PDF Export and Git Cinema Visual Replay',
      tag: 'RELEASE',
      chapter: 'Cinema & Proof-of-Work PDF',
      commentary: 'Added vector-rendered A4 PDF proof-of-work export, and introduced Git Cinema for animated codebase exploration.',
      additions: 1450,
      deletions: 90,
      files: [
        { path: 'client/src/utils/pdfExport.ts', action: 'add', loc: 380 },
        { path: 'client/src/utils/gitCinemaData.ts', action: 'add', loc: 410 },
        { path: 'client/src/pages/GitCinema.tsx', action: 'add', loc: 720 },
        { path: 'client/src/pages/Dashboard.tsx', action: 'modify', loc: 820 }
      ]
    }
  ]
};

// ==========================================
// LIVE GITHUB REPO INGESTION
// ==========================================
export const fetchLiveRepoTimeline = async (ownerRepo: string): Promise<CinemaTimeline> => {
  const clean = ownerRepo.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/\/$/, '');
  const [owner, repo] = clean.split('/');
  if (!owner || !repo) {
    throw new Error('Please enter a valid "owner/repo" or GitHub URL');
  }

  // 1. Fetch repo metadata
  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!metaRes.ok) {
    throw new Error(`Could not find GitHub repository: ${clean}`);
  }
  const meta = await metaRes.json();

  // 2. Fetch last 30 commits
  const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`);
  if (!commitsRes.ok) {
    throw new Error(`Failed to fetch commits for: ${clean}`);
  }
  const rawCommits = await commitsRes.json();

  // Reverse so commits play in chronological order (earliest -> latest)
  const chronological = [...rawCommits].reverse();

  const mockFileSets = [
    ['src/index.ts', 'src/core/engine.ts', 'package.json', 'README.md'],
    ['src/components/App.tsx', 'src/styles/theme.css', 'src/utils/helpers.ts'],
    ['src/routes/api.ts', 'src/controllers/auth.ts', 'tests/api.test.ts'],
    ['docs/ARCHITECTURE.md', 'src/services/db.ts', 'Dockerfile'],
    ['src/hooks/useData.ts', 'src/components/Card.tsx', 'public/favicon.svg']
  ];

  const parsedCommits: CinemaCommit[] = chronological.map((c: any, idx: number) => {
    const msg = c.commit?.message?.split('\n')[0] || 'Update codebase';
    let tag: CinemaCommit['tag'] = 'CHORE';
    const lower = msg.toLowerCase();
    if (lower.startsWith('feat') || lower.includes('add') || lower.includes('feature')) tag = 'FEATURE';
    else if (lower.startsWith('fix') || lower.includes('bug')) tag = 'FIX';
    else if (lower.startsWith('refactor') || lower.includes('clean')) tag = 'REFACTOR';
    else if (lower.startsWith('docs') || lower.includes('readme')) tag = 'DOCS';
    else if (lower.includes('release') || lower.includes('v1.') || lower.includes('v2.')) tag = 'RELEASE';

    const fileSet = mockFileSets[idx % mockFileSets.length];
    const additions = Math.floor(Math.random() * 400) + 50;
    const deletions = Math.floor(Math.random() * 150);

    return {
      hash: c.sha ? c.sha.substring(0, 7) : `commit_${idx}`,
      author: {
        name: c.commit?.author?.name || c.author?.login || 'Developer',
        handle: c.author?.login || 'contributor',
        avatar: c.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
      },
      date: c.commit?.author?.date ? c.commit.author.date.split('T')[0] : '2026-03-01',
      message: msg,
      tag,
      chapter: idx === 0 ? 'Initial Exploration' : idx === Math.floor(chronological.length / 2) ? 'Core Architecture Wave' : undefined,
      commentary: `Commit #${idx + 1} by @${c.author?.login || 'dev'}: "${msg}". Changes include ${additions} line additions across ${fileSet.length} files.`,
      additions,
      deletions,
      files: fileSet.map((p, i) => ({
        path: p,
        action: i === 0 && idx < 5 ? 'add' : i === 2 && idx % 3 === 0 ? 'delete' : 'modify',
        loc: Math.floor(Math.random() * 350) + 80
      }))
    };
  });

  return {
    repoName: `${owner}/${repo}`,
    description: meta.description || 'Open source project hosted on GitHub',
    stars: meta.stargazers_count || 0,
    forks: meta.forks_count || 0,
    era: 'Live Timeline',
    chapters: [
      { title: 'Project Inception', commitIndex: 0, description: 'Earliest fetched commits in active development' },
      { title: 'Midpoint Milestone', commitIndex: Math.floor(parsedCommits.length / 2), description: 'Feature expansion & active contributor momentum' },
      { title: 'Recent Head', commitIndex: parsedCommits.length - 1, description: 'Latest commits at repository HEAD' }
    ],
    commits: parsedCommits
  };
};

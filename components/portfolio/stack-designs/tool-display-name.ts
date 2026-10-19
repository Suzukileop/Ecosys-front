/**
 * Official spelling for well-known tool / brand names typed in lowercase
 * ("github" → "GitHub"). Only all-lowercase input is normalized: any casing the
 * creator chose on purpose ("Github", "JAVA") is kept as-is.
 */
const OFFICIAL_TOOL_NAMES: Record<string, string> = {
  'adobe after effects': 'Adobe After Effects',
  'adobe illustrator': 'Adobe Illustrator',
  'adobe lightroom': 'Adobe Lightroom',
  'adobe photoshop': 'Adobe Photoshop',
  'adobe premiere pro': 'Adobe Premiere Pro',
  'after effects': 'After Effects',
  'chatgpt': 'ChatGPT',
  'capcut': 'CapCut',
  'canva': 'Canva',
  'css': 'CSS',
  'davinci resolve': 'DaVinci Resolve',
  'discord': 'Discord',
  'docker': 'Docker',
  'facebook': 'Facebook',
  'figma': 'Figma',
  'final cut pro': 'Final Cut Pro',
  'framer': 'Framer',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'html': 'HTML',
  'illustrator': 'Illustrator',
  'instagram': 'Instagram',
  'java': 'Java',
  'javascript': 'JavaScript',
  'linkedin': 'LinkedIn',
  'mongodb': 'MongoDB',
  'mysql': 'MySQL',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'notion': 'Notion',
  'photoshop': 'Photoshop',
  'php': 'PHP',
  'postgresql': 'PostgreSQL',
  'premiere pro': 'Premiere Pro',
  'python': 'Python',
  'react': 'React',
  'slack': 'Slack',
  'spring boot': 'Spring Boot',
  'tailwind css': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'tiktok': 'TikTok',
  'twitch': 'Twitch',
  'typescript': 'TypeScript',
  'visual studio code': 'Visual Studio Code',
  'vs code': 'VS Code',
  'vscode': 'VS Code',
  'webflow': 'Webflow',
  'wordpress': 'WordPress',
  'x': 'X',
  'youtube': 'YouTube',
};

export function toolDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed !== trimmed.toLowerCase()) return trimmed;
  return OFFICIAL_TOOL_NAMES[trimmed.replace(/\s+/g, ' ')] ?? trimmed;
}

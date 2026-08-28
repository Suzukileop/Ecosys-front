'use client';

import type { ComponentType, SVGProps } from 'react';
import {
  SiAndroid,
  SiAndroidstudio,
  SiAngular,
  SiAnthropic,
  SiAstro,
  SiAudacity,
  SiBehance,
  SiBlender,
  SiBun,
  SiCinema4d,
  SiClaude,
  SiCplusplus,
  SiCursor,
  SiCypress,
  SiDavinciresolve,
  SiDeno,
  SiDiscord,
  SiDjango,
  SiDocker,
  SiDotnet,
  SiDribbble,
  SiElevenlabs,
  SiEslint,
  SiFacebook,
  SiFastapi,
  SiFigma,
  SiFirebase,
  SiFlask,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiGithubcopilot,
  SiGo,
  SiGoogleanalytics,
  SiGooglegemini,
  SiGraphql,
  SiHtml5,
  SiHuggingface,
  SiInstagram,
  SiIntellijidea,
  SiIos,
  SiJavascript,
  SiJest,
  SiKotlin,
  SiLaravel,
  SiMailchimp,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNotion,
  SiNpm,
  SiObsstudio,
  SiOllama,
  SiOpenjdk,
  SiPerplexity,
  SiPhp,
  SiPinterest,
  SiPnpm,
  SiPostgresql,
  SiPostman,
  SiPrisma,
  SiProtools,
  SiPycharm,
  SiPython,
  SiReact,
  SiReddit,
  SiRedis,
  SiRust,
  SiSass,
  SiShopify,
  SiSketch,
  SiSpotify,
  SiSpringboot,
  SiStripe,
  SiSupabase,
  SiSvelte,
  SiSwift,
  SiTailwindcss,
  SiTelegram,
  SiTiktok,
  SiTwitch,
  SiTypescript,
  SiUnity,
  SiUnrealengine,
  SiVercel,
  SiVite,
  SiVuedotjs,
  SiWebflow,
  SiWebpack,
  SiWhatsapp,
  SiWondersharefilmora,
  SiWordpress,
  SiX,
  SiXcode,
  SiYarn,
  SiYoutube,
  SiZoom,
  SiAndroidHex,
  SiAndroidstudioHex,
  SiAngularHex,
  SiAnthropicHex,
  SiAstroHex,
  SiAudacityHex,
  SiBehanceHex,
  SiBlenderHex,
  SiBunHex,
  SiCinema4dHex,
  SiClaudeHex,
  SiCplusplusHex,
  SiCursorHex,
  SiCypressHex,
  SiDavinciresolveHex,
  SiDenoHex,
  SiDiscordHex,
  SiDjangoHex,
  SiDockerHex,
  SiDotnetHex,
  SiDribbbleHex,
  SiElevenlabsHex,
  SiEslintHex,
  SiFacebookHex,
  SiFastapiHex,
  SiFigmaHex,
  SiFirebaseHex,
  SiFlaskHex,
  SiFlutterHex,
  SiFramerHex,
  SiGitHex,
  SiGithubHex,
  SiGithubcopilotHex,
  SiGoHex,
  SiGoogleanalyticsHex,
  SiGooglegeminiHex,
  SiGraphqlHex,
  SiHtml5Hex,
  SiHuggingfaceHex,
  SiInstagramHex,
  SiIntellijideaHex,
  SiIosHex,
  SiJavascriptHex,
  SiJestHex,
  SiKotlinHex,
  SiLaravelHex,
  SiMailchimpHex,
  SiMongodbHex,
  SiMysqlHex,
  SiNextdotjsHex,
  SiNodedotjsHex,
  SiNotionHex,
  SiNpmHex,
  SiObsstudioHex,
  SiOllamaHex,
  SiOpenjdkHex,
  SiPerplexityHex,
  SiPhpHex,
  SiPinterestHex,
  SiPnpmHex,
  SiPostgresqlHex,
  SiPostmanHex,
  SiPrismaHex,
  SiProtoolsHex,
  SiPycharmHex,
  SiPythonHex,
  SiReactHex,
  SiRedditHex,
  SiRedisHex,
  SiRustHex,
  SiSassHex,
  SiShopifyHex,
  SiSketchHex,
  SiSpotifyHex,
  SiSpringbootHex,
  SiStripeHex,
  SiSupabaseHex,
  SiSvelteHex,
  SiSwiftHex,
  SiTailwindcssHex,
  SiTelegramHex,
  SiTiktokHex,
  SiTwitchHex,
  SiTypescriptHex,
  SiUnityHex,
  SiUnrealengineHex,
  SiVercelHex,
  SiViteHex,
  SiVuedotjsHex,
  SiWebflowHex,
  SiWebpackHex,
  SiWhatsappHex,
  SiWondersharefilmoraHex,
  SiWordpressHex,
  SiXHex,
  SiXcodeHex,
  SiYarnHex,
  SiYoutubeHex,
  SiZoomHex,
} from '@icons-pack/react-simple-icons';

export type SimpleIconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; color?: string; title?: string }>;

export type ResolvedCreatorToolIcon = {
  /** Matched display name for UI hints. */
  matchedName: string;
  Icon: SimpleIconComponent;
  hex: string;
};

type IconEntry = {
  name: string;
  Icon: SimpleIconComponent;
  hex: string;
  /** Normalized keywords / aliases (no spaces, lowercase). */
  keys: string[];
};

function normalizeToolKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function entry(
  name: string,
  Icon: SimpleIconComponent,
  hex: string,
  ...aliases: string[]
): IconEntry {
  const keys = Array.from(
    new Set([name, ...aliases].map(normalizeToolKey).filter(Boolean))
  );
  return { name, Icon, hex: hex.startsWith('#') ? hex : `#${hex}`, keys };
}

/**
 * Keyword map → Simple Icons React components.
 * Note: Adobe / CapCut / VS Code / Canva / LinkedIn / OpenAI were removed from
 * Simple Icons (trademarks) — those fall back to letter or user upload.
 */
const TOOL_ICON_ENTRIES: IconEntry[] = [
  // Video / creative
  entry('DaVinci Resolve', SiDavinciresolve, SiDavinciresolveHex, 'davinci', 'resolve'),
  entry('Blender', SiBlender, SiBlenderHex),
  entry('Cinema 4D', SiCinema4d, SiCinema4dHex, 'c4d', 'cinema4d'),
  entry('OBS Studio', SiObsstudio, SiObsstudioHex, 'obs'),
  entry('Filmora', SiWondersharefilmora, SiWondersharefilmoraHex, 'wondershare filmora'),
  entry('Audacity', SiAudacity, SiAudacityHex),
  entry('Pro Tools', SiProtools, SiProtoolsHex, 'protools'),
  // Design
  entry('Figma', SiFigma, SiFigmaHex),
  entry('Framer', SiFramer, SiFramerHex),
  entry('Sketch', SiSketch, SiSketchHex),
  entry('Webflow', SiWebflow, SiWebflowHex),
  entry('Notion', SiNotion, SiNotionHex),
  entry('Behance', SiBehance, SiBehanceHex),
  entry('Dribbble', SiDribbble, SiDribbbleHex),
  // AI
  entry('Claude', SiClaude, SiClaudeHex, 'anthropic claude'),
  entry('Anthropic', SiAnthropic, SiAnthropicHex),
  entry('Google Gemini', SiGooglegemini, SiGooglegeminiHex, 'gemini'),
  entry('Perplexity', SiPerplexity, SiPerplexityHex),
  entry('Ollama', SiOllama, SiOllamaHex),
  entry('Hugging Face', SiHuggingface, SiHuggingfaceHex, 'huggingface', 'hugging face'),
  entry('ElevenLabs', SiElevenlabs, SiElevenlabsHex, 'eleven labs'),
  entry('Cursor', SiCursor, SiCursorHex),
  entry('GitHub Copilot', SiGithubcopilot, SiGithubcopilotHex, 'copilot'),
  // Social
  entry('YouTube', SiYoutube, SiYoutubeHex, 'yt'),
  entry('TikTok', SiTiktok, SiTiktokHex),
  entry('Instagram', SiInstagram, SiInstagramHex, 'ig'),
  entry('Facebook', SiFacebook, SiFacebookHex, 'fb', 'meta'),
  entry('X', SiX, SiXHex, 'twitter', 'x twitter'),
  entry('Twitch', SiTwitch, SiTwitchHex),
  entry('Discord', SiDiscord, SiDiscordHex),
  entry('Pinterest', SiPinterest, SiPinterestHex),
  entry('Reddit', SiReddit, SiRedditHex),
  entry('WhatsApp', SiWhatsapp, SiWhatsappHex),
  entry('Telegram', SiTelegram, SiTelegramHex),
  entry('Spotify', SiSpotify, SiSpotifyHex),
  entry('Zoom', SiZoom, SiZoomHex),
  // Dev
  entry('JavaScript', SiJavascript, SiJavascriptHex, 'js', 'javascript js'),
  entry('TypeScript', SiTypescript, SiTypescriptHex, 'ts'),
  entry('Python', SiPython, SiPythonHex),
  entry('Java', SiOpenjdk, SiOpenjdkHex, 'openjdk', 'jdk'),
  entry('React', SiReact, SiReactHex, 'reactjs', 'react.js'),
  entry('Next.js', SiNextdotjs, SiNextdotjsHex, 'next', 'nextjs', 'next js'),
  entry('Node.js', SiNodedotjs, SiNodedotjsHex, 'node', 'nodejs', 'node js'),
  entry('Vue.js', SiVuedotjs, SiVuedotjsHex, 'vue', 'vuejs'),
  entry('Angular', SiAngular, SiAngularHex),
  entry('Svelte', SiSvelte, SiSvelteHex),
  entry('Astro', SiAstro, SiAstroHex),
  entry('Vite', SiVite, SiViteHex),
  entry('HTML5', SiHtml5, SiHtml5Hex, 'html', 'html5'),
  entry('Sass', SiSass, SiSassHex, 'scss'),
  entry('Tailwind CSS', SiTailwindcss, SiTailwindcssHex, 'tailwind', 'tailwindcss'),
  entry('Git', SiGit, SiGitHex),
  entry('GitHub', SiGithub, SiGithubHex, 'gh'),
  entry('Docker', SiDocker, SiDockerHex),
  entry('MongoDB', SiMongodb, SiMongodbHex, 'mongo'),
  entry('PostgreSQL', SiPostgresql, SiPostgresqlHex, 'postgres', 'psql'),
  entry('MySQL', SiMysql, SiMysqlHex),
  entry('Redis', SiRedis, SiRedisHex),
  entry('Prisma', SiPrisma, SiPrismaHex),
  entry('GraphQL', SiGraphql, SiGraphqlHex),
  entry('Firebase', SiFirebase, SiFirebaseHex),
  entry('Supabase', SiSupabase, SiSupabaseHex),
  entry('Vercel', SiVercel, SiVercelHex),
  entry('npm', SiNpm, SiNpmHex),
  entry('pnpm', SiPnpm, SiPnpmHex),
  entry('Yarn', SiYarn, SiYarnHex),
  entry('Bun', SiBun, SiBunHex),
  entry('Deno', SiDeno, SiDenoHex),
  entry('ESLint', SiEslint, SiEslintHex),
  entry('Jest', SiJest, SiJestHex),
  entry('Cypress', SiCypress, SiCypressHex),
  entry('Webpack', SiWebpack, SiWebpackHex),
  entry('Postman', SiPostman, SiPostmanHex),
  entry('PHP', SiPhp, SiPhpHex),
  entry('Laravel', SiLaravel, SiLaravelHex),
  entry('Django', SiDjango, SiDjangoHex),
  entry('Flask', SiFlask, SiFlaskHex),
  entry('FastAPI', SiFastapi, SiFastapiHex),
  entry('Spring Boot', SiSpringboot, SiSpringbootHex, 'spring', 'springboot'),
  entry('.NET', SiDotnet, SiDotnetHex, 'dotnet', 'aspnet'),
  entry('C++', SiCplusplus, SiCplusplusHex, 'cpp', 'cplusplus'),
  entry('Go', SiGo, SiGoHex, 'golang'),
  entry('Rust', SiRust, SiRustHex),
  entry('Kotlin', SiKotlin, SiKotlinHex),
  entry('Swift', SiSwift, SiSwiftHex),
  entry('Flutter', SiFlutter, SiFlutterHex),
  entry('Android', SiAndroid, SiAndroidHex),
  entry('Android Studio', SiAndroidstudio, SiAndroidstudioHex),
  entry('iOS', SiIos, SiIosHex),
  entry('Xcode', SiXcode, SiXcodeHex),
  entry('IntelliJ IDEA', SiIntellijidea, SiIntellijideaHex, 'intellij', 'idea'),
  entry('PyCharm', SiPycharm, SiPycharmHex),
  entry('Unity', SiUnity, SiUnityHex),
  entry('Unreal Engine', SiUnrealengine, SiUnrealengineHex, 'unreal'),
  // Other
  entry('WordPress', SiWordpress, SiWordpressHex, 'wp'),
  entry('Shopify', SiShopify, SiShopifyHex),
  entry('Stripe', SiStripe, SiStripeHex),
  entry('Mailchimp', SiMailchimp, SiMailchimpHex),
  entry('Google Analytics', SiGoogleanalytics, SiGoogleanalyticsHex, 'ga', 'analytics'),
];

const BY_KEY = new Map<string, IconEntry>();
for (const item of TOOL_ICON_ENTRIES) {
  for (const key of item.keys) {
    if (!BY_KEY.has(key)) BY_KEY.set(key, item);
  }
}

/** Exact / alias match, then longest keyword contained in the label. */
export function resolveCreatorToolSimpleIcon(
  label: string
): ResolvedCreatorToolIcon | null {
  const key = normalizeToolKey(label);
  if (!key) return null;

  const exact = BY_KEY.get(key);
  if (exact) {
    return { matchedName: exact.name, Icon: exact.Icon, hex: exact.hex };
  }

  let best: IconEntry | null = null;
  let bestLen = 0;
  for (const [alias, item] of BY_KEY) {
    if (alias.length < 2) continue;
    if (key.includes(alias) && alias.length > bestLen) {
      best = item;
      bestLen = alias.length;
    }
  }
  if (!best) return null;
  return { matchedName: best.name, Icon: best.Icon, hex: best.hex };
}

export function creatorToolHasAutoIcon(label: string): boolean {
  return resolveCreatorToolSimpleIcon(label) != null;
}

/**
 * The My Portfolio canvas: one centred column shared by the top bar's inner row and the workspace
 * content, so the wordmark, the profile card and the sections rail sit on the same vertical lines.
 */
export const PORTFOLIO_FRAME_CLASS = 'mx-auto w-full max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-16';

/**
 * The navbar's frame: 1240px of content inside the same 32 / 48 / 64px gutters. DashboardTopHeader
 * draws its row on it, and My Portfolio its content, so their edges sit under the wordmark and the
 * avatar — change it here and both follow. (The News page repeats the same numbers on its grid:
 * HomeNewsFeed.)
 */
export const NAVBAR_FRAME_CLASS = 'mx-auto w-full max-w-[1368px] px-4 sm:px-8 md:px-12 lg:px-16';

'use client';

/**
 * Inline script emitted only in the server HTML so it runs before first paint. In the browser this
 * renders nothing: React 19 warns when it has to create a `<script>` element on the client.
 */
export function ThemeInitScript({ code }: { code: string }) {
  if (typeof window !== 'undefined') return null;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

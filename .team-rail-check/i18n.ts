export const useT = () => (message: string, values?: Record<string, string>) =>
  message.replace(/\{([^}]+)\}/g, (_, key) => values?.[key] ?? key);

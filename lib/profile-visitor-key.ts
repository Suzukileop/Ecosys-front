const VISITOR_KEY_STORAGE = 'np_profile_visitor_key';

export function getProfileVisitorKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    let key = localStorage.getItem(VISITOR_KEY_STORAGE);
    if (!key) {
      key =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY_STORAGE, key);
    }
    return key;
  } catch {
    return `v-${Date.now()}`;
  }
}

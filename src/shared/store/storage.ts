const storage = {
  getItem(key: string): Promise<string | null> {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch { /* quota exceeded or private browsing */ }
    return Promise.resolve();
  },
  removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
    return Promise.resolve();
  },
};

export default storage;

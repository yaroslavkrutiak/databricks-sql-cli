export const warn = (message: string) => {
  console.warn('\x1b[33m', `[WARN] ${message}`, '\x1b[0m');
};

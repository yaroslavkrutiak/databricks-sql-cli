export const fail = (...rest: unknown[]) => {
  const message = rest
    .map((e) => (typeof e === 'string' ? e : e?.toString ? e.toString() : JSON.stringify(e)))
    .join(' ');
  console.error('\x1b[31m', message, '\x1b[0m');
  process.exit(1);
};

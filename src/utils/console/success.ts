export const success = (message: string) => {
  console.info('\x1b[32m', message || 'Success', '\x1b[0m');
};

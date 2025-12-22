// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const nextConfig = {
  // Ensure Next selects this directory as the workspace root, so .env.local here is used.
  turbopack: {
    root: __dirname,
  },
  /* other config options here */
};

export default nextConfig;

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import checker from 'vite-plugin-checker';
import mkcert from 'vite-plugin-mkcert';
import svgrPlugin from 'vite-plugin-svgr';
import eslintPlugin from '@nabla/vite-plugin-eslint';

// import tsconfigPaths from 'vite-tsconfig-paths';

// const createProxyPath = (path, proxy, domain) => ({
//   [`/${path}`]: {
//     target: proxy,
//     changeOrigin: true,
//     cookieDomainRewrite: domain,
//     secure: false,
//   },
// });
const createProxyPath = (path: string, proxy: string, domain: string) => ({
  [`/${path}`]: {
    target: proxy,
    changeOrigin: true,
    cookieDomainRewrite: domain,
    secure: false,
    ws: true,
  },
});
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableSsl = env.HTTP !== 'true';
  return {
    // Sub-path for GitHub Pages project sites (e.g. '/BDI-in-Boomi/');
    // defaults to '/' for local dev.
    base: env.VITE_BASE_PATH || '/',
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        // '~/*': path.resolve(__dirname, './src'),
        store: path.resolve(__dirname, './src/store'),
        containers: path.resolve(__dirname, './src/containers'),
        components: path.resolve(__dirname, './src/components'),
        hooks: path.resolve(__dirname, './src/hooks'),
        api: path.resolve(__dirname, './src/api'),
        app: path.resolve(__dirname, './src/app'),
        layout: path.resolve(__dirname, './src/layout'),
        modules: path.resolve(__dirname, './src/modules'),
        utils: path.resolve(__dirname, './src/utils'),
        theme: path.resolve(__dirname, './src/theme'),
      },
    },
    server: {
      host: env.VITE_HOST,
      port: Number(env.VITE_PORT) || 443,
      https: enableSsl,
      proxy: {
        ...createProxyPath(env.VITE_IFRAME_URL, env.VITE_PROXY, env.VITE_HOST),
        ...(env.VITE_REMOTE_PROXY && env.VITE_REMOTE_API_PATHS
          ? env.VITE_REMOTE_API_PATHS.split(',').reduce(
              (acc, p) => ({
                ...acc,
                ...createProxyPath(
                  `${env.VITE_API_PREFIX}/${p.trim()}`,
                  env.VITE_REMOTE_PROXY,
                  env.VITE_HOST,
                ),
              }),
              {},
            )
          : {}),
        ...createProxyPath(env.VITE_API_PREFIX, env.VITE_PROXY, env.VITE_HOST),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'], // Make sure React dependencies are optimized
    },
    build: {
      outDir: 'build',
      // https://stackoverflow.com/questions/69260715/skipping-larger-chunks-while-running-npm-run-build
      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('Icons')) {
              return 'icons';
            }
          },
        },
      },
    },
    plugins: [
      splitVendorChunkPlugin(),
      mkcert({
        hosts: [env.VITE_HOST],
      }),
      // Type-check + lint run in dev only. The production (Pages) build skips
      // them to avoid a vite-plugin-checker `tsc` invocation error (TS5042);
      // types are already validated during `npm start`.
      ...(mode !== 'production'
        ? [
            checker({
              typescript: {
                root: path.resolve(__dirname, './'),
                tsconfigPath: 'tsconfig.json',
              },
            }),
            eslintPlugin(),
          ]
        : []),
      react({
        exclude: '**/*.stories.tsx',
      }),
      // tsconfigPaths(),
      svgrPlugin({
        svgrOptions: {
          icon: false,
          // ...svgr options (https://react-svgr.com/docs/options/)
        },
      }),
    ],
  };
});

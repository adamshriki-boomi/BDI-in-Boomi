import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
  root: './icons',
  resolve: {
    alias: {
      icons: path.resolve(__dirname, '../src/components/Icons/components'),
      audit: path.resolve(__dirname, '../src/containers/AuditLog/icons'),
      sidebar: path.resolve(
        __dirname,
        '../src/layout/Sidebar/components/icons',
      ),
      billing: path.resolve(__dirname, '../src/modules/Billing/icons'),
      step: path.resolve(__dirname, '../src/components/Icons/step'),
      'components/Icons': path.resolve(__dirname, '../src/components/Icons'),
    },
  },
  server: {
    port: 4200,
  },
  plugins: [
    react({
      exclude: '**/*.stories.tsx',
    }),
    // tsconfigPaths(),
    svgrPlugin({
      svgrOptions: {
        icon: false,
      },
    }),
  ],
});

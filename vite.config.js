import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                services: resolve(__dirname, 'services.html'),
                packages: resolve(__dirname, 'packages.html'),
                portfolio: resolve(__dirname, 'portfolio.html'),
                contact: resolve(__dirname, 'contact.html'),
            },
        },
    },
    server: {
        port: 5174,
    },
    plugins: [
        {
            name: 'configure-server',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // Check if request is for internal Vite resources or has extension
                    // We must NOT rewrite these, or Vite will break.
                    if (req.url.startsWith('/@') ||
                        req.url.includes('vite') ||
                        req.url.includes('node_modules') ||
                        req.url.includes('.')) {
                        next();
                        return;
                    }

                    // Handle root path
                    if (req.url === '/') {
                        next();
                        return;
                    }

                    // Clean URL support: rewrite /about to /about.html
                    if (!req.url.endsWith('/') && req.url.indexOf('.') === -1) {
                        req.url = req.url + '.html';
                    }

                    next();
                });
            },
        },
    ],
});

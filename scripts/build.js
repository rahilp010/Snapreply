// scripts/build.js
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

async function buildAll() {
  console.log('🚀 Starting SnapReply Chrome Extension Build...');

  // Ensure clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 1. Build Extension HTML Pages (Popup, Options, Onboarding)
  console.log('📦 Building Extension Pages (Popup, Options, Onboarding)...');
  await build({
    root: rootDir,
    plugins: [react()],
    base: '',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: path.resolve(rootDir, 'src/popup/index.html'),
          options: path.resolve(rootDir, 'src/options/index.html'),
          onboarding: path.resolve(rootDir, 'src/onboarding/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  });

  // Move built html pages to expected paths and fix relative asset paths:
  // From dist/src/{page}/index.html -> dist/{page}/index.html
  // and replace ../../assets with ../assets
  const pageDirs = ['popup', 'options', 'onboarding'];
  for (const page of pageDirs) {
    const srcPagePath = path.resolve(distDir, 'src', page, 'index.html');
    const destDir = path.resolve(distDir, page);
    const destPagePath = path.resolve(destDir, 'index.html');

    if (fs.existsSync(srcPagePath)) {
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      let html = fs.readFileSync(srcPagePath, 'utf8');
      html = html.replace(/\.\.\/\.\.\/assets/g, '../assets');
      fs.writeFileSync(destPagePath, html);
    }
  }

  // Clean up dist/src
  const distSrc = path.resolve(distDir, 'src');
  if (fs.existsSync(distSrc)) {
    fs.rmSync(distSrc, { recursive: true, force: true });
  }

  // 2. Build Background Service Worker (ES module)
  console.log('⚙️ Building Background Service Worker...');
  await build({
    root: rootDir,
    publicDir: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      outDir: path.resolve(distDir, 'background'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/background/service-worker.ts'),
        formats: ['es'],
        fileName: () => 'service-worker.js',
      },
      rollupOptions: {
        output: {
          entryFileNames: 'service-worker.js',
        },
      },
    },
  });

  // 3. Build Content Script (IIFE for isolated execution in webpage)
  console.log('🌐 Building Content Script...');
  await build({
    root: rootDir,
    publicDir: false,
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
      'global': 'window',
    },
    build: {
      outDir: path.resolve(distDir, 'content'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, 'src/content/content.ts'),
        name: 'SnapReplyContent',
        formats: ['iife'],
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          entryFileNames: 'content.js',
          extend: true,
        },
      },
    },
  });

  // 4. Compile Content Script Stylesheet (for Shadow DOM / injection)
  console.log('🎨 Compiling Content Script Stylesheet...');
  const contentCssInputPath = path.resolve(rootDir, 'src/content/content.css');
  const contentCssOutputPath = path.resolve(distDir, 'content/content.css');

  if (fs.existsSync(contentCssInputPath)) {
    const cssContent = fs.readFileSync(contentCssInputPath, 'utf8');
    const result = await postcss([
      tailwindcss(path.resolve(rootDir, 'tailwind.config.js')),
      autoprefixer,
    ]).process(cssContent, { from: contentCssInputPath, to: contentCssOutputPath });

    fs.mkdirSync(path.dirname(contentCssOutputPath), { recursive: true });
    fs.writeFileSync(contentCssOutputPath, result.css);
  }

  // 5. Copy manifest.json & public/icons to dist
  console.log('📋 Copying Manifest and Assets...');
  fs.copyFileSync(
    path.resolve(rootDir, 'public/manifest.json'),
    path.resolve(distDir, 'manifest.json')
  );

  const iconsSrcDir = path.resolve(rootDir, 'public/icons');
  const iconsDistDir = path.resolve(distDir, 'icons');
  if (fs.existsSync(iconsSrcDir)) {
    if (!fs.existsSync(iconsDistDir)) fs.mkdirSync(iconsDistDir, { recursive: true });
    for (const file of fs.readdirSync(iconsSrcDir)) {
      fs.copyFileSync(path.join(iconsSrcDir, file), path.join(iconsDistDir, file));
    }
  }

  console.log('✅ SnapReply Extension build complete! Built in `dist/`.');
}

buildAll().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

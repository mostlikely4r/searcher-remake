import { defineConfig, type Plugin } from 'vite';

/**
 * Puts the bundled script inside index.html. Browsers refuse to load module files from file://,
 * so this is what lets Searcher.html run by double-clicking, with no server and no Node.
 */
function inlineScript(): Plugin {
  return {
    name: 'inline-script',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find((f) => f.type === 'asset' && f.fileName.endsWith('.html'));
      if (!html || html.type !== 'asset') return;
      let page = String(html.source);
      for (const [name, file] of Object.entries(bundle)) {
        if (file.type !== 'chunk') continue;
        const code = file.code.replace(/<\/script/g, '<\\/script');
        page = page.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/, () => '');
        page = page.replace('</body>', () => `<script type="module">${code}</script>\n</body>`);
        delete bundle[name];
      }
      html.source = page;
    },
  };
}

export default defineConfig({
  base: './',
  build: { target: 'es2022', modulePreload: false },
  plugins: [inlineScript()],
});

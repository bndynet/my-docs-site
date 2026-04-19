// Root docs config — consumed by the `docs` CLI from @bndynet/docs.
// All of the components, theme swizzles, pages, styles and static assets
// ship inside @bndynet/docs (see packages/docs/assets/). To customize a
// single file, drop a same-path copy under the root's src/ or static/.

/** @type {import('@bndynet/docs').DocsConfig} */
module.exports = {
  title: 'My Documentation Site',
  name: 'BNDY-NET',
  tagline: 'Write the documentation with Markdown and React Components.',

  url: 'https://bndy.net',
  baseUrl: '/',

  logo: 'https://static.bndy.net/images/logo_fill.svg',

  copyright: `Copyright © ${new Date().getFullYear()} <a href="https://bndy.net" target="_blank">BNDY-NET</a>`,

  mdxRoot: './docs',
  docsRouteBasePath: '/',

  // Homepage hero. Everything here is optional; omit the whole block to
  // fall back to the defaults (site title + tagline + a single button
  // to `intro` under `docsRouteBasePath`, e.g. `/intro` here). Set `hidden: true` to render your own
  // hero from `src/pages/index.js`.
  hero: {
    // title: 'Override the heading',
    // subtitle: 'Override the tagline',
    // variant: 'primary', // 'primary' | 'dark' | 'secondary' | 'none'
    // background: {
    //   color: '#0f172a',
    //   image: 'img/hero-bg.jpg',           // served from static/, baseUrl-safe
    //   overlay: 'rgba(15, 23, 42, 0.55)',  // only applied when image is set
    // },
    button: { label: 'Browse the docs →', href: '/intro' },
    link: { label: 'View on GitHub', href: 'https://github.com/bndynet/my-docs-site' },
  },

  // `href` accepts both internal paths (e.g. `/blog`) and external URLs
  // (`https://…`, `//cdn.…`, `mailto:`, `tel:`); the template auto-detects
  // which and routes internal values through baseUrl-aware client-side
  // navigation.
  nav: [
    { label: 'Docs', docsPath: '.' },
    // { label: 'Basics', docsPath: 'tutorial-basics' },
    // { label: 'Extras', docsPath: 'tutorial-extras' },
    { label: 'Blog', href: '/blog', position: 'left' },
    { label: 'External Link', href: '/iframe?url=https://bndy.net', position: 'left' },
    {
      href: 'https://github.com/bndynet/my-docs-site',
      position: 'right',
      className: 'header-github-link',
      'aria-label': 'GitHub repository',
    },
  ],

  theme: {
    image: 'img/docusaurus-social-card.jpg',
    metadata: [{ name: 'keywords', content: 'bendy, bing, blog' }],
  },

  footer: {
    style: 'dark',
    links: [
      {
        items: [
          {
            html: '<img src="https://static.bndy.net/images/logo_white.png" style="height: 150px; position: relative;" />',
          },
        ],
      },
      {
        title: 'Community',
        items: [
          { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus' },
          { label: 'Discord', href: 'https://discordapp.com/invite/docusaurus' },
          { label: 'Twitter', href: 'https://twitter.com/docusauru' },
        ],
      },
      {
        title: 'More',
        items: [
          { label: 'Blog', href: '/blog' },
          { label: 'GitHub', href: 'https://github.com/bndynet/my-docs-site' },
        ],
      },
    ],
  },

  externalScripts: [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.7/axios.min.js',
    // `/tw.config.js` and `/script.js` are served from the package's
    // `assets/static/` (or the consumer's `static/` if overridden). The
    // `script.js` entry is auto-injected by @bndynet/docs; we list
    // `tw.config.js` here because Tailwind's CDN script reads it at runtime.
    '/tw.config.js',
  ],
};

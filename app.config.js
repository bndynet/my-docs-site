module.exports = {
  url: 'https://bndy.net',
  baseUrl: '/',
  logoUrl: 'https://static.bndy.net/images/logo_fill.svg',
  footerLogoUrl: 'img/docusaurus-social-card.jpg',
  name: 'BNDY-NET',
  title: 'My Documentation Site',
  tagline: 'Write the documentation with Markdown and React Components.',
  githubUser: 'bndynet',
  githubRepo: 'my-docs-site',
  copyright: `Copyright © ${new Date().getFullYear()} <a href="https://bndy.net" target="_blank">BNDY-NET</a>`,
  docMenuLabel: 'Docs',
  get menus() {
    return [
      {
        type: 'docSidebar',
        sidebarId: 'tutorialSidebar',
        position: 'left',
        label: this.docMenuLabel,
      },
      { to: '/blog', label: 'Blog', position: 'left' },
      {
        href: `https://github.com/${this.githubUser}/${this.githubRepo}`,
        position: 'right',
        className: 'header-github-link',
        'aria-label': 'GitHub repository',
      },
    ];
  },
  get footerLinks() {
    return [
      {
        items: [{
          html: `<img src="${this.baseUrl}${this.footerLogoUrl}" style="height: 150px; position: relative;" />`,
        }],
      },
      {
        title: 'Docs',
        items: [
          {
            label: this.docMenuLabel,
            to: '/docs/intro',
          },
        ],
      },
      {
        title: 'Community',
        items: [
          {
            label: 'Stack Overflow',
            href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          },
          {
            label: 'Discord',
            href: 'https://discordapp.com/invite/docusaurus',
          },
          {
            label: 'Twitter',
            href: 'https://twitter.com/docusaurus',
          },
        ],
      },
      {
        title: 'More',
        items: [
          {
            label: 'Blog',
            to: '/blog',
          },
          {
            label: 'GitHub',
            href: `https://github.com/${this.githubUser}/${this.githubRepo}`,
          },
        ],
      },
    ];
  },
};
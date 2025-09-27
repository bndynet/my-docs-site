const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const remarkParse = require('remark-parse');
const remarkMdx = require('remark-mdx');
const remarkFrontmatter = require('remark-frontmatter');

const { unified } = require('unified');
const { visit } = require('unist-util-visit');

function getFolderUrl(folderPath, routeBasePath = "/docs") {
  const categoryJsonPath = path.join(folderPath, "_category_.json");

  // if _category_.json exists, use its slug or label to generate URL
  if (fs.existsSync(categoryJsonPath)) {
    try {
      const category = JSON.parse(fs.readFileSync(categoryJsonPath, "utf-8"));
      if (category.link?.type === "generated-index" && category.link.slug) {
        return category.link.slug.startsWith("/")
          ? category.link.slug
          : `/${category.link.slug}`;
      }

      // if no slug, use label to generate URL-friendly string
      if (category.label) {
        const slug = category.label
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-") // replace spaces and special characters with "-"
          .replace(/^-+|-+$/g, "");   // remove leading/trailing "-"
          ;
        return path.posix.join(routeBasePath, "category", slug);
      }
    } catch (err) {
      console.warn("Parse _category_.json err:", err);
    }
  }

  // if no _category_.json, use folder name to generate URL-friendly string
  const folderName = path.basename(folderPath);
  const slug = folderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return path.posix.join(routeBasePath, "category", slug);
}

function getDocLink(filePath, baseUrl = '/docs') {
  const noExt = filePath.replace(/\.(md|mdx)$/, '');
  const segments = noExt.split(path.sep);

  // default doc id
  const id = segments.join('/');

  // read frontmatter
  const file = fs.readFileSync(filePath, 'utf-8');
  const { data: frontMatter } = matter(file);

  if (frontMatter.slug) {
    return path.posix.join(baseUrl, frontMatter.slug);
  }

  // if it's README.mdx or index.mdx → directory homepage
  if (/readme|index/i.test(segments[segments.length - 1])) {
    return path.posix.join(baseUrl, ...segments.slice(0, -1));
  }

  return path.posix.join(baseUrl, id);
}

function getMetadataFromFile(filePath, context, docsDir) {
  const fileRaw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(fileRaw);
  const content = parsed.content || '';
  const frontMatter = parsed.data || {};
  // parse AST
  const ast = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkFrontmatter, ['yaml'])
    .parse(content);

  if (!frontMatter.title) {
    // extract title from first heading if not in front matter
    const match = parsed.content.match(/^#\s+(.*)/m);
    if (match) {
      frontMatter.title = match[1].trim();
    } else {
      // fallback to filename
      frontMatter.title = filePath
        .split('/')
        .pop()
        .replace(/\.mdx?$/, '');
    }
  }

  // extract description (first paragraph)
  if (!frontMatter.description) {
    visit(ast, 'paragraph', (node) => {
      if (node.children) {
        frontMatter.description = node.children
          .filter((c) => c.type === 'text')
          .map((c) => c.value)
          .join(' ');
      }
    });
  }

  // get code blocks
  const blocks = getLiveCodeBlocks(content);

  // generate link
  let link = '';
  if (frontMatter.id) {
    link = `/docs/${frontMatter.id}`;
  } else {
    const relativePath = path.relative(
      path.join(context.siteDir, docsDir),
      filePath
    );
    const noExt = relativePath.replace(/\.(mdx|md)$/, '');
    link = `/docs/${noExt.replace(/\\/g, '/')}`;
  }

  return {
    frontMatter,
    blocks,
    link,
    link1: getDocLink(filePath),
    blocksCount: blocks.length,
    path: filePath,
  };
}

function getLiveCodeBlocks(mdxContent) {
  const regex = /```([\w\s]+)\n([\s\S]*?)```/g;

  const matches = [...mdxContent.matchAll(regex)].map((m) => ({
    language: m[1].trim().split(' ')[0],
    modifiers: m[1]
      .trim()
      .split(' ')
      .filter((item) => !!item.trim())
      .map((item) => item.trim())
      .reduce((obj, key) => {
        obj[key] = true;
        return obj;
      }, {}),
    code: m[2].trim(),
  }));

  const jsxCodes = matches.filter((m) => m.language.startsWith('jsx'));
  return jsxCodes;
}

module.exports = function codeblockCollectorPlugin(context, options) {
  return {
    name: 'docusaurus-plugin-codeblock-collector',

    getPathsToWatch() {
      const docsDir = options.docsDir || 'docs';
      const foldersUnderDocs = options.folders || [];
      return foldersUnderDocs.map((folder) =>
        path.join(context.siteDir, docsDir, folder)
      );
    },

    async loadContent() {
      const docsDir = options.docsDir || 'docs';
      const foldersUnderDocs = options.folders;

      // { pages: Array<{ frontMatter, blocks, link, blocksCount, path }> }
      const categories = {};

      foldersUnderDocs.forEach((folder) => {
        const targetDir = path.join(context.siteDir, docsDir, folder);
        categories[folder] = {
          link: getFolderUrl(targetDir, docsDir),
          pages: [],
        };
        if (fs.existsSync(targetDir)) {
          walk(targetDir, folder);
        }
      });

      function walk(dir, currentCategory) {
        fs.readdirSync(dir).forEach((file) => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath, currentCategory);
          } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
            const metadata = getMetadataFromFile(fullPath, context, docsDir);
            // if (metadata.blocksCount > 0) {
            categories[currentCategory].pages.push(metadata);
            // }
          }
        });
      }

      return categories;
    },
    async contentLoaded({ content, actions }) {
      const { createData } = actions;

      // output to .docusaurus directory for front-end import
      await createData('metadata.json', JSON.stringify(content, null, 2));
    },
  };
};

import metadata from '/.docusaurus/docusaurus-plugin-codeblock-collector/default/metadata.json';
import { ReactNode } from 'react';
import { LivePreview, LiveProvider } from 'react-live';

import { useCurrentSidebarCategory } from '@docusaurus/theme-common/internal';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DocCategoryGeneratedIndexPage from '@theme-original/DocCategoryGeneratedIndexPage';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';

import type DocCategoryGeneratedIndexPageType from '@theme/DocCategoryGeneratedIndexPage';
import type { WrapperProps } from '@docusaurus/types';
import { wrapJsxLiveCode } from '../../utils/mdx';
type Props = WrapperProps<typeof DocCategoryGeneratedIndexPageType>;

export default function DocCategoryGeneratedIndexPageWrapper(
  props: Props
): ReactNode {
  const { categoryGeneratedIndex } = props;

  const sidebarCategory: any = useCurrentSidebarCategory();
  const href = sidebarCategory.href;

  // const { siteConfig } = useDocusaurusContext();
  // const plugin = siteConfig.plugins.find(
  //   (plugin: unknown) =>
  //     Array.isArray(plugin) && plugin[0].includes('codeblock-collector')
  // ) as Array<unknown>;
  // const pluginConfig = plugin[1] as { folders: string[] };

  const folderName = Object.keys(metadata).find((key) =>
    href.includes(metadata[key].link)
  );
  const category = folderName ? metadata[folderName] : null;

  if (category) {
    return (
      <>
        <DocBreadcrumbs />
        <header>
          <h1 className="text-[3rem] mb-[calc(1.25*var(--ifm-leading))]">
            {categoryGeneratedIndex.title}
          </h1>
          {categoryGeneratedIndex.description && (
            <p>{categoryGeneratedIndex.description}</p>
          )}
        </header>
        <div className="grid grid-cols-2 gap-8">
          {category.pages.map((page: any, index: number) => (
            <a
              key={index}
              href={page.link}
              className="card h-[200px] mb-0 border-1 border-solid border-[var(--ifm-color-emphasis-200)] hover:border-[var(--ifm-color-primary)] text-[var(--ifm-color-emphasis-800)] hover:text-[var(--ifm-color-emphasis-700)] hover:no-underline"
            >
              {page.blocks.length > 0 ? (
                <>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-[var(--ifm-color-emphasis-200)]">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="ml-4 text-[13px]">
                      {page.frontMatter.title}
                    </span>
                    <span className="flex-1 text-right flex justify-end text-[var(--ifm-color-emphasis-600)]">
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="m17.09 7.974.23.23c1.789 1.79 2.684 2.684 2.684 3.796s-.895 2.006-2.684 3.796l-.23.23M13.876 5l-3.751 14M6.91 7.974l-.23.23C4.892 9.994 3.997 10.888 3.997 12s.895 2.006 2.685 3.796l.23.23" />
                      </svg>
                    </span>
                  </div>
                  <div className="p-2">
                    <LiveProvider
                      code={wrapJsxLiveCode(
                        page.blocks[0].code ||
                          'return <div>No code available</div>'
                      )}
                      noInline={page.blocks[0].modifiers['noInline']}
                    >
                      <LivePreview />
                    </LiveProvider>
                  </div>
                </>
              ) : (
                <article className="p-4">
                  <h2>📄️ {page.frontMatter.title}</h2>
                  <p>{page.frontMatter.description}</p>
                </article>
              )}
            </a>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <DocCategoryGeneratedIndexPage {...props} />
    </>
  );
}

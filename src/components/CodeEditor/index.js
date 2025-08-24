import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackPreview,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import { use, useEffect, useState } from 'react';

/**
 * LiveEditor is a React component that provides a live, multi-file code editor and preview environment for Angular, Vue, React and any node.js.
 *
 * @param {Object} files - The initial set of files to be loaded into the Sandpack editor. {'App.js', {hidden: true, code: `console.log('Hi')`, codeFile: 'path/to/file'}}
 * @param {string} template - The template to use for the Sandpack editor, such as 'react', 'react-ts', 'vue', 'vue-ts', 'angular', 'solid', 'svelte', 'vanilla-ts', 'vanilla', 'node', 'nextjs', 'vite', 'vite-ts' or 'static'...
 */
export default function CodeEditor(props) {
  let {
    files,
    template,
    showFileExplorer,
    showLineNumbers,
    customSetup,
    theme,
  } = props;
  const options = {
    externalResources: ['https://cdn.tailwindcss.com'],
  };
  const [allFiles, setAllFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const { colorMode, setColorMode } = useColorMode();

  const filenamesNeedToLoad = Object.keys(files ?? {}).filter(
    (filename) => files[filename] && files[filename].codeFile
  );

  if (colorMode === 'dark' && !theme) {
    theme = 'dark';
  }

  useEffect(() => {
    async function loadFiles() {
      if (filenamesNeedToLoad.length === 0) {
        setAllFiles(files);
        setLoading(false);
        return;
      }
      const promisesToLoadFiles = filenamesNeedToLoad.map((filename) =>
        fetch(files[filename].codeFile).then((r) => r.text())
      );
      const results = await Promise.allSettled(promisesToLoadFiles);
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          const code = res.value;
          setAllFiles((prevFiles) => ({
            ...files,
            [filenamesNeedToLoad[results.indexOf(res)]]: { code },
          }));
        } else {
          // {status: 'rejected', reason: 'error'}
          const error = `Failed to load file ${
            filenamesNeedToLoad[results.indexOf(res)]
          } from ${
            files[filenamesNeedToLoad[results.indexOf(res)]].codeFile
          }: ${res.reason}`;
          setAllFiles(() => ({
            ...files,
            [filenamesNeedToLoad[results.indexOf(res)]]: {
              code: '// ' + error,
            },
          }));
        }
      });
      setLoading(false);
    }
    loadFiles();
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64 rounded-[4px]"
        style={{ backgroundColor: 'var(--ifm-pre-background)' }}
      >
        <div
          className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"
          style={{ borderColor: 'var(--ifm-color-primary)' }}
        ></div>
      </div>
    );
  }

  return (
    <SandpackProvider
      key={loading ? 'loading' : 'ready'}
      template={template}
      files={allFiles}
      options={options}
      theme={theme}
      customSetup={customSetup}
    >
      <SandpackLayout
        style={{ display: 'flex', flexDirection: 'column', height: 900 }}
      >
        <SandpackPreview
          showNavigator={false}
          style={{ height: '500px' }}
          showOpenInCodeSandbox={false}
        />
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
          }}
        >
          {showFileExplorer && (
            <SandpackFileExplorer style={{ width: '220px' }} />
          )}
          <SandpackCodeEditor
            showTabs
            showLineNumbers={showLineNumbers}
            wrapContent
          />
        </div>
      </SandpackLayout>
    </SandpackProvider>
  );
}

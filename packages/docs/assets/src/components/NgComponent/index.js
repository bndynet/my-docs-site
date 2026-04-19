import { getBlockInCode } from '@site/src/utils/mdx';
import CodeEditor from '../CodeEditor';

export default function NgComponent(props) {
  const { children, files } = props;
  const code = children.trim();
  const tsCode = getBlockInCode(code, 'ts');
  const htmlCode = getBlockInCode(code, 'html');
  const cssCode = getBlockInCode(code, 'css');

  const allFiles = files ?? {};
  if (tsCode) {
    allFiles['/src/app/app.component.ts'] = {
      code: tsCode,
    };
  }
  if (htmlCode) {
    allFiles['/src/app/app.component.html'] = {
      code: htmlCode,
    };
  }
  if (cssCode) {
    allFiles['/src/app/app.component.css'] = {
      code: cssCode,
    };
  }

  return (
    <>
      <CodeEditor template="angular" files={allFiles} {...props} />
    </>
  );
}

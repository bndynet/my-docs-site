import { getBlocksInCode } from '../../utils/mdx';
import CodeEditor from '../CodeEditor';
import NgComponent from '../NgComponent';

export default function MdxCode2Editor(props) {
  const { children, metastring } = props;
  const code = (children ?? '').trim();
  const meta = (metastring ?? '').split(' ');
  const template = meta[0];

  const thisProps = {};
  meta.forEach((item) => {
    thisProps[item] = true;
  });

  const files = {};
  getBlocksInCode(code, 'file').forEach((block) => {
    const filePaths = block.split('\n')[0].trim().split(' ').map(p => p.trim()).filter(p => p !== '');
    if (filePaths.length > 1) {
      // e.x.  /src/app/app.component.ts https://localhost/example.ts
      const fileUrl = filePaths[1];
      files[filePaths[0]] = { codeFile: fileUrl };
    } else {
      const fileContent = block.split('\n').slice(1).join('\n');
      files[filePaths] = { code: fileContent };
    }
  });

  if (template === 'ng-component') {
    return <NgComponent files={files} {...props} {...thisProps} />;
  }

  return (
    <CodeEditor template={template} files={files} {...props} {...thisProps} />
  );
}

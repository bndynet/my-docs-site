import CodeEditor from '../CodeEditor';

// import pkgJson from '!!raw-loader!./template/package.json';
// import htmlCode from '!!raw-loader!./template/index.html';
// import mainCode from '!!raw-loader!./template/src/main.ts';

export default function AngularEditor(props) {
  // const angularFiles = {
  //   'index.html': {
  //     code: htmlCode,
  //   },
  //   'src/main.ts': {
  //     code: mainCode,
  //     active: true,
  //   },
  //   'package.json': {
  //     code: pkgJson,
  //   },
  // };
  const files = props.files || {};
  if (props && props.component && props.component.ts) {
    files['/src/app/app.component.ts'] = {
      code: props.component.ts,
    };
  }
  if (props && props.component && props.component.html) {
    files['/src/app/app.component.html'] = {
      code: props.component.html,
    };
  }
  if (props && props.component && props.component.css) {
    files['/src/app/app.component.css'] = {
      code: props.component.css,
    };
  }
  console.log(files);
  return (
    <>
      <CodeEditor showFileExplorer files={files} {...props} />
    </>
  );
}

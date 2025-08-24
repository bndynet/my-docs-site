import MDXCode from '@theme/MDXComponents/Code';
import MdxCode2Editor from '../../components/MdxCode2Editor';

export default function MyMDXCode(props) {
  const { className } = props;

  if (className?.includes('editor')) {
    return <MdxCode2Editor{...props} />;
  }
  return <MDXCode {...props} />;
}

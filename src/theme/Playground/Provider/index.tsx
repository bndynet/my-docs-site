import {useCallback, type ReactNode} from 'react';
import Provider from '@theme-original/Playground/Provider';
import type ProviderType from '@theme/Playground/Provider';
import type {WrapperProps} from '@docusaurus/types';
import { wrapJsxLiveCode } from '../../../utils/mdx';

type Props = WrapperProps<typeof ProviderType>;

// npx docusaurus swizzle @docusaurus/theme-live-codeblock Playground/Provider --wrap
export default function ProviderWrapper(props: Props): ReactNode {
  const transformCode = useCallback((inputCode: string) => {
    return wrapJsxLiveCode(inputCode);
  }, []);

  return (
    <>
      <Provider {...props} transformCode={props.transformCode ?? transformCode} />
    </>
  );
}

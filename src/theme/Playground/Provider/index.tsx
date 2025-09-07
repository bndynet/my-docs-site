import {useCallback, type ReactNode} from 'react';
import Provider from '@theme-original/Playground/Provider';
import type ProviderType from '@theme/Playground/Provider';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof ProviderType>;

// npx docusaurus swizzle @docusaurus/theme-live-codeblock Playground/Provider --wrap
export default function ProviderWrapper(props: Props): ReactNode {
  const transformCode = useCallback((inputCode: string) => {
    const trimmed = inputCode.trim();

    if (/\b(import|export|function|class|render)\b/.test(trimmed)) {
      return inputCode;
    }

    return `function App() {\n${inputCode}\n}`;
  }, []);

  return (
    <>
      <Provider {...props} transformCode={props.transformCode ?? transformCode} />
    </>
  );
}

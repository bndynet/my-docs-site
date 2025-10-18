import { type ReactNode, useEffect } from 'react';

import { useColorMode } from '@docusaurus/theme-common';
import ColorModeToggle from '@theme-original/ColorModeToggle';

import type ColorModeToggleType from '@theme/ColorModeToggle';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof ColorModeToggleType>;

export const EVENT_THEME_CHANGE = 'themeChanged';

export default function ColorModeToggleWrapper(props: Props): ReactNode {
  const { colorMode } = useColorMode();

  useEffect(() => {
    // colorMode: light or dark
    window.dispatchEvent(
      new CustomEvent(EVENT_THEME_CHANGE, {
        detail: { theme: colorMode },
      })
    );
  }, [colorMode]);

  return (
    <>
      <ColorModeToggle {...props} />
    </>
  );
}

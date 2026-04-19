import { type ReactNode, useEffect } from 'react';

import ColorModeToggle from '@theme-original/ColorModeToggle';

import type ColorModeToggleType from '@theme/ColorModeToggle';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof ColorModeToggleType>;

export const EVENT_THEME_CHANGE = 'themeChanged';

/**
 * Wrapper around the default `ColorModeToggle` that forwards color-mode
 * changes to the rest of the app via a `themeChanged` `CustomEvent`.
 *
 * We intentionally avoid `useColorMode()` here: in some Docusaurus versions,
 * the toggle is rendered on the server (SSR) in a tree without a
 * `ColorModeProvider`, which makes `useColorMode()` throw. Instead we watch
 * the `data-theme` attribute on `<html>`, which Docusaurus toggles whenever
 * the color mode changes. This is robust across Docusaurus versions and
 * never runs on the server.
 */
export default function ColorModeToggleWrapper(props: Props): ReactNode {
  useEffect(() => {
    const root = document.documentElement;
    const read = () => root.getAttribute('data-theme') ?? 'light';
    const emit = (theme: string) => {
      window.dispatchEvent(
        new CustomEvent(EVENT_THEME_CHANGE, { detail: { theme } })
      );
    };

    emit(read());

    const observer = new MutationObserver(() => emit(read()));
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return <ColorModeToggle {...props} />;
}

import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import { EVENT_THEME_CHANGE } from '../theme/ColorModeToggle';

const DEFAULT_THEME = 'light';

const initialTheme =
  typeof window !== 'undefined' && typeof window.getCurrentTheme === 'function'
    ? window.getCurrentTheme()
    : DEFAULT_THEME;

function updateThemeInUrl(url, newTheme) {
  if (!newTheme || !url) {
    return url;
  }
  const urlObj = new URL(url);
  urlObj.searchParams.set("theme", newTheme);
  return urlObj.toString();

}

export default function Showcase() {
  const searchParams = new URLSearchParams(window.location.search);
  const paramUrl = searchParams.get('url');

  const { siteConfig } = useDocusaurusContext();
  const [theme, setTheme] = useState(initialTheme);
  const [url, setUrl] = useState(updateThemeInUrl(paramUrl, theme));

  useEffect(() => {
    function onThemeChange(_event) {
      if (typeof window.getCurrentTheme !== 'function') return;

      const nextTheme = window.getCurrentTheme();
      setUrl(updateThemeInUrl(paramUrl, nextTheme));
      setTheme(nextTheme);
    }

    onThemeChange();
    window.addEventListener(EVENT_THEME_CHANGE, onThemeChange);
    return () => {
      window.removeEventListener(EVENT_THEME_CHANGE, onThemeChange);
    };
  }, []);
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={`${siteConfig.tagline}`}
      noFooter
    >
      {url ? (
        <iframe
          style={{ width: '100%', height: 'calc(100vh - 60px)' }}
          title="Hello World"
          src={url}
          loading="lazy"
          allowtransparency="true"
          allowFullScreen
        ></iframe>
      ) : (
        <div
          className="text-center place-content-center text-8xl"
          style={{ height: 'calc(100vh - 129px)' }}
        >
          Coming soon...
        </div>
      )}
    </Layout>
  );
}

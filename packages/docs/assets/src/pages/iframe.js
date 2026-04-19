import { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import { EVENT_THEME_CHANGE } from '../theme/ColorModeToggle';

const DEFAULT_THEME = 'light';

function updateThemeInUrl(url, newTheme) {
  if (!newTheme || !url) {
    return url;
  }
  const urlObj = new URL(url);
  urlObj.searchParams.set("theme", newTheme);
  return urlObj.toString();
}

export default function IframePage() {
  const { siteConfig } = useDocusaurusContext();
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const p = searchParams.get('url');
    const t =
      typeof window.getCurrentTheme === 'function'
        ? window.getCurrentTheme()
        : DEFAULT_THEME;
    setTheme(t);
    setUrl(updateThemeInUrl(p, t));

    function onThemeChange() {
      if (typeof window.getCurrentTheme !== 'function') return;
      const nextTheme = window.getCurrentTheme();
      setUrl(updateThemeInUrl(p, nextTheme));
      setTheme(nextTheme);
    }

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

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@docusaurus/router';
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
  const location = useLocation();
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Re-derive the embedded URL from the live router location so navigating
  // between two `/iframe?url=…` navbar items (same pathname, different
  // query) actually swaps the iframe `src` instead of reusing the value
  // captured on the first mount.
  const sourceUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('url');
  }, [location.search]);

  useEffect(() => {
    if (typeof window.getCurrentTheme === 'function') {
      setTheme(window.getCurrentTheme());
    }
    function onThemeChange() {
      if (typeof window.getCurrentTheme !== 'function') return;
      setTheme(window.getCurrentTheme());
    }
    window.addEventListener(EVENT_THEME_CHANGE, onThemeChange);
    return () => {
      window.removeEventListener(EVENT_THEME_CHANGE, onThemeChange);
    };
  }, []);

  const url = useMemo(
    () => updateThemeInUrl(sourceUrl, theme),
    [sourceUrl, theme],
  );

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

import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const tabs = [{
  title: 'Hello World',
  url: 'https://codepen.io/bndynet/embed/rNbGWWz?default-tab=result&&theme-id=${theme}',
}
];

function getTabs(theme) {
  return tabs.map(item => {
    const newItem = { ...item };
    newItem.url = newItem.url.replace('${theme}', theme);
    return newItem;
  })
}

export default function Showcase() {
  const { siteConfig } = useDocusaurusContext();
  const [items, setItems] = useState([]);
  const [theme, setTheme] = useState('');
  const onThemeChange = (theme) => {
    setTheme(theme);
    setItems(getTabs(theme));
  };

  let themeChangeId;
  useEffect(() => {
    setItems(getTabs(window.getCurrentTheme()));
    themeChangeId = setTimeout(() => {
      window.listenThemeChange(onThemeChange, {
        once: true
      });
    }, 100);
    return () => {
      if (themeChangeId) {
        clearTimeout(themeChangeId);
      }
    }
  }, [theme]);
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={`${siteConfig.tagline}`}
      noFooter
    >
      {items && items.length > 0 ? (
        <Tabs key={theme} className="showcase">
          {items.map((item, idx) => (
            <TabItem key={idx} value={item.title} label={item.title} default={idx === 0}>
              {item.url ? <iframe style={{ width: '100%', height: 'calc(100vh - 129px)' }} scrolling="no" title="Hello World" src={item.url} frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen>
              </iframe> : <div className='text-center place-content-center text-8xl' style={{ height: 'calc(100vh - 129px)' }}>Coming soon...</div>}
            </TabItem>
          ))}
        </Tabs>
      ) : <div className='text-center place-content-center text-8xl' style={{ height: 'calc(100vh - 129px)' }}>No Content</div>}

    </Layout>
  );
}

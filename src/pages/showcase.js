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
  const [items, setItems] = useState(getTabs(window.getCurrentTheme()));
  const onThemeChange = (theme) => {
    setItems(getTabs(theme));
  };

  let themeChangeId;
  useEffect(() => {
    return () => {
      if (themeChangeId) {
        clearTimeout(themeChangeId);
      }
    }
  })
  themeChangeId = setTimeout(() => {
    window.listenThemeChange(onThemeChange, {
      once: true
    });
  }, 100);
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={`${siteConfig.tagline}`}
      noFooter
    >
      <Tabs className="showcase">
        {items.map((item, idx) => (
          <TabItem key={idx} value={item.title} label={item.title} default={idx === 0}>
            {item.url ? <iframe style={{ width: '100%', height: 'calc(100vh - 129px)' }} scrolling="no" title="Hello World" src={item.url} frameBorder="no" loading="lazy" allowtransparency="true" allowFullScreen>
            </iframe> : <div className='text-center place-content-center text-8xl' style={{ height: 'calc(100vh - 129px)' }}>Coming soon...</div>}
          </TabItem>
        ))}
      </Tabs>

    </Layout>
  );
}

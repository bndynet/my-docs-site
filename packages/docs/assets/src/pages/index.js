import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageMain from '@site/src/components/HomepageMain';

import styles from './index.module.css';

const EXTERNAL_URL_RE = /^(https?:)?\/\/|^mailto:|^tel:/i;

function HeroButton({button, className}) {
  if (!button || !button.label || !button.href) return null;
  if (EXTERNAL_URL_RE.test(button.href)) {
    return (
      <a
        className={className}
        href={button.href}
        target="_blank"
        rel="noopener noreferrer">
        {button.label}
      </a>
    );
  }
  return (
    <Link className={className} to={button.href}>
      {button.label}
    </Link>
  );
}

function HeroLink({link, className}) {
  if (!link || !link.label || !link.href) return null;
  if (EXTERNAL_URL_RE.test(link.href)) {
    return (
      <a
        className={className}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return (
    <Link className={className} to={link.href}>
      {link.label}
    </Link>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const hero = siteConfig.customFields?.hero || {};
  if (hero.hidden) return null;

  const title = hero.title || siteConfig.title;
  const subtitle = hero.subtitle || siteConfig.tagline;
  const variant = hero.variant || 'primary';
  const variantClass = variant === 'none' ? null : `hero--${variant}`;

  const bg = hero.background || {};
  const hasImage = Boolean(bg.image);
  const bannerStyle = {};
  if (bg.color) bannerStyle.backgroundColor = bg.color;
  if (hasImage) {
    bannerStyle.backgroundImage = `url(${bg.image})`;
    bannerStyle.backgroundSize = 'cover';
    bannerStyle.backgroundPosition = 'center';
  }

  const button = hero.button;
  const link = hero.link;
  const hasButton = button && button.label;

  return (
    <header
      className={clsx('hero', variantClass, styles.heroBanner)}
      style={bannerStyle}>
      {hasImage && bg.overlay && (
        <div
          className={styles.heroOverlay}
          style={{backgroundColor: bg.overlay}}
          aria-hidden="true"
        />
      )}
      <div className={clsx('container', styles.heroContent)}>
        <h1 className="hero__title">{title}</h1>
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}
        {hasButton && (
          <div className={styles.buttons}>
            <HeroButton
              button={button}
              className="button button--secondary button--lg"
            />
          </div>
        )}
        <HeroLink link={link} className={styles.heroLink} />
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageMain />
      </main>
    </Layout>
  );
}

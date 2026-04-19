import React from 'react';
// Content lives in ./HomepageMain.mdx. Use the @site path so consumers can
// drop a same-path override under <siteDir>/src/components/HomepageMain/ and
// the DocsResolvePlugin (see buildDocusaurusConfig.cjs) picks it up.
import Content from '@site/src/components/HomepageMain/HomepageMain.mdx';

export default function HomepageMain() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Content />
          </div>
        </div>
      </div>
    </section>
  );
}

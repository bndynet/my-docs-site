import { type ReactNode } from 'react';
import NavbarNavLink from '@theme-original/NavbarItem/NavbarNavLink';

import type NavbarNavLinkType from '@theme/NavbarItem/NavbarNavLink';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof NavbarNavLinkType>;

/**
 * Wrapper around the default `NavbarItem/NavbarNavLink` that adds
 * search-string-aware active matching.
 *
 * Why this exists: Docusaurus (via React Router v5 `<NavLink>`) computes the
 * active state from `location.pathname` only. So two navbar entries that
 * share a pathname but differ in their query string — e.g.
 * `to: '/iframe?url=https://a.net'` and `to: '/iframe?url=https://b.net'` —
 * both light up at the same time. The shipped `activeBaseRegex` escape hatch
 * still only matches against `pathname`, so it can't disambiguate them.
 *
 * Behaviour:
 *  - When `to` carries a `?…` and the consumer hasn't already provided an
 *    explicit `activeBasePath`, `activeBaseRegex`, or `isActive`, we inject
 *    a custom matcher that requires the pathname to equal the target
 *    pathname AND every query param of the target to be present (and equal)
 *    on the live location. Extra params on the live URL are tolerated so
 *    the link stays active across in-page filter additions.
 *  - For every other shape of `to` we render the upstream link unchanged,
 *    preserving the default prefix-based pathname matching that the rest of
 *    the navbar relies on.
 *
 * The injected `isActive` flows to the underlying `<Link>` because the
 * upstream component spreads `...props` AFTER its own optional `isActive`,
 * so anything we pass through wins. See
 * `node_modules/@docusaurus/theme-classic/lib/theme/NavbarItem/NavbarNavLink.js`.
 */
export default function NavbarNavLinkWrapper(props: Props): ReactNode {
  const { to, activeBasePath, activeBaseRegex, isActive } = props as Props & {
    isActive?: unknown;
  };

  if (
    typeof to === 'string' &&
    to.includes('?') &&
    !activeBasePath &&
    !activeBaseRegex &&
    typeof isActive !== 'function'
  ) {
    const matcher = buildSearchAwareIsActive(to);
    if (matcher) {
      return <NavbarNavLink {...props} isActive={matcher} />;
    }
  }

  return <NavbarNavLink {...props} />;
}

function buildSearchAwareIsActive(
  to: string,
): ((match: unknown, location: { pathname: string; search: string }) => boolean) | undefined {
  // Use a synthetic origin so the URL parser accepts a path-only string and
  // we can read pathname/search without leaking that origin anywhere.
  let target: URL;
  try {
    target = new URL(to, 'http://navbar.local/');
  } catch {
    return undefined;
  }
  const targetPathname = target.pathname;
  const targetParams = Array.from(target.searchParams.entries());

  return (_match, location) => {
    if (location.pathname !== targetPathname) return false;
    const current = new URLSearchParams(location.search);
    for (const [key, value] of targetParams) {
      if (current.get(key) !== value) return false;
    }
    return true;
  };
}

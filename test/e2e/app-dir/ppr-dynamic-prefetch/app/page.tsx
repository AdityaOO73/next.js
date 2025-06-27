import Link from 'next/link'
import { ComponentProps } from 'react'

export default function Page() {
  return (
    <main>
      <h1>Page 1</h1>
      <ul>
        <li>
          cookies
          <ul>
            <li>
              <DebugLink href="/cookies" prefetch={true} />
            </li>
            <li>
              <DebugLink href="/cookies" prefetch="unstable_forceStale" />
            </li>
            <li>
              <DebugLink href="/cookies" prefetch={null} />
            </li>
          </ul>
        </li>
        <li>
          <DebugLink href="/error-after-cookies" prefetch={true} />
        </li>
        <li>
          <DebugLink href="/sync-io-after-cookies" prefetch={true} />
        </li>
        <li>
          <DebugLink href="/cookies-only" prefetch={true} />
        </li>
        <li>
          search params
          <ul>
            <li>
              <DebugLink href="/search-params?foo=123" prefetch={true} />
            </li>
            <li>
              <DebugLink href="/search-params?foo=456" prefetch={true} />
            </li>
          </ul>
        </li>
        <li>
          dynamic params
          <ul>
            <li>
              <DebugLink href="/dynamic-params/123" prefetch={true} />
            </li>
            <li>
              <DebugLink href="/dynamic-params/456" prefetch={true} />
            </li>
          </ul>
        </li>
        <li>
          <DebugLink href="/fully-static" prefetch={true} />
        </li>
      </ul>
    </main>
  )
}

function DebugLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const prefetchKind = {
    null: 'auto',
    true: 'dynamic',
    false: 'disabled',
    unstable_forceStale: 'legacy-true',
  }[`${props.prefetch ?? null}`]
  return (
    <details data-href={href}>
      <summary>
        {href} ({prefetchKind})
      </summary>
      <Link href={href} {...props}>
        {href} ({prefetchKind})
      </Link>
    </details>
  )
}

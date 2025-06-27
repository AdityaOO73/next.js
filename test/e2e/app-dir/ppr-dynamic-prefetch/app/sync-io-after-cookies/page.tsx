import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { cachedDelay, DebugRenderKind } from '../shared'
import { ErrorBoundary } from '../error-boundary'

// This page performs sync IO after a cookies call, so we should only see the error in a dynamic prefetch or a navigation
// (and not during prerendering / prefetching)

export default async function Page() {
  return (
    <main>
      <DebugRenderKind />
      <Suspense fallback={<div style={{ color: 'grey' }}>Loading 1...</div>}>
        <ErrorBoundary>
          <One />
        </ErrorBoundary>
      </Suspense>
    </main>
  )
}

async function One() {
  const cookieStore = await cookies()
  await cachedDelay(1000, ['/cookies', cookieStore.get('user-agent')?.value])
  return <>Date.now(): {Date.now()}</>
}

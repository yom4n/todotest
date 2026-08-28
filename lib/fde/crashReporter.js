/**
 * Minimal crash-capture hook -- JS port of FDE-Project/client-sdks/react/crashReporter.ts
 * for this app's plain-JS / Pages Router setup. See that file for full
 * commentary; this is a straight type-strip, same behavior.
 */

let installed = false

export function installCrashReporter(options) {
  if (installed || typeof window === 'undefined') {
    return
  }
  installed = true

  window.addEventListener('error', (event) => {
    reportCrash(options, {
      message: event.message || 'Unknown window error',
      stack: event.error instanceof Error ? event.error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      source: 'window.onerror',
      environment: options.environment,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    reportCrash(options, {
      message: reason instanceof Error ? reason.message : String(reason ?? 'Unhandled promise rejection'),
      stack: reason instanceof Error ? reason.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      source: 'unhandledrejection',
      environment: options.environment,
    })
  })
}

/** Called by CrashBoundary.js's componentDidCatch -- the React-render-tree crash path. */
export function reportReactCrash(options, error, componentStack) {
  reportCrash(options, {
    message: error.message,
    stack: error.stack,
    componentStack: componentStack || undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    source: 'react-error-boundary',
    environment: options.environment,
  })
}

function reportCrash(options, payload) {
  if (options.onCapture && options.onCapture(payload) === false) {
    return
  }

  // Fire-and-forget: works both in the browser (fetch) and during Next.js
  // server-side rendering (Node 18+'s global fetch) -- a render error on
  // the very first request is caught by the error boundary during SSR
  // itself, before any client-side JS has even run.
  fetch(`${options.backendUrl}/api/v1/ingest/crash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Swallowed on purpose -- see crashReporter.ts's comment. If the
    // triage backend is down, the monitored app must not also break.
  })
}

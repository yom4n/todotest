/**
 * React error boundary that reports render-tree crashes to the FDE triage
 * backend, and installs the window-level crash hooks on mount. JS port of
 * FDE-Project/client-sdks/react/CrashBoundary.tsx -- see that file for
 * full commentary on why a separate error boundary is needed alongside
 * window.onerror/unhandledrejection.
 */

import React from 'react'
import { installCrashReporter, reportReactCrash } from './crashReporter'

export class CrashBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidMount() {
    installCrashReporter(this.props.options)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    reportReactCrash(this.props.options, error, info.componentStack || null)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p role="alert">Something went wrong.</p>
    }
    return this.props.children
  }
}

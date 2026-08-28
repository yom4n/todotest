import '../styles/globals.css'
import { CrashBoundary } from '../lib/fde/CrashBoundary'

export default function MyApp({ Component, pageProps }) {
  return (
    <CrashBoundary
      options={{
        backendUrl: process.env.NEXT_PUBLIC_TRIAGE_BACKEND_URL || 'http://127.0.0.1:8000',
        environment: 'development',
      }}
    >
      <Component {...pageProps} />
    </CrashBoundary>
  )
}

import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/*
 * Reset scroll on navigation.
 *
 * React Router keeps the window's scroll offset across route changes, so
 * following a link from halfway down one page dropped you halfway down the
 * next. The home page only escaped this because Dock's scroll-spy effect
 * happened to call scrollTo(0, 0) — which covered '/' and nothing else.
 *
 * Two deliberate exceptions:
 *   - state.scrollTo means a section was explicitly requested (the Navbar's
 *     "About" from another page); Home scrolls there itself, so stay put.
 *   - POP is the back/forward button, where the reader expects to return to
 *     where they were rather than be thrown to the top.
 */
export default function ScrollToTop() {
  const { pathname, state } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (state?.scrollTo) return
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, state, navigationType])

  return null
}

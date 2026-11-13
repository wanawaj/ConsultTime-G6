import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import Brand from './Brand.jsx'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Features', to: '/features' },
]

export default function SiteHeader() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastY = useRef(0)
  const travel = useRef(0)

  // This shared header handles every current and future route automatically.
  useEffect(() => {
    setMenuOpen(false)
    setHeaderHidden(false)
    lastY.current = window.scrollY
    travel.current = 0
  }, [pathname])

  useEffect(() => {
    let ticking = false
    let pendingFrame = 0
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      pendingFrame = window.requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY)
        const delta = y - lastY.current
        const previousTravel = travel.current
        lastY.current = y
        setScrolled(y > 9)

        if (y < 72 || menuOpen) {
          setHeaderHidden(false)
          travel.current = 0
        } else if (Math.abs(delta) > 0.5) {
          // Small directional movements must accumulate before toggling.
          // This prevents a shaky header on trackpads or tiny scroll changes.
          travel.current = Math.sign(delta) === Math.sign(previousTravel)
            ? Math.max(-90, Math.min(90, previousTravel + delta))
            : delta
          if (travel.current > 14) {
            setHeaderHidden(true)
            travel.current = 0
          } else if (travel.current < -8) {
            setHeaderHidden(false)
            travel.current = 0
          }
        }
        ticking = false
      })
    }

    if (menuOpen) setHeaderHidden(false)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.cancelAnimationFrame(pendingFrame)
    }
  }, [menuOpen, pathname])
  return (
    <header className={`ct-header${scrolled ? ' scrolled' : ''}${headerHidden && !menuOpen ? ' ct-header-hidden' : ''}`} onFocusCapture={() => setHeaderHidden(false)}>
      <div className="ct-header-inner ct-container">
        <Brand />
        <button type="button" className="ct-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="ct-site-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}><Icon name={menuOpen ? 'close' : 'menu'} size={24} /></button>
        <div className={`ct-header-navigation${menuOpen ? ' open' : ''}`} id="ct-site-nav">
          <nav aria-label="Primary navigation" className="ct-nav-links">
            {navItems.map(({ label, to }) => <NavLink key={to} end={to === '/'} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
          </nav>
          <div className="ct-nav-actions">
            {user ? <><Link to="/portal" className="ct-btn ct-btn-primary ct-header-join">Dashboard <Icon name="arrow-right" size={16}/></Link><button type="button" className="ct-header-signin ct-signout" onClick={signOut}>Sign out</button></> : <><Link to="/login" className="ct-header-signin">Sign In</Link><Link to="/signup" className="ct-btn ct-btn-primary ct-header-join">Get Started <Icon name="arrow-right" size={16}/></Link></>}
          </div>
        </div>
      </div>
    </header>
  )
}

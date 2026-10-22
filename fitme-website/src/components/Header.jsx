import { useState } from 'react';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#screenshots', label: 'Screenshots' },
  { href: '#install', label: 'Install' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="FITME home">
          <span className="logo-badge logo-badge--small">
            <img src="/logo.png" alt="" width="40" height="40" />
          </span>
          <span className="wordmark">
            FIT<span className="accent">ME</span>
          </span>
        </a>

        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

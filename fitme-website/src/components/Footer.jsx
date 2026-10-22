import { DEVELOPER, SOCIAL_LINKS } from '../config.js';

// Simple monochrome icons (drawn for this site), coloured with the neon accent.
const ICONS = {
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" />
      <path d="M10 9v6l5-3z" fill="#0a0a0a" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <path d="M13.2 21v-6.8h2.3l.4-2.7h-2.7V9.8c0-.8.3-1.3 1.4-1.3h1.4V6.1a18 18 0 0 0-2.1-.1c-2.1 0-3.5 1.3-3.5 3.6v1.9H8.1v2.7h2.3V21z" fill="#0a0a0a" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8.2c.3-.4.6-.4.9-.4h.4c.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .6-.3 1.4-1 1.7-.8.4-2.4.3-4.4-1.2-1.6-1.2-2.7-2.8-3-4-.3-1.2.3-2.1.7-2.5z" fill="currentColor" />
    </>
  ),
};

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-inner">
        <span className="logo-badge logo-badge--medium">
          <img src="/logo.png" alt="GYM LOVER Deepak logo" width="96" height="96" loading="lazy" />
        </span>
        <p className="credit">Designed &amp; Developed by</p>
        <p className="credit-name">{DEVELOPER.name}</p>
        <a className="email" href={`mailto:${DEVELOPER.email}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {DEVELOPER.email}
        </a>
        <ul className="socials">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.id === 'whatsapp' ? 'Chat on WhatsApp' : `Open ${link.label}`}
                title={link.label}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[link.id]}
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <p className="copyright">© {new Date().getFullYear()} FITME · Designed &amp; Developed by Gymlover Deepak</p>
      </div>
    </footer>
  );
}

import { APK } from '../config.js';

// The single Download APK button. It only works once a real APK URL is configured (see config.js).
function DownloadButton() {
  if (!APK.url) {
    return (
      <div className="download">
        <button type="button" className="button button--primary" disabled aria-describedby="apk-status">
          <DownloadIcon /> DOWNLOAD APK
        </button>
        <p id="apk-status" className="download-note">
          APK coming soon — the download will appear here once it is published.
        </p>
      </div>
    );
  }

  const details = [APK.version && `Version ${APK.version}`, APK.size, 'Android 7.0 or newer'].filter(Boolean);
  return (
    <div className="download">
      <a className="button button--primary" href={APK.url} rel="noopener">
        <DownloadIcon /> DOWNLOAD APK
      </a>
      <p className="download-note">{details.join(' · ')}</p>
      <p className="download-note download-note--muted">
        Android may ask you to allow installs from your browser or file manager. See the steps below.
      </p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4.5-4.5M12 14 7.5 9.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">FITME by Gymlover Deepak</p>
          <h1 className="hero-title">
            YOUR FITNESS.
            <br />
            <span className="accent">YOUR RULES.</span>
          </h1>
          <p className="hero-subtitle">Train smarter. Track your progress. Build your strength.</p>
          <div id="download">
            <DownloadButton />
          </div>
          <ul className="pills" aria-label="Highlights">
            <li>Works offline</li>
            <li>No account</li>
            <li>No ads</li>
            <li>Free</li>
          </ul>
        </div>
        <div className="hero-visual">
          <span className="logo-badge logo-badge--large">
            <img src="/logo.png" alt="GYM LOVER Deepak logo" width="260" height="260" />
          </span>
        </div>
      </div>
    </section>
  );
}

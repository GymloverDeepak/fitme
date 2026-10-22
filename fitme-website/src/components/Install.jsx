import useReveal from '../useReveal.js';

const STEPS = [
  { title: 'Download', text: 'On your Android phone, tap DOWNLOAD APK at the top of this page and wait for the download to finish.' },
  {
    title: 'Open the file',
    text: 'Tap the download notification, or open your Files / Downloads app and tap the FITME APK.',
  },
  {
    title: 'Allow this source if asked',
    text: 'The first time, Android may ask you to allow installs from the app you are using (for example Chrome or Files). Allow it for that app only — you can switch it off again afterwards.',
  },
  { title: 'Install & open', text: 'Tap Install, then Open. FITME works straight away — no account or internet connection needed.' },
];

export default function Install() {
  const ref = useReveal();
  return (
    <section id="install" className="section">
      <div className="container">
        <p className="eyebrow">Installation</p>
        <h2 className="section-title">Install on Android in 4 steps</h2>
        <ol ref={ref} className="steps reveal">
          {STEPS.map((step, index) => (
            <li key={step.title} className="step">
              <span className="step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="notes">
          <p>
            <strong>Requirements:</strong> Android 7.0 or newer.
          </p>
          <p>
            <strong>Updating:</strong> install the new APK over the existing app — your saved data stays on your phone.
          </p>
          <p>
            <strong>Stay safe:</strong> only download FITME from this website. Keep Google Play Protect and your phone’s other
            security features switched on — FITME does not need you to turn anything off.
          </p>
        </div>
      </div>
    </section>
  );
}

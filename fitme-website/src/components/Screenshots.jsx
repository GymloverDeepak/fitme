import useReveal from '../useReveal.js';

// Real screenshots of FITME running on a Samsung Galaxy Z Fold6 (cover screen).
const SHOTS = [
  { src: '/screenshots/home.jpg', caption: 'Home dashboard' },
  { src: '/screenshots/workout-planner.jpg', caption: 'Workout planner' },
  { src: '/screenshots/exercise-library.jpg', caption: 'Exercise library' },
  { src: '/screenshots/exercise-demo.jpg', caption: 'Animated demonstration' },
  { src: '/screenshots/deadlift-planner.jpg', caption: 'Deadlift planner' },
  { src: '/screenshots/deadlift-session.jpg', caption: 'Deadlift session' },
];

export default function Screenshots() {
  const ref = useReveal();
  return (
    <section id="screenshots" className="section section--alt">
      <div className="container">
        <p className="eyebrow">Screenshots</p>
        <h2 className="section-title">See FITME in action</h2>
        <p className="section-lead">Real screenshots from the app running on an Android phone.</p>
      </div>
      <div ref={ref} className="gallery reveal" tabIndex={0} aria-label="App screenshots, scroll sideways">
        {SHOTS.map((shot) => (
          <figure key={shot.src} className="shot">
            <img src={shot.src} alt={`FITME app: ${shot.caption}`} width="540" height="1325" loading="lazy" decoding="async" />
            <figcaption>{shot.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

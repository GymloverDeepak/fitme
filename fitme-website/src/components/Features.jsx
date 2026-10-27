import useReveal from '../useReveal.js';

// Every claim below describes a feature that exists in FITME v1.1.1.
const FEATURES = [
  {
    title: 'Workout plans',
    text: '18 sample weekly plans from beginner to advanced — strength splits like Push/Pull/Legs, Upper/Lower and a Bro Split, plus the new training styles below. Edit any day: add, remove and reorder exercises, change sets, reps, rest and warm-ups.',
    icon: 'M4 10h2v4H4zM18 10h2v4h-2zM6 8h2v8H6zM16 8h2v8h-2zM8 11h8v2H8z',
  },
  {
    title: 'New training styles',
    text: 'HYROX-style and CrossFit-style plans for beginner, intermediate and advanced, six-pack abs core plans, a fat-loss plan, low-impact women’s cardio with light weights, and gentle prenatal movement (only with your clinician’s approval). Each session has a warm-up, cool-down and easier options.',
    icon: 'M13 3 5 14h6l-1 7 8-11h-6z',
  },
  {
    title: 'BMI calculator',
    text: 'Enter weight in kg and height in cm or feet and inches to see your BMI and the standard adult screening category. BMI is a screening tool, not a diagnosis — it can be misleading for muscular athletes and is not used for children or during pregnancy.',
    icon: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 6h8v4H8zM8 13h1M12 13h1M16 13h0M8 17h1M12 17h1M16 17h0',
  },
  {
    title: 'Exercise library',
    text: '104 exercises across chest, back, shoulders, arms, legs & glutes, core, compound lifts and cardio & conditioning. Search by name and filter by difficulty, muscle group and equipment. Equipment-based moves list an alternative.',
    icon: 'M5 4h10l4 4v12H5zM8 11h8M8 14h8M8 17h5',
  },
  {
    title: 'Animated demonstrations',
    text: '72 exercises have their own original animated demonstration with start and end positions and a play/pause control. Every exercise has step-by-step form cues and safety notes.',
    icon: 'M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 8v6M12 14l-3 6M12 14l3 6M12 10l-4 2M12 10l4-2',
  },
  {
    title: 'Deadlift planner',
    text: 'Conservative weight calculator, warm-up sets, plates per side, a pre-lift safety checklist, set and RPE logging, and next-session advice. No max testing, and weights never increase automatically.',
    icon: 'M3 12h18M6 7v10M9 9v6M15 9v6M18 7v10',
  },
  {
    title: 'Progress tracking',
    text: 'Workout session history, completed sets, body weight and optional body measurements, daily water intake, plus deadlift records and strength trends.',
    icon: 'M4 19h16M7 16v-4M11 16V8M15 16v-6M19 16V5',
  },
  {
    title: 'Indian diet planner',
    text: 'Sample vegetarian and non-vegetarian meal plans for muscle gain, fat loss or general fitness, with serving sizes and calorie and protein estimates.',
    icon: 'M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 2-2 6 0 8v10',
  },
  {
    title: 'Offline & private',
    text: 'Works without internet. No login, no ads and no subscription. Your data stays on your phone — it is not uploaded to any server.',
    icon: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z',
  },
];

function FeatureCard({ feature, index }) {
  const ref = useReveal();
  return (
    <article ref={ref} className="card reveal" style={{ '--delay': `${(index % 3) * 80}ms` }}>
      <span className="card-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path d={feature.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3>{feature.title}</h3>
      <p>{feature.text}</p>
    </article>
  );
}

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <p className="eyebrow">What’s inside</p>
        <h2 className="section-title">Everything you need to train — in one app</h2>
        <div className="grid">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        <p className="disclaimer">
          Workout and diet plans are general samples, not personalised or medical advice. All training loads are suggestions.
        </p>
      </div>
    </section>
  );
}

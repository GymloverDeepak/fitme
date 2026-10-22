// Original, locally generated exercise demonstrations (no image files, no downloads, no licences needed).
// Each demo is a start pose and an end pose for the stick-figure engine in src/utils/pose.js; the app
// animates between them. See pose.js for the angle conventions.
//
// Every exercise ID is mapped explicitly in DEMOS at the bottom. getDemo() returns null for anything
// unmapped, and the UI then shows a placeholder instead of a broken image.

const FLOOR = 90; // ankle height when standing on the floor

function polar(point, degrees, length) {
  const radians = (degrees * Math.PI) / 180;
  return [point[0] + Math.cos(radians) * length, point[1] - Math.sin(radians) * length];
}

// ---------- Prop helpers ----------
const line = (from, to, width = 2, color = 'equipDark', front = false) => ({ kind: 'line', from, to, width, color, front });
const disc = (at, r, color = 'equip', front = true) => ({ kind: 'circle', at, r, color, front });
const plate = (joint = 'hand', r = 6) => disc(joint, r);
const dumbbell = (joint = 'hand') => disc(joint, 3.2);
const kettlebell = (joint = 'hand') => disc({ j: joint, d: [0, 3] }, 4);
const hammerDumbbell = (joint = 'hand') => [
  line({ j: joint, d: [0, -4] }, { j: joint, d: [0, 4] }, 2.5, 'equip', true),
  disc({ j: joint, d: [0, -4.5] }, 2.2),
  disc({ j: joint, d: [0, 4.5] }, 2.2),
];
const cable = (anchor, joint = 'hand') => [line(anchor, joint, 1.1, 'equipDark'), disc(anchor, 2, 'equipDark', false)];
const flatBench = (x1, x2, y) => [line([x1, y], [x2, y], 4), line([x1 + 4, y + 2], [x1 + 4, 92]), line([x2 - 4, y + 2], [x2 - 4, 92])];
const seat = (x1, x2, y, backTop) =>
  backTop ? [line([x1, y], [x2, y], 4), line([x1, y], backTop, 4), line([(x1 + x2) / 2, y + 2], [(x1 + x2) / 2, 92])] : [line([x1, y], [x2, y], 4), line([(x1 + x2) / 2, y + 2], [(x1 + x2) / 2, 92])];
const pullUpBar = (y = 12) => [line([18, y], [82, y], 2.5, 'equip')];
const frontBarbell = () => [
  line({ j: 'handL', d: [-9, 0] }, { j: 'handR', d: [9, 0] }, 2.2, 'equip', true),
  line({ j: 'handL', d: [-8, -7] }, { j: 'handL', d: [-8, 7] }, 3.5, 'equip', true),
  line({ j: 'handR', d: [8, -7] }, { j: 'handR', d: [8, 7] }, 3.5, 'equip', true),
];
const hangingPlate = (joint) => [line(joint, { j: joint, d: [1, 9] }, 1, 'equipDark'), disc({ j: joint, d: [1, 12] }, 4.5)];

// ---------- Base poses ----------
const stand = (over = {}) => ({ view: 'side', root: 'ankle', at: [50, FLOOR], torso: 90, ua: -90, fa: -90, th: -90, sh: -90, ...over });
const frontStand = (over = {}) => ({
  view: 'front',
  at: [50, 58],
  thL: -95,
  shL: -92,
  thR: -85,
  shR: -88,
  ...over,
});

// ---------- Movement patterns ----------

function benchPress({ incline = 0, implement = 'barbell', cue }) {
  const torso = 180 - incline;
  const hip = [60, 60];
  const base = { view: 'side', root: 'hip', at: hip, torso, th: -35, sh: -95 };
  const back = polar(hip, torso, 30);
  const under = polar([0, 0], torso + 90, 3.5); // slightly below the torso line
  const benchProps =
    incline === 0
      ? flatBench(24, 68, 63.5)
      : [
          line([hip[0] + under[0], hip[1] + 3.5], [back[0] + under[0], back[1] + under[1]], 4),
          line([hip[0], 63.5], [70, 63.5], 4),
          line([62, 65], [62, 92]),
        ];
  return {
    view: 'side',
    start: { ...base, ua: 90, fa: 90 },
    end: { ...base, ua: -65 + incline * 0.5, fa: 100 - incline * 0.2 },
    props: [...benchProps, implement === 'dumbbell' ? dumbbell() : plate()],
    track: 'hand',
    cue,
  };
}

function machineChestPress() {
  const base = { view: 'side', root: 'hip', at: [44, 66], torso: 95, th: 0, sh: -90 };
  return {
    view: 'side',
    start: { ...base, ua: -165, fa: 5 },
    end: { ...base, ua: 0, fa: 0 },
    props: [...seat(36, 56, 69, [37, 38]), disc('hand', 2.5, 'equip'), line([76, 30], [76, 92], 3)],
    track: 'hand',
    cue: 'Press the handles forward, return slowly',
  };
}

function pushUp() {
  const base = { view: 'side', root: 'hand', at: [66, FLOOR], foot: -100 };
  return {
    view: 'side',
    start: { ...base, torso: 24, ua: -90, fa: -90, th: 204, sh: 204 },
    end: { ...base, torso: 12, ua: -150, fa: -30, th: 192, sh: 192 },
    track: 'shoulder',
    cue: 'Lower your chest as one straight line, push back up',
  };
}

function dumbbellFly() {
  // Seen from above: the bench runs down the screen, arms open out to the sides.
  const base = { view: 'front', at: [50, 70], thL: -95, shL: -90, thR: -85, shR: -90 };
  return {
    view: 'front',
    floor: false,
    start: { ...base, uaL: 180, faL: 180, uaR: 0, faR: 0, uaLScale: -0.3, faLScale: -0.3, uaRScale: -0.3, faRScale: -0.3 },
    end: { ...base, uaL: 185, faL: 190, uaR: -5, faR: -10 },
    props: [line([50, 38], [50, 96], 13, 'equipDark'), dumbbell('handL'), dumbbell('handR')],
    track: 'handL',
    cue: 'View from above: open your arms wide, then hug back together',
  };
}

function cableCrossover() {
  const base = frontStand();
  return {
    view: 'front',
    start: { ...base, uaL: 160, faL: 170, uaR: 20, faR: 10 },
    end: { ...base, uaL: 300, faL: 350, uaR: -120, faR: -170 },
    props: [...cable([6, 10], 'handL'), ...cable([94, 10], 'handR')],
    track: 'handL',
    cue: 'Sweep both hands down and together',
  };
}

function dip({ weighted = false, upright = false, cue }) {
  const base = { view: 'side', root: 'hand', at: [50, 48], th: -100, sh: -150 };
  const lean = upright ? 85 : 72;
  return {
    view: 'side',
    start: { ...base, torso: lean, ua: -90, fa: -90 },
    end: { ...base, torso: lean - 10, ua: 180, fa: -80 },
    props: [line([38, 49], [64, 49], 2.5, 'equip'), line([42, 50], [42, 92]), ...(weighted ? hangingPlate('hip') : [])],
    track: 'shoulder',
    cue,
  };
}

function pullUp({ weighted = false }) {
  // Front view, hands fixed on the bar.
  const base = { view: 'front', root: 'handL', at: [33.3, 14], thL: -95, shL: -95, thR: -85, shR: -85 };
  return {
    view: 'front',
    start: { ...base, uaL: 115, faL: 115, uaR: 65, faR: 65 },
    end: { ...base, uaL: -130.5, faL: 100, uaR: -49.5, faR: 80 },
    props: [...pullUpBar(13), ...(weighted ? hangingPlate('pelvis') : [])],
    track: 'head',
    cue: weighted ? 'Pull your chest to the bar with added weight' : 'Pull your chest towards the bar',
  };
}

function chinUp({ weighted = false }) {
  // Side view, hands fixed on the bar, palms facing you.
  const base = { view: 'side', root: 'hand', at: [55, 14], th: -95, sh: -125 };
  return {
    view: 'side',
    start: { ...base, torso: 90, ua: 90, fa: 90 },
    end: { ...base, torso: 95, ua: -80, fa: 100 },
    props: [...pullUpBar(13), ...(weighted ? hangingPlate('hip') : [])],
    track: 'head',
    cue: 'Drive your elbows down until your chin clears the bar',
  };
}

function latPulldown() {
  const base = { view: 'front', at: [50, 64], thL: -110, shL: -90, thR: -70, shR: -90, thLScale: 0.6, thRScale: 0.6 };
  return {
    view: 'front',
    start: { ...base, uaL: 115, faL: 115, uaR: 65, faR: 65 },
    end: { ...base, uaL: -130, faL: 100, uaR: -50, faR: 80 },
    props: [
      line([50, 2], [50, 9], 1.1),
      line({ j: 'handL', d: [-4, 0] }, { j: 'handR', d: [4, 0] }, 2.2, 'equip', true),
      line({ j: 'handL', d: [0, 0] }, [50, 4], 1, 'equipDark'),
      line({ j: 'handR', d: [0, 0] }, [50, 4], 1, 'equipDark'),
      line([34, 70], [66, 70], 4),
    ],
    track: 'handL',
    cue: 'Pull the bar to your upper chest, elbows down',
  };
}

function bentOverRow({ torso = 35, fromFloor = false, implement = 'barbell', cue }) {
  const legs = fromFloor ? { th: -40, sh: -110 } : { th: -70, sh: -100 };
  const base = stand({ at: [46, FLOOR], torso, ...legs });
  const props =
    implement === 'tbar'
      ? [line([6, 91], 'hand', 2.2, 'equip'), plate('hand', 5.5)]
      : implement === 'dumbbell'
        ? [dumbbell()]
        : [plate()];
  return {
    view: 'side',
    start: { ...base, ua: -90, fa: -90 },
    end: { ...base, ua: torso - 180 + 5, fa: -85 },
    props,
    track: 'hand',
    cue,
  };
}

function oneArmRow() {
  const base = stand({ at: [40, FLOOR], torso: 12, th: -75, sh: -95, ua2: -88, fa2: -88 });
  return {
    view: 'side',
    start: { ...base, ua: -90, fa: -90 },
    end: { ...base, ua: -160, fa: -85 },
    props: [...flatBench(56, 84, 66), dumbbell()],
    track: 'hand',
    cue: 'Row the dumbbell to your hip, keep your back flat',
  };
}

function seatedCableRow() {
  const base = { view: 'side', root: 'hip', at: [36, 72], th: 5, sh: -10, foot: 90 };
  return {
    view: 'side',
    start: { ...base, torso: 72, ua: -10, fa: -5 },
    end: { ...base, torso: 92, ua: -140, fa: 0 },
    props: [line([24, 75], [52, 75], 4), line([84, 60], [84, 82], 3), ...cable([88, 73])],
    track: 'hand',
    cue: 'Pull the handle to your stomach, chest tall',
  };
}

function chestSupportedRow() {
  const base = { view: 'side', root: 'hip', at: [38, 66], torso: 42, th: -100, sh: -92 };
  const back = polar([40, 70], 42, 28);
  return {
    view: 'side',
    start: { ...base, ua: -90, fa: -90 },
    end: { ...base, ua: -150, fa: -95 },
    props: [line([40, 70], back, 4), line([44, 72], [44, 92]), dumbbell()],
    track: 'hand',
    cue: 'Chest on the pad, drive your elbows back',
  };
}

function straightArmPulldown() {
  const base = stand({ torso: 78, th: -95, sh: -88 });
  return {
    view: 'side',
    start: { ...base, ua: 55, fa: 55 },
    end: { ...base, ua: -100, fa: -100 },
    props: [...cable([92, 6])],
    track: 'hand',
    cue: 'Keep arms long, sweep the bar to your thighs',
  };
}

// Hip hinge family: Romanian deadlift, conventional deadlift, rack pull.
function hinge({ variant }) {
  const top = stand({ at: [48, FLOOR] });
  const bottoms = {
    rdl: { th: -65, sh: -95, torso: 20 },
    deadlift: { th: -20, sh: -110, torso: 30 },
    rack: { th: -60, sh: -100, torso: 45 },
  };
  const bottom = { ...top, ...bottoms[variant] };
  const props = [plate('hand', 6.5)];
  if (variant === 'rack') props.unshift(line([80, 30], [80, 92], 2.5), line([54, 73.5], [80, 73.5], 2.5, 'equip'));
  const cues = {
    rdl: 'Push your hips back, bar close to your legs, then stand tall',
    deadlift: 'Push the floor away, hips and shoulders rise together',
    rack: 'From the pins at knee height, drive your hips forward',
  };
  return variant === 'rdl'
    ? { view: 'side', start: top, end: bottom, props, track: 'hip', cue: cues.rdl }
    : { view: 'side', start: bottom, end: top, props, track: 'hand', cue: cues[variant] };
}

// Trap bar: more upright, knees bend more, the frame sits around the body at hand height.
function trapBarDeadlift() {
  const top = stand({ at: [48, FLOOR] });
  const bottom = { ...top, th: -15, sh: -120, torso: 50 };
  return {
    view: 'side',
    start: bottom,
    end: top,
    props: [
      line({ j: 'hand', d: [-12, 0] }, { j: 'hand', d: [12, 0] }, 2.5, 'equip', true),
      disc({ j: 'hand', d: [-12, 0] }, 6),
      disc({ j: 'hand', d: [12, 0] }, 6),
    ],
    track: 'hand',
    cue: 'Stand inside the frame, push the floor away, stand tall',
  };
}

function sumoDeadlift() {
  const base = { view: 'front', root: 'ankleL', at: [30, FLOOR], uaL: -92, faL: -92, uaR: -88, faR: -88 };
  return {
    view: 'front',
    start: { ...base, thL: -150, shL: -95, thR: -30, shR: -85, torsoScale: 0.6 },
    end: { ...base, thL: -119, shL: -119, thR: -61, shR: -61, torsoScale: 1 },
    props: frontBarbell(),
    track: 'pelvis',
    cue: 'Wide stance, knees out, stand up with the bar close',
  };
}

function squat({ bar = 'back', cue }) {
  const arms = {
    back: (torso) => ({ ua: torso - 240, fa: torso - 25 }),
    front: (torso) => ({ ua: torso - 70, fa: torso + 65 }),
    goblet: (torso) => ({ ua: torso - 150, fa: torso - 5 }),
  }[bar];
  const topTorso = bar === 'back' ? 85 : 88;
  const bottomTorso = { back: 55, front: 72, goblet: 68 }[bar];
  const props = bar === 'goblet' ? [kettlebell()] : [plate('hand', 6)];
  return {
    view: 'side',
    start: stand({ torso: topTorso, ...arms(topTorso) }),
    end: stand({ torso: bottomTorso, th: -5, sh: -125, ...arms(bottomTorso) }),
    props,
    track: 'hip',
    cue,
  };
}

function hackSquat() {
  const base = { view: 'side', root: 'ankle', at: [64, 84], torso: 112, ua: -70, fa: -70 };
  return {
    view: 'side',
    start: { ...base, th: -100, sh: -78 },
    end: { ...base, th: -20, sh: -125 },
    props: [line([56, 88], [80, 80], 3), line({ j: 'hip', d: [-4, 2] }, { j: 'shoulder', d: [-4, 2] }, 3), line([30, 92], [30, 40], 2)],
    track: 'hip',
    cue: 'Back on the pad, lower until thighs are parallel',
  };
}

function legPress() {
  const base = { view: 'side', root: 'hip', at: [34, 70], torso: 140, ua: -40, fa: -10 };
  const platform = [line({ j: 'ankle', d: [-4.6, -6.6] }, { j: 'ankle', d: [4.6, 6.6] }, 3.5, 'equip', true)];
  return {
    view: 'side',
    start: { ...base, th: 70, sh: -20, foot: 55 },
    end: { ...base, th: 36, sh: 34, foot: 125 },
    props: [line([34, 74], [16, 58], 4), line([34, 74], [44, 74], 4), line([40, 76], [40, 92]), ...platform],
    track: 'ankle',
    cue: 'Press the platform away without locking your knees',
  };
}

function lunge({ split = false, cue }) {
  if (split) {
    const base = { view: 'side', root: 'ankle', at: [62, FLOOR], torso: 90, ua: -90, fa: -90, foot2: 170 };
    return {
      view: 'side',
      start: { ...base, th: -80, sh: -80, th2: -115, sh2: 170 },
      end: { ...base, th: -5, sh: -90, th2: -100, sh2: 125 },
      props: [line([22, 72], [40, 72], 4), line([30, 74], [30, 92]), dumbbell(), disc('hand2', 3, 'equipDark')],
      track: 'hip',
      cue,
    };
  }
  const base = { view: 'side', root: 'hip', torso: 90, ua: -90, fa: -90 };
  return {
    view: 'side',
    start: { ...base, at: [50, 58], th: -90, sh: -90, th2: -90, sh2: -90 },
    end: { ...base, at: [50, 71], th: -10, sh: -90, th2: -120, sh2: -170, foot2: -100 },
    props: [dumbbell()],
    track: 'hip',
    cue,
  };
}

function hipThrust() {
  const base = { view: 'side', root: 'ankle', at: [72, FLOOR] };
  return {
    view: 'side',
    start: { ...base, sh: -70, th: -30, torso: 160, ua: -20, fa: -20 },
    end: { ...base, sh: -90, th: 0, torso: 176, ua: -4, fa: -4 },
    props: [...flatBench(12, 34, 74), plate({ j: 'hip', d: [0, -5] }, 6)],
    track: 'hip',
    cue: 'Drive through your heels until your body is straight',
  };
}

function seatedLeg({ curl }) {
  const base = { view: 'side', root: 'hip', at: [44, 62], torso: 98, th: 0, ua: -80, fa: -10 };
  return {
    view: 'side',
    start: { ...base, sh: curl ? -8 : -100 },
    end: { ...base, sh: curl ? -112 : -5 },
    props: [...seat(30, 62, 65, [32, 34]), disc({ j: 'ankle', d: [curl ? 0 : 3, curl ? -3 : 0] }, 3, 'equip')],
    track: 'ankle',
    cue: curl ? 'Curl your heels down and under the seat' : 'Straighten your legs, lower slowly',
  };
}

function calfRaise() {
  const base = { view: 'side', root: 'toe', at: [58, 87] };
  return {
    view: 'side',
    start: { ...base, foot: 15 },
    end: { ...base, foot: -40 },
    props: [line([52, 90], [76, 90], 4)],
    track: 'ankle',
    cue: 'Rise onto your toes, lower your heels below the step',
  };
}

function overheadPress({ seated = false, implement = 'barbell', arnold = false, cue }) {
  const base = seated
    ? { view: 'side', root: 'hip', at: [46, 64], torso: 95, th: 0, sh: -90 }
    : stand({ at: [46, FLOOR] });
  const startArms = arnold ? { ua: -85, fa: 105 } : { ua: -70, fa: 95 };
  return {
    view: 'side',
    start: { ...base, ...startArms },
    end: { ...base, ua: 92, fa: 90 },
    props: [...(seated ? seat(36, 58, 67, [38, 36]) : []), implement === 'dumbbell' ? dumbbell() : plate()],
    track: 'hand',
    cue,
  };
}

function lateralRaise({ cable: withCable = false }) {
  const base = frontStand();
  if (withCable) {
    return {
      view: 'front',
      start: { ...base, uaL: -100, faL: -100, uaR: -110, faR: -125 },
      end: { ...base, uaL: -100, faL: -100, uaR: 5, faR: 10 },
      props: [...cable([22, 88], 'handR')],
      track: 'handR',
      cue: 'Raise your arm out to the side to shoulder height',
    };
  }
  return {
    view: 'front',
    start: { ...base, uaL: -100, faL: -100, uaR: -80, faR: -80 },
    end: { ...base, uaL: -185, faL: -190, uaR: 5, faR: 10 },
    props: [dumbbell('handL'), dumbbell('handR')],
    track: 'handR',
    cue: 'Raise both arms out to shoulder height, lower slowly',
  };
}

function rearDeltFly({ machine = false }) {
  const base = machine
    ? { view: 'front', at: [50, 64], thL: -110, shL: -90, thR: -70, shR: -90, thLScale: 0.6, thRScale: 0.6 }
    : frontStand({ torsoScale: 0.65, at: [50, 60] });
  const start = machine
    ? { uaL: 180, faL: 180, uaR: 0, faR: 0, uaLScale: -0.3, faLScale: -0.3, uaRScale: -0.3, faRScale: -0.3 }
    : { uaL: -75, faL: -80, uaR: -105, faR: -100 };
  const end = machine ? { uaL: 180, faL: 180, uaR: 0, faR: 0 } : { uaL: -180, faL: -175, uaR: 0, faR: -5 };
  return {
    view: 'front',
    start: { ...base, ...start },
    end: { ...base, ...end },
    props: machine ? [line([34, 70], [66, 70], 4), disc('handL', 2.5), disc('handR', 2.5)] : [dumbbell('handL'), dumbbell('handR')],
    track: 'handR',
    cue: machine ? 'Sweep the handles back in a wide arc' : 'Bent over, raise your arms out to the sides',
  };
}

function facePull() {
  const base = stand({ at: [44, FLOOR] });
  return {
    view: 'side',
    start: { ...base, ua: 180, uaScale: -1, fa: 8 },
    end: { ...base, ua: 180, uaScale: 1, fa: 45 },
    props: [...cable([94, 30])],
    track: 'hand',
    cue: 'Pull the rope to your face, elbows high',
  };
}

function curl({ implement = 'dumbbell', withCable = false, cue }) {
  const base = stand({ at: [48, FLOOR], torso: 90 });
  const props =
    implement === 'hammer' ? hammerDumbbell() : implement === 'barbell' ? [plate('hand', 5)] : [dumbbell()];
  return {
    view: 'side',
    start: { ...base, ua: -92, fa: -92 },
    end: { ...base, ua: -82, fa: 55 },
    props: [...(withCable ? cable([82, 90]) : []), ...props],
    track: 'hand',
    cue,
  };
}

function preacherCurl() {
  const base = { view: 'side', root: 'hip', at: [36, 68], torso: 85, th: 0, sh: -90, ua: -40 };
  return {
    view: 'side',
    start: { ...base, fa: -35 },
    end: { ...base, fa: 85 },
    props: [line([40, 50], [52, 60], 4), line([50, 62], [50, 92]), line([28, 71], [44, 71], 4), plate('hand', 5)],
    track: 'hand',
    cue: 'Upper arms on the pad, curl up, lower slowly',
  };
}

function inclineCurl() {
  const base = { view: 'side', root: 'hip', at: [54, 68], torso: 122, th: -10, sh: -90, ua: -92 };
  return {
    view: 'side',
    start: { ...base, fa: -92 },
    end: { ...base, fa: 70 },
    props: [line([56, 71], polar([56, 71], 122, 30), 4), line([54, 71], [64, 71], 4), line([58, 73], [58, 92]), dumbbell()],
    track: 'hand',
    cue: 'Let your arms hang behind you, curl without moving the elbow',
  };
}

function concentrationCurl() {
  const base = { view: 'side', root: 'hip', at: [40, 68], torso: 60, th: 5, sh: -90, ua: -78 };
  return {
    view: 'side',
    start: { ...base, fa: -95 },
    end: { ...base, fa: 95 },
    props: [line([28, 71], [48, 71], 4), line([38, 73], [38, 92]), dumbbell()],
    track: 'hand',
    cue: 'Elbow braced on your thigh, curl to your shoulder',
  };
}

function pushdown() {
  const base = stand({ at: [48, FLOOR], torso: 84, ua: -96 });
  return {
    view: 'side',
    start: { ...base, fa: 40 },
    end: { ...base, fa: -92 },
    props: [...cable([64, 6])],
    track: 'hand',
    cue: 'Elbows pinned to your sides, push down to straight arms',
  };
}

function overheadExtension({ withCable = false }) {
  const base = withCable ? stand({ at: [46, FLOOR], torso: 72, th: -80, sh: -95 }) : stand({ at: [48, FLOOR] });
  return {
    view: 'side',
    start: withCable ? { ...base, ua: 62, fa: 200 } : { ...base, ua: 95, fa: 255 },
    end: withCable ? { ...base, ua: 58, fa: 50 } : { ...base, ua: 95, fa: 90 },
    props: withCable ? [...cable([10, 38])] : [dumbbell()],
    track: 'hand',
    cue: withCable ? 'Facing away from the cable, extend your arms forward and up' : 'Lower the weight behind your head, extend up',
  };
}

function skullCrusher() {
  const base = { view: 'side', root: 'hip', at: [60, 60], torso: 180, th: -35, sh: -95, ua: 100 };
  return {
    view: 'side',
    start: { ...base, fa: 100 },
    end: { ...base, fa: 192 },
    props: [...flatBench(24, 68, 63.5), plate('hand', 5)],
    track: 'hand',
    cue: 'Bend only at the elbows to lower the bar towards your forehead',
  };
}

function benchDip() {
  const base = { view: 'side', root: 'hand', at: [30, 66], torso: 90 };
  return {
    view: 'side',
    start: { ...base, ua: -90, fa: -90, th: -15, sh: -60 },
    end: { ...base, ua: -160, fa: -20, th: 10, sh: -55 },
    props: [line([16, 68], [34, 68], 4), line([20, 70], [20, 92])],
    track: 'shoulder',
    cue: 'Hands behind you on the bench, bend your elbows to lower',
  };
}

function plank({ side = false }) {
  if (side) {
    // Facing the viewer, lying on one side: legs stacked, lower forearm on the floor.
    const base = { view: 'front', root: 'ankleL', at: [12, 88], hipHalf: 1.2, thL: 190, shL: 190, thR: 190, shR: 190, uaR: -90, faR: 0, uaL: -110, faL: -30 };
    return {
      view: 'front',
      start: { ...base, torso: 20 },
      end: { ...base, torso: 20.5 },
      hold: true,
      cue: 'Lift your hips so your body forms a straight line, then hold',
    };
  }
  const pose = { view: 'side', root: 'hand', at: [86, FLOOR], fa: 0, ua: -90, torso: 8, th: 188, sh: 188, foot: -100 };
  return {
    view: 'side',
    start: pose,
    end: { ...pose, torso: 8.5 },
    hold: true,
    cue: 'Hold a straight line from head to heels',
  };
}

function deadBug() {
  const base = { view: 'side', root: 'hip', at: [58, 82], torso: 180, ua2: 90, fa2: 90, th2: 90, sh2: 0 };
  return {
    view: 'side',
    start: { ...base, ua: 90, fa: 90, th: 90, sh: 0 },
    end: { ...base, ua: 170, fa: 172, th: 12, sh: 2 },
    track: 'hand',
    cue: 'Lower one arm and the opposite leg, back pressed down',
  };
}

function hangingRaise({ straight }) {
  const base = { view: 'side', root: 'hand', at: [48, 13], torso: 90, ua: 90, fa: 90 };
  return {
    view: 'side',
    start: { ...base, th: -90, sh: -90 },
    end: straight ? { ...base, th: 5, sh: 5, torso: 98 } : { ...base, th: 15, sh: -75, torso: 96 },
    props: pullUpBar(12),
    track: 'knee',
    cue: straight ? 'Raise straight legs to hip height without swinging' : 'Bring your knees up towards your chest',
  };
}

function cableCrunch() {
  const base = { view: 'side', root: 'knee', at: [46, 89], th: -90, sh: 180, foot: 180 };
  return {
    view: 'side',
    start: { ...base, torso: 90, ua: 100, fa: -60 },
    end: { ...base, torso: 20, ua: 30, fa: -130 },
    props: [...cable([60, 4])],
    track: 'head',
    cue: 'Kneel and crunch down by rounding your spine',
  };
}

function abWheel() {
  const base = { view: 'side', root: 'knee', at: [24, 89], sh: 180, foot: 180 };
  return {
    view: 'side',
    start: { ...base, th: -120, torso: 35, ua: -78, fa: -82 },
    end: { ...base, th: -165, torso: 10, ua: 0, fa: -8 },
    props: [disc({ j: 'hand', d: [0, 2.5] }, 4.5, 'equip')],
    track: 'hand',
    cue: 'Roll out slowly, hips in line, pull back with your abs',
  };
}

function declineSitUp() {
  const arms = (torso) => ({ ua: torso - 150, fa: torso + 30 });
  const base = { view: 'side', root: 'hip', at: [54, 62], th: 30, sh: -60 };
  return {
    view: 'side',
    floor: true,
    start: { ...base, torso: 200, ...arms(200) },
    end: { ...base, torso: 100, ...arms(100) },
    props: [line([84, 52], [18, 74], 4), line([60, 64], [60, 92]), disc({ j: 'hand', d: [1, 0] }, 4.5)],
    track: 'head',
    cue: 'Feet hooked, curl up holding the plate to your chest',
  };
}

function pallofPress() {
  const base = stand({ at: [44, FLOOR], th: -95, sh: -85 });
  return {
    view: 'side',
    start: { ...base, ua: -60, fa: 100 },
    end: { ...base, ua: 0, fa: 0 },
    props: [disc({ j: 'hand', d: [1, 0] }, 2.5, 'equip'), line([88, 40], [88, 92], 2.5), disc([88, 44], 2.5, 'equipDark')],
    track: 'hand',
    cue: 'Cable pulls from the side: press straight out and resist twisting',
  };
}

function farmersCarry() {
  const base = { view: 'side', root: 'hip', torso: 90, ua: -90, fa: -90 };
  return {
    view: 'side',
    start: { ...base, at: [42, 58], th: -60, sh: -100, th2: -115, sh2: -80 },
    end: { ...base, at: [56, 58], th: -115, sh: -80, th2: -60, sh2: -100 },
    props: [kettlebell()],
    track: 'hip',
    cue: 'Stand tall and walk with short, controlled steps',
  };
}

// ---------- Exercise ID → demonstration ----------
// Static mapping (no dynamic paths), so every entry is visible and checked by scripts/check.mjs.
export const DEMOS = {
  // Chest
  'chest-barbell-bench-press': benchPress({ cue: 'Lower the bar to mid-chest, press back up' }),
  'chest-db-bench-press': benchPress({ implement: 'dumbbell', cue: 'Lower the dumbbells to chest level, press up' }),
  'chest-incline-db-press': benchPress({ incline: 35, implement: 'dumbbell', cue: 'On an incline, lower to the upper chest' }),
  'chest-push-up': pushUp(),
  'chest-db-fly': dumbbellFly(),
  'chest-dip': dip({ cue: 'Lean forward slightly, lower until upper arms are parallel' }),
  'chest-incline-barbell-bench': benchPress({ incline: 35, cue: 'Lower the bar to your upper chest, press up' }),
  'chest-weighted-dip': dip({ weighted: true, cue: 'With a dip belt, lower under control and press up' }),
  'chest-cable-crossover': cableCrossover(),
  'chest-paused-bench': benchPress({ cue: 'Lower to the chest, PAUSE 1–2 s, then press' }),
  'chest-machine-press': machineChestPress(),

  // Back
  'back-lat-pulldown': latPulldown(),
  'back-pull-up': pullUp({}),
  'back-barbell-row': bentOverRow({ cue: 'Hinge forward, row the bar to your lower ribs' }),
  'back-seated-cable-row': seatedCableRow(),
  'back-one-arm-db-row': oneArmRow(),
  'back-weighted-pull-up': pullUp({ weighted: true }),
  'back-pendlay-row': bentOverRow({ torso: 10, fromFloor: true, cue: 'Torso near parallel, row from the floor each rep' }),
  'back-t-bar-row': bentOverRow({ torso: 40, implement: 'tbar', cue: 'Straddle the bar, row the handle to your chest' }),
  'back-chest-supported-row': chestSupportedRow(),
  'back-rack-pull': hinge({ variant: 'rack' }),
  'back-straight-arm-pulldown': straightArmPulldown(),

  // Shoulders
  'shoulders-db-press': overheadPress({ seated: true, implement: 'dumbbell', cue: 'Seated, press the dumbbells overhead' }),
  'shoulders-barbell-ohp': overheadPress({ cue: 'Brace, press the bar straight overhead' }),
  'shoulders-lateral-raise': lateralRaise({}),
  'shoulders-rear-delt-fly': rearDeltFly({}),
  'shoulders-face-pull': facePull(),
  'shoulders-cable-lateral-raise': lateralRaise({ cable: true }),
  'shoulders-reverse-pec-deck': rearDeltFly({ machine: true }),
  'shoulders-arnold-press': overheadPress({ seated: true, implement: 'dumbbell', arnold: true, cue: 'Palms facing you, rotate them forward as you press' }),

  // Biceps
  'biceps-barbell-curl': curl({ implement: 'barbell', cue: 'Elbows by your sides, curl the bar up' }),
  'biceps-db-curl': curl({ cue: 'Curl the dumbbells up, upper arms still' }),
  'biceps-hammer-curl': curl({ implement: 'hammer', cue: 'Palms facing in, curl without twisting' }),
  'biceps-incline-db-curl': inclineCurl(),
  'biceps-ez-preacher-curl': preacherCurl(),
  'biceps-cable-curl': curl({ implement: 'barbell', withCable: true, cue: 'Facing a low pulley, curl the bar up' }),
  'biceps-concentration-curl': concentrationCurl(),

  // Triceps
  'triceps-pushdown': pushdown(),
  'triceps-overhead-extension': overheadExtension({}),
  'triceps-close-grip-bench': benchPress({ cue: 'Hands shoulder-width, elbows tucked, press up' }),
  'triceps-bench-dip': benchDip(),
  'triceps-overhead-cable-extension': overheadExtension({ withCable: true }),
  'triceps-skull-crusher': skullCrusher(),
  'triceps-parallel-bar-dip': dip({ upright: true, cue: 'Torso upright, bend your elbows to lower' }),

  // Legs & glutes
  'legs-back-squat': squat({ cue: 'Brace, sit down and back, drive up' }),
  'legs-goblet-squat': squat({ bar: 'goblet', cue: 'Hold the weight at your chest, squat between your knees' }),
  'legs-romanian-deadlift': hinge({ variant: 'rdl' }),
  'legs-leg-press': legPress(),
  'legs-walking-lunge': lunge({ cue: 'Step forward and lower until both knees are bent' }),
  'legs-leg-curl': seatedLeg({ curl: true }),
  'legs-leg-extension': seatedLeg({ curl: false }),
  'legs-calf-raise': calfRaise(),
  'legs-front-squat': squat({ bar: 'front', cue: 'Elbows high, torso upright, squat straight down' }),
  'legs-bulgarian-split-squat': lunge({ split: true, cue: 'Back foot on the bench, lower straight down' }),
  'legs-hack-squat': hackSquat(),
  'legs-hip-thrust': hipThrust(),

  // Core & abs
  'core-plank': plank({}),
  'core-side-plank': plank({ side: true }),
  'core-dead-bug': deadBug(),
  'core-hanging-knee-raise': hangingRaise({ straight: false }),
  'core-cable-crunch': cableCrunch(),
  'core-hanging-leg-raise': hangingRaise({ straight: true }),
  'core-ab-wheel': abWheel(),
  'core-weighted-decline-situp': declineSitUp(),
  'core-pallof-press': pallofPress(),

  // Compound & variations
  'compound-conventional-deadlift': hinge({ variant: 'deadlift' }),
  'compound-sumo-deadlift': sumoDeadlift(),
  'compound-trap-bar-deadlift': trapBarDeadlift(),
  'compound-paused-squat': squat({ cue: 'Squat to depth, PAUSE 2 s, then drive up' }),
  'compound-tempo-bench': benchPress({ cue: 'Lower SLOWLY over 3–4 s, press at normal speed' }),
  'compound-weighted-chin-up': chinUp({ weighted: true }),
  'compound-farmers-carry': farmersCarry(),
};

export function getDemo(exerciseId) {
  return DEMOS[exerciseId] ?? null;
}

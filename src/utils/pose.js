// Stick-figure pose engine for exercise demonstrations. Pure maths, no React — the app renders the
// resulting primitives with Views, and scripts can render the same primitives to an image for review.
//
// Coordinates: a 100 × 100 box, y grows downwards, floor at y = 92.
// Angles in degrees: 0 = forward/right, 90 = up, -90 = down, 180 = back/left. Angles may go beyond
// ±180 so an animation can sweep the correct way round (e.g. -100 → -185 sweeps outward and up).
//
// Side view (figure faces right): torso = hip→shoulder, ua = shoulder→elbow, fa = elbow→hand,
//   th = hip→knee, sh = knee→ankle, foot = ankle→toe. ua2/fa2/th2/sh2/foot2 draw the far-side limbs.
// Front view: same idea with L/R limbs (screen left/right), e.g. uaL, faL, thR, shR.
// Limb scales (uaScale, faScale, …) shorten a limb to show it pointing towards or away from the viewer;
// a negative scale flips it, which lets an arm sweep straight through the body line.

export const FLOOR_Y = 92;

const LENGTH = { torso: 24, neck: 3, headRadius: 4.5, upperArm: 12, forearm: 11, thigh: 16, shin: 16, foot: 5 };
const FRONT = { shoulderHalf: 7, hipHalf: 4.5 };

export const STROKE = {
  torso: 5,
  neck: 3,
  upperArm: 3.6,
  forearm: 3.2,
  thigh: 4.2,
  shin: 3.6,
  foot: 2.6,
};

function dir(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return [Math.cos(radians), -Math.sin(radians)];
}

function step(point, degrees, length) {
  const [dx, dy] = dir(degrees);
  return [point[0] + dx * length, point[1] + dy * length];
}

function pick(value, fallback) {
  return value === undefined ? fallback : value;
}

// ---------- Forward kinematics ----------

function sideJoints(p) {
  const s = (name) => pick(p[`${name}Scale`], 1);
  const torso = pick(p.torso, 90);
  const ua = pick(p.ua, -90);
  const fa = pick(p.fa, -90);
  const th = pick(p.th, -90);
  const sh = pick(p.sh, -90);
  const foot = pick(p.foot, 0);
  const L = LENGTH;

  let hip;
  switch (p.root) {
    case 'ankle': {
      const knee = step(p.at, sh, -L.shin * s('sh'));
      hip = step(knee, th, -L.thigh * s('th'));
      break;
    }
    case 'toe': {
      const ankle = step(p.at, foot, -L.foot);
      const knee = step(ankle, sh, -L.shin * s('sh'));
      hip = step(knee, th, -L.thigh * s('th'));
      break;
    }
    case 'knee':
      hip = step(p.at, th, -L.thigh * s('th'));
      break;
    case 'hand': {
      const elbow = step(p.at, fa, -L.forearm * s('fa'));
      const shoulder = step(elbow, ua, -L.upperArm * s('ua'));
      hip = step(shoulder, torso, -L.torso * s('torso'));
      break;
    }
    case 'shoulder':
      hip = step(p.at, torso, -L.torso * s('torso'));
      break;
    default:
      hip = p.at;
  }

  const shoulder = step(hip, torso, L.torso * s('torso'));
  const headAngle = torso + pick(p.head, 0);
  const joints = {
    hip,
    shoulder,
    neck: step(shoulder, headAngle, L.neck),
    head: step(shoulder, headAngle, L.neck + L.headRadius),
  };
  joints.elbow = step(shoulder, ua, L.upperArm * s('ua'));
  joints.hand = step(joints.elbow, fa, L.forearm * s('fa'));
  joints.knee = step(hip, th, L.thigh * s('th'));
  joints.ankle = step(joints.knee, sh, L.shin * s('sh'));
  joints.toe = step(joints.ankle, foot, L.foot);

  if (p.ua2 !== undefined) {
    joints.elbow2 = step(shoulder, p.ua2, L.upperArm * s('ua2'));
    joints.hand2 = step(joints.elbow2, pick(p.fa2, p.ua2), L.forearm * s('fa2'));
  }
  if (p.th2 !== undefined) {
    joints.knee2 = step(hip, p.th2, L.thigh * s('th2'));
    joints.ankle2 = step(joints.knee2, pick(p.sh2, p.th2), L.shin * s('sh2'));
    joints.toe2 = step(joints.ankle2, pick(p.foot2, foot), L.foot);
  }
  return joints;
}

function frontJoints(p) {
  const s = (name) => pick(p[`${name}Scale`], 1);
  const torso = pick(p.torso, 90);
  const torsoLength = LENGTH.torso * s('torso');
  const across = dir(torso - 90); // shoulder/hip width direction (towards screen right when upright)
  const angle = (name, fallback) => pick(p[name], fallback);
  const L = LENGTH;
  const hipHalf = pick(p.hipHalf, FRONT.hipHalf);
  const shoulderHalf = pick(p.shoulderHalf, FRONT.shoulderHalf);

  let pelvis;
  if (p.root === 'ankleL') {
    const kneeL = step(p.at, angle('shL', -95), -L.shin * s('shL'));
    const hipL = step(kneeL, angle('thL', -95), -L.thigh * s('thL'));
    pelvis = [hipL[0] + across[0] * hipHalf, hipL[1] + across[1] * hipHalf];
  } else if (p.root === 'handL') {
    const elbowL = step(p.at, angle('faL', -95), -L.forearm * s('faL'));
    const shoulderL = step(elbowL, angle('uaL', -95), -L.upperArm * s('uaL'));
    const shoulderC = [shoulderL[0] + across[0] * shoulderHalf, shoulderL[1] + across[1] * shoulderHalf];
    pelvis = step(shoulderC, torso, -torsoLength);
  } else {
    pelvis = p.at;
  }

  const shoulderC = step(pelvis, torso, torsoLength);
  const offset = (point, half, sign) => [point[0] + across[0] * half * sign, point[1] + across[1] * half * sign];
  const joints = {
    pelvis,
    shoulderC,
    shoulderL: offset(shoulderC, shoulderHalf, -1),
    shoulderR: offset(shoulderC, shoulderHalf, 1),
    hipL: offset(pelvis, hipHalf, -1),
    hipR: offset(pelvis, hipHalf, 1),
    neck: step(shoulderC, torso + pick(p.head, 0), L.neck),
    head: step(shoulderC, torso + pick(p.head, 0), L.neck + L.headRadius),
  };
  for (const side of ['L', 'R']) {
    const out = side === 'L' ? -95 : -85;
    joints[`elbow${side}`] = step(joints[`shoulder${side}`], angle(`ua${side}`, out), L.upperArm * s(`ua${side}`));
    joints[`hand${side}`] = step(joints[`elbow${side}`], angle(`fa${side}`, out), L.forearm * s(`fa${side}`));
    joints[`knee${side}`] = step(joints[`hip${side}`], angle(`th${side}`, out), L.thigh * s(`th${side}`));
    joints[`ankle${side}`] = step(joints[`knee${side}`], angle(`sh${side}`, -90), L.shin * s(`sh${side}`));
    joints[`toe${side}`] = step(joints[`ankle${side}`], side === 'L' ? 190 : -10, LENGTH.foot * 0.8);
  }
  return joints;
}

export function computeJoints(pose) {
  return pose.view === 'front' ? frontJoints(pose) : sideJoints(pose);
}

// ---------- Interpolation ----------

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Interpolates every numeric parameter (and [x, y] pairs). Missing values fall back to the other pose.
export function lerpPose(a, b, t) {
  const result = { ...a };
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    // A limb scale set on only one pose means "normal length" (1) on the other.
    const fallback = key.endsWith('Scale') ? 1 : undefined;
    const from = a[key] ?? fallback ?? b[key];
    const to = b[key] ?? fallback ?? a[key];
    if (typeof from === 'number' && typeof to === 'number') result[key] = lerp(from, to, t);
    else if (Array.isArray(from) && Array.isArray(to)) result[key] = from.map((value, i) => lerp(value, to[i], t));
    else result[key] = from;
  }
  return result;
}

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

// ---------- Drawing primitives ----------
// { kind: 'line', a, b, width, color } | { kind: 'circle', c, r, color, fill, width }
// color is a token resolved by the renderer: figure, far, equip, equipDark, ghost, arrow.

function resolvePoint(point, joints) {
  if (Array.isArray(point)) return point;
  if (typeof point === 'string') return joints[point];
  const base = joints[point.j];
  const [dx, dy] = point.d ?? [0, 0];
  return base ? [base[0] + dx, base[1] + dy] : null;
}

function propPrimitives(props, joints) {
  const out = [];
  for (const prop of props ?? []) {
    if (prop.kind === 'line') {
      const a = resolvePoint(prop.from, joints);
      const b = resolvePoint(prop.to, joints);
      if (a && b) out.push({ kind: 'line', a, b, width: prop.width ?? 2, color: prop.color ?? 'equip', front: prop.front });
    } else if (prop.kind === 'circle') {
      const c = resolvePoint(prop.at, joints);
      if (c) out.push({ kind: 'circle', c, r: prop.r, color: prop.color ?? 'equip', fill: prop.fill !== false, width: prop.width ?? 2, front: prop.front });
    }
  }
  return out;
}

function line(a, b, width, color) {
  return { kind: 'line', a, b, width, color };
}

function figurePrimitives(joints, view, color) {
  const j = joints;
  const out = [];
  if (view === 'front') {
    for (const side of ['L', 'R']) {
      out.push(line(j[`hip${side}`], j[`knee${side}`], STROKE.thigh, color));
      out.push(line(j[`knee${side}`], j[`ankle${side}`], STROKE.shin, color));
      out.push(line(j[`ankle${side}`], j[`toe${side}`], STROKE.foot, color));
    }
    out.push(line(j.hipL, j.hipR, STROKE.thigh, color));
    out.push(line(j.pelvis, j.shoulderC, STROKE.torso, color));
    out.push(line(j.shoulderL, j.shoulderR, STROKE.upperArm, color));
    out.push(line(j.shoulderC, j.neck, STROKE.neck, color));
    for (const side of ['L', 'R']) {
      out.push(line(j[`shoulder${side}`], j[`elbow${side}`], STROKE.upperArm, color));
      out.push(line(j[`elbow${side}`], j[`hand${side}`], STROKE.forearm, color));
    }
  } else {
    const far = color === 'figure' ? 'far' : color;
    if (j.knee2) {
      out.push(line(j.hip, j.knee2, STROKE.thigh, far));
      out.push(line(j.knee2, j.ankle2, STROKE.shin, far));
      out.push(line(j.ankle2, j.toe2, STROKE.foot, far));
    }
    if (j.elbow2) {
      out.push(line(j.shoulder, j.elbow2, STROKE.upperArm, far));
      out.push(line(j.elbow2, j.hand2, STROKE.forearm, far));
    }
    out.push(line(j.hip, j.knee, STROKE.thigh, color));
    out.push(line(j.knee, j.ankle, STROKE.shin, color));
    out.push(line(j.ankle, j.toe, STROKE.foot, color));
    out.push(line(j.hip, j.shoulder, STROKE.torso, color));
    out.push(line(j.shoulder, j.neck, STROKE.neck, color));
    out.push(line(j.shoulder, j.elbow, STROKE.upperArm, color));
    out.push(line(j.elbow, j.hand, STROKE.forearm, color));
  }
  out.push({ kind: 'circle', c: j.head, r: LENGTH.headRadius, color, fill: true });
  return out;
}

const FLOOR = { kind: 'line', a: [2, FLOOR_Y + 1], b: [98, FLOOR_Y + 1], width: 1.5, color: 'equipDark' };

// All primitives for one moment of a demo. t = 0 is the start position, 1 the end position.
export function buildFrame(demo, t, { withFloor = true } = {}) {
  const pose = lerpPose(demo.start, demo.end, t);
  const joints = computeJoints(pose);
  const props = propPrimitives(demo.props, joints);
  return [
    ...(withFloor && demo.floor !== false ? [FLOOR] : []),
    ...props.filter((prop) => !prop.front),
    ...figurePrimitives(joints, pose.view, 'figure'),
    ...props.filter((prop) => prop.front),
  ];
}

// Faint copy of the start pose (figure only), used behind the end pose in still images.
export function buildGhost(demo) {
  return figurePrimitives(computeJoints(demo.start), demo.start.view, 'ghost');
}

// Arrow from where the tracked joint starts to where it ends.
export function buildArrow(demo) {
  if (demo.hold || !demo.track) return [];
  const from = computeJoints(demo.start)[demo.track];
  const to = computeJoints(demo.end)[demo.track];
  if (!from || !to) return [];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (length < 4) return [];
  // Offset the arrow sideways so it does not sit on top of the limb.
  const ux = (to[0] - from[0]) / length;
  const uy = (to[1] - from[1]) / length;
  const shift = 6;
  const a = [from[0] - uy * shift, from[1] + ux * shift];
  const b = [to[0] - uy * shift - ux * 2, to[1] + ux * shift - uy * 2];
  const head = 4;
  const left = [b[0] - ux * head - uy * head * 0.7, b[1] - uy * head + ux * head * 0.7];
  const right = [b[0] - ux * head + uy * head * 0.7, b[1] - uy * head - ux * head * 0.7];
  return [line(a, b, 1.8, 'arrow'), line(b, left, 1.8, 'arrow'), line(b, right, 1.8, 'arrow')];
}

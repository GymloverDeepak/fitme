// Writes every exercise demonstration (start ghost + end pose + arrow) as JSON drawing data,
// then scripts/demo-preview.ps1 renders it to a contact-sheet PNG for visual review.
// Run with: npm run demos:preview
import { writeFileSync } from 'node:fs';

import { DEMOS } from '../src/data/exerciseDemos.js';
import { EXERCISES } from '../src/data/workouts.js';
import { buildArrow, buildFrame, buildGhost } from '../src/utils/pose.js';

const only = process.argv[2] ? process.argv[2].split(',') : null;
const items = EXERCISES.filter((exercise) => !only || only.some((prefix) => exercise.id.startsWith(prefix))).map(
  (exercise) => {
    const demo = DEMOS[exercise.id];
    return {
      id: exercise.id,
      name: exercise.name,
      primitives: demo ? [...buildGhost(demo), ...buildFrame(demo, 1), ...buildArrow(demo)] : [],
    };
  },
);
const out = process.argv[3] ?? 'demo-preview.json';
writeFileSync(out, JSON.stringify(items));
console.log(`Wrote ${items.length} demos to ${out}`);

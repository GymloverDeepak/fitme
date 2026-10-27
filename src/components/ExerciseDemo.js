import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';

import { getDemo } from '../data/exerciseDemos';
import { colors, layout, radius, spacing, typography } from '../theme';
import { buildArrow, buildFrame, buildGhost, easeInOut } from '../utils/pose';

// Colour tokens used by pose primitives.
const TOKENS = {
  figure: colors.accent,
  far: colors.accentMuted,
  ghost: colors.ghost,
  equip: colors.metal,
  equipDark: colors.metalDark,
  arrow: colors.textPrimary,
};

// Draws pose primitives (lines and circles in a 100 × 100 box) with plain Views.
function PoseCanvas({ primitives, size }) {
  const scale = size / 100;
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {primitives.map((prim, index) => {
        const color = TOKENS[prim.color] ?? colors.accent;
        if (prim.kind === 'line') {
          const [x1, y1] = prim.a;
          const [x2, y2] = prim.b;
          const length = Math.hypot(x2 - x1, y2 - y1) * scale;
          const width = Math.max(1, prim.width * scale);
          if (length < 0.5) return null;
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: ((x1 + x2) / 2) * scale - length / 2,
                top: ((y1 + y2) / 2) * scale - width / 2,
                width: length,
                height: width,
                borderRadius: width / 2,
                backgroundColor: color,
                transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }],
              }}
            />
          );
        }
        const r = prim.r * scale;
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: prim.c[0] * scale - r,
              top: prim.c[1] * scale - r,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              ...(prim.fill === false
                ? { borderWidth: Math.max(1, prim.width * scale), borderColor: color }
                : { backgroundColor: color }),
            }}
          />
        );
      })}
    </View>
  );
}

// Shown when an exercise has no demonstration — never a broken image.
function Placeholder({ name, size }) {
  return (
    <View style={[styles.placeholder, { width: size, height: size }]} accessibilityLabel={`No demonstration for ${name}`}>
      <Ionicons name="barbell-outline" size={Math.max(18, size * 0.3)} color={colors.textSecondary} />
      {size >= 120 ? <Text style={styles.placeholderText}>Follow the steps below</Text> : null}
    </View>
  );
}

// Still image: faint start position, solid end position and a movement arrow.
export const ExerciseThumbnail = memo(function ExerciseThumbnail({ exerciseId, name = 'exercise', size = 56 }) {
  const demo = getDemo(exerciseId);
  if (!demo) return <Placeholder name={name} size={size} />;
  return (
    <View style={[styles.frame, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel={`${name} demonstration`}>
      <PoseCanvas primitives={[...buildGhost(demo), ...buildFrame(demo, 1), ...buildArrow(demo)]} size={size} />
    </View>
  );
});

const FORWARD_MS = 1300;
const HOLD_MS = 450;
const CYCLE_MS = 2 * (FORWARD_MS + HOLD_MS);
const FRAME_MS = 33; // ~30 fps is plenty for a demonstration

// Position (0 = start, 1 = end) at a point in the loop: move, hold, move back, hold.
function cycleProgress(elapsed) {
  const t = elapsed % CYCLE_MS;
  if (t < FORWARD_MS) return easeInOut(t / FORWARD_MS);
  if (t < FORWARD_MS + HOLD_MS) return 1;
  if (t < 2 * FORWARD_MS + HOLD_MS) return 1 - easeInOut((t - FORWARD_MS - HOLD_MS) / FORWARD_MS);
  return 0;
}

// Large looping demonstration with a genuine play/pause control and start/end stills.
// The animation only runs while this component is on screen; it is stopped on unmount.
export default function ExerciseDemo({ exerciseId, name = 'exercise', size = 280 }) {
  const demo = getDemo(exerciseId);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);

  // Respect the system "remove animations" / reduce-motion setting: start paused.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (!cancelled && reduce) setPlaying(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!playing || !demo || demo.hold) return undefined;
    let frameId = null;
    let last = null;
    let sinceRender = 0;
    const loop = (now) => {
      if (last !== null) {
        const delta = Math.min(100, now - last);
        elapsedRef.current += delta;
        sinceRender += delta;
        if (sinceRender >= FRAME_MS) {
          sinceRender = 0;
          setProgress(cycleProgress(elapsedRef.current));
        }
      }
      last = now;
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [playing, demo]);

  if (!demo) {
    return (
      <View style={styles.wrapper}>
        <Placeholder name={name} size={size} />
      </View>
    );
  }

  const stillSize = Math.round((size - spacing.md) / 2.6);

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.frame, styles.large, { width: size, height: size }]}
        accessibilityRole="image"
        accessibilityLabel={`${name} demonstration. ${demo.cue ?? ''}`}
      >
        <PoseCanvas primitives={[...buildFrame(demo, demo.hold ? 1 : progress), ...(playing ? [] : buildArrow(demo))]} size={size} />
        {demo.hold ? (
          <View style={styles.holdBadge}>
            <Ionicons name="timer-outline" size={14} color={colors.onAccent} />
            <Text style={styles.holdText}>Hold</Text>
          </View>
        ) : null}
      </View>

      {demo.cue ? <Text style={styles.cue}>{demo.cue}</Text> : null}

      {demo.hold ? null : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause demonstration' : 'Play demonstration'}
            onPress={() => setPlaying((value) => !value)}
            style={({ pressed }) => [styles.playButton, pressed && styles.playPressed]}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.accent} />
            <Text style={styles.playText}>{playing ? 'Pause' : 'Play'}</Text>
          </Pressable>
          <View style={styles.stills}>
            <Still label="1  Start" primitives={buildFrame(demo, 0)} size={stillSize} />
            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
            <Still label="2  End" primitives={buildFrame(demo, 1)} size={stillSize} />
          </View>
        </>
      )}
      <Text style={styles.note}>Original illustration · works offline</Text>
    </View>
  );
}

function Still({ label, primitives, size }) {
  return (
    <View style={styles.still}>
      <View style={[styles.frame, { width: size, height: size }]}>
        <PoseCanvas primitives={primitives} size={size} />
      </View>
      <Text style={styles.stillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  frame: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  large: {
    borderRadius: radius.lg,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    ...typography.caption,
  },
  holdBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  holdText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.onAccent,
  },
  cue: {
    ...typography.bodyStrong,
    textAlign: 'center',
  },
  playButton: {
    minHeight: layout.minTouchTarget,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  playPressed: {
    backgroundColor: colors.accentSoft,
  },
  playText: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  stills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  still: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stillLabel: {
    ...typography.label,
  },
  note: {
    ...typography.caption,
    fontSize: 11,
  },
});

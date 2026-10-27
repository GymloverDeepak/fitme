import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import useCountdown from '../hooks/useCountdown';
import { colors, spacing, typography } from '../theme';
import { formatTimer } from '../utils/date';
import ChipGroup from './ChipGroup';
import FitnessCard from './FitnessCard';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import SecondaryButton from './SecondaryButton';

const PRESETS = [60, 90, 120, 180];

const STATUS_TEXT = {
  idle: 'Ready',
  running: 'Resting…',
  paused: 'Paused',
  finished: 'Rest complete — start your next set.',
};

// Rest timer with start / pause / reset. suggestedSeconds comes from the next exercise.
// Once started, the duration is locked until Reset or a new preset is chosen, so ticking off an
// exercise mid-rest does not reset it. Changing the duration remounts the countdown (via `key`).
export default function RestTimer({ suggestedSeconds = 90, suggestionLabel }) {
  const [chosenSeconds, setChosenSeconds] = useState(null);
  const [lockedSeconds, setLockedSeconds] = useState(null);
  const seconds = lockedSeconds ?? chosenSeconds ?? suggestedSeconds;

  const options = [...new Set([suggestedSeconds, ...PRESETS])]
    .sort((a, b) => a - b)
    .map((value) => ({ id: String(value), name: formatTimer(value) }));

  return (
    <FitnessCard>
      <Text style={styles.label}>Rest timer</Text>
      {suggestionLabel ? <Text style={styles.caption}>{suggestionLabel}</Text> : null}
      <Countdown
        key={seconds}
        seconds={seconds}
        onLock={() => setLockedSeconds(seconds)}
        onUnlock={() => setLockedSeconds(null)}
      />
      <ChipGroup
        options={options}
        selectedId={String(seconds)}
        onSelect={(id) => {
          setChosenSeconds(Number(id));
          setLockedSeconds(null);
        }}
        accessibilityLabel="Rest duration"
      />
    </FitnessCard>
  );
}

function Countdown({ seconds, onLock, onUnlock }) {
  const timer = useCountdown(seconds);

  const handleStart = () => {
    onLock();
    timer.start();
  };

  const handleReset = () => {
    timer.reset();
    onUnlock();
  };

  return (
    <View style={styles.countdown}>
      <Text
        style={[styles.time, timer.status === 'finished' && styles.timeDone]}
        accessibilityRole="timer"
        accessibilityLabel={`${timer.remainingSeconds} seconds remaining`}
      >
        {formatTimer(timer.remainingSeconds)}
      </Text>
      <ProgressBar
        progress={timer.progress}
        tone={timer.status === 'finished' ? 'success' : 'accent'}
        accessibilityLabel="Rest time elapsed"
      />
      <Text style={[styles.status, timer.status === 'finished' && styles.statusDone]} accessibilityLiveRegion="polite">
        {STATUS_TEXT[timer.status]}
      </Text>
      <View style={styles.buttons}>
        {timer.status === 'running' ? (
          <PrimaryButton title="Pause" icon="pause" onPress={timer.pause} accessibilityLabel="Pause rest timer" style={styles.button} />
        ) : (
          <PrimaryButton
            title={timer.status === 'paused' ? 'Resume' : timer.status === 'finished' ? 'Again' : 'Start'}
            icon="play"
            onPress={handleStart}
            accessibilityLabel={timer.status === 'paused' ? 'Resume rest timer' : 'Start rest timer'}
            style={styles.button}
          />
        )}
        <SecondaryButton
          title="Reset"
          icon="refresh"
          onPress={handleReset}
          accessibilityLabel="Reset rest timer"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
  },
  caption: {
    ...typography.caption,
    marginTop: -spacing.sm,
  },
  countdown: {
    gap: spacing.md,
  },
  time: {
    ...typography.metric,
    fontSize: 56,
    lineHeight: 64,
    textAlign: 'center',
  },
  timeDone: {
    color: colors.success,
  },
  status: {
    ...typography.caption,
    textAlign: 'center',
  },
  statusDone: {
    ...typography.bodyStrong,
    color: colors.success,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});

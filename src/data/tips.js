// Motivation lines and general fitness tips shown on the Home screen.

export const MOTIVATION_QUOTES = [
  'Strength is built one rep, one meal and one good night’s sleep at a time.',
  'You do not need a perfect day. You need to show up for today.',
  'Progress is quiet. Keep stacking the small wins.',
  'Train with intent, recover with discipline.',
  'The weight does not care how you feel. Show up anyway — then rest well.',
  'Consistency beats intensity when intensity cannot be repeated.',
  'Every session you finish is a vote for the person you are becoming.',
];

export const FITNESS_TIPS = [
  'Log your sets so you can try to beat last week by one rep or a small amount of weight.',
  'Drink water through the day, not all at once. Pale-yellow urine is a simple hydration check.',
  'Include a protein source in each meal — dal, paneer, curd, eggs or chicken all count.',
  'Warm up before heavy lifts: a few light sets prepare your joints and improve form.',
  'Walking 7,000–10,000 steps a day helps recovery and overall health.',
  'Keep a rest day as a real rest day. Recovery is when muscles adapt.',
  'Film a set now and then to check your form from the side.',
  'Sleep is a performance tool. A regular bedtime helps more than any supplement.',
];

// Picks a stable item for the given 'YYYY-MM-DD' date so it changes once a day.
export function getDailyItem(list, dateKey, offset = 0) {
  if (!Array.isArray(list) || list.length === 0) return '';
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  const index = Number.isFinite(dayNumber) ? dayNumber + offset : offset;
  return list[((index % list.length) + list.length) % list.length];
}

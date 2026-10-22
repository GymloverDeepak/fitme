// Static sample Indian diet plans for FITME.
// Nutrition values are rounded estimates for plain ingredients, based on typical values in standard
// food-composition data (e.g. USDA FoodData Central and ICMR-NIN Indian Food Composition Tables).
// Real values vary with brand, recipe, cooking oil and portion size.

export const DIET_GOALS = [
  { id: 'muscleGain', name: 'Muscle gain' },
  { id: 'fatLoss', name: 'Fat loss' },
  { id: 'generalFitness', name: 'General fitness' },
];

export const DIET_PREFERENCES = [
  { id: 'veg', name: 'Vegetarian' },
  { id: 'nonVeg', name: 'Non-vegetarian' },
];

export const MEAL_CATEGORIES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'eveningSnack', name: 'Evening snack' },
  { id: 'dinner', name: 'Dinner' },
];

export const DEFAULT_DIET_GOAL = 'generalFitness';
export const DEFAULT_DIET_PREFERENCE = 'veg';

// Per-serving estimates. calories/protein are null where the value depends too much on the recipe.
export const FOODS = {
  oats: { name: 'Rolled oats', serving: '40 g dry', calories: 150, protein: 5 },
  milk: { name: 'Toned milk', serving: '250 ml glass', calories: 145, protein: 8 },
  banana: { name: 'Banana', serving: '1 medium', calories: 105, protein: 1 },
  apple: { name: 'Apple', serving: '1 medium', calories: 95, protein: 0 },
  roti: { name: 'Whole-wheat roti (no ghee)', serving: '1 roti, about 40 g', calories: 120, protein: 4 },
  rice: { name: 'Cooked white rice', serving: '1 cup, about 160 g', calories: 205, protein: 4 },
  dal: { name: 'Thick cooked dal (toor/moong)', serving: '1 katori, about 150 g', calories: 175, protein: 13 },
  rajma: { name: 'Cooked rajma (kidney beans)', serving: '1 katori, about 150 g', calories: 190, protein: 13 },
  paneer: { name: 'Paneer', serving: '100 g', calories: 265, protein: 18 },
  curd: { name: 'Plain curd (dahi)', serving: '1 cup, about 200 g', calories: 120, protein: 7 },
  egg: { name: 'Whole egg, boiled', serving: '1 large egg', calories: 72, protein: 6 },
  eggWhite: { name: 'Egg white', serving: '1 large egg white', calories: 17, protein: 4 },
  chicken: { name: 'Chicken breast, cooked, skinless', serving: '100 g cooked', calories: 165, protein: 31 },
  roastedChana: { name: 'Roasted chana', serving: '30 g handful', calories: 110, protein: 6 },
  peanuts: { name: 'Roasted peanuts', serving: '20 g handful', calories: 115, protein: 5 },
  sprouts: { name: 'Moong sprouts', serving: '1 cup, about 100 g', calories: 30, protein: 3 },
  soyaChunks: { name: 'Soya chunks', serving: '30 g dry', calories: 105, protein: 15 },
  sabzi: { name: 'Mixed vegetable sabzi', serving: '1 katori', calories: null, protein: null },
  salad: { name: 'Cucumber, tomato and onion salad', serving: '1 bowl', calories: null, protein: null },
};

// servings multiplies the per-serving estimate; portion is the human-readable amount.
function item(foodId, servings, portion) {
  return { foodId, servings, portion };
}

export const MEALS = [
  // ---------- General fitness · Vegetarian ----------
  {
    id: 'generalFitness-veg-breakfast',
    goal: 'generalFitness',
    preference: 'veg',
    category: 'breakfast',
    name: 'Banana oats with milk',
    description: 'A simple, filling breakfast with slow-digesting carbs.',
    items: [item('oats', 1, '40 g dry oats'), item('milk', 1, '250 ml toned milk'), item('banana', 1, '1 medium banana')],
    tips: 'Cook the oats in the milk, then slice the banana on top. Add cinnamon instead of sugar.',
    affordableSwap: 'Swap oats for 40 g dry poha or dalia (broken wheat) if cheaper locally.',
  },
  {
    id: 'generalFitness-veg-lunch',
    goal: 'generalFitness',
    preference: 'veg',
    category: 'lunch',
    name: 'Roti, dal, sabzi and curd',
    description: 'A balanced home-style thali.',
    items: [
      item('roti', 2, '2 rotis'),
      item('dal', 1, '1 katori dal'),
      item('sabzi', 1, '1 katori seasonal sabzi'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Fill half the plate with vegetables. Use about 1 teaspoon of oil for the sabzi.',
    affordableSwap: 'Any seasonal vegetable works — lauki, tinda, cabbage and beans are usually inexpensive.',
  },
  {
    id: 'generalFitness-veg-eveningSnack',
    goal: 'generalFitness',
    preference: 'veg',
    category: 'eveningSnack',
    name: 'Roasted chana, peanuts and an apple',
    description: 'A crunchy snack with protein and fibre.',
    items: [item('roastedChana', 1, '30 g roasted chana'), item('peanuts', 1, '20 g roasted peanuts'), item('apple', 1, '1 apple')],
    tips: 'Pre-portion the chana and peanuts into small boxes so it stays a snack, not a meal.',
    affordableSwap: 'Replace the apple with any seasonal fruit such as guava or orange.',
  },
  {
    id: 'generalFitness-veg-dinner',
    goal: 'generalFitness',
    preference: 'veg',
    category: 'dinner',
    name: 'Rajma chawal with salad',
    description: 'A comforting dinner pairing beans and rice for a complete protein.',
    items: [
      item('rice', 1, '1 cup cooked rice'),
      item('rajma', 1, '1 katori rajma'),
      item('roti', 1, '1 roti'),
      item('salad', 1, '1 bowl salad'),
    ],
    tips: 'Soak rajma overnight and pressure-cook well for better digestion.',
    affordableSwap: 'Use chole (chickpeas) or lobia (black-eyed peas) instead of rajma.',
  },

  // ---------- General fitness · Non-vegetarian ----------
  {
    id: 'generalFitness-nonVeg-breakfast',
    goal: 'generalFitness',
    preference: 'nonVeg',
    category: 'breakfast',
    name: 'Oats with milk and boiled eggs',
    description: 'Carbs and protein to start the day.',
    items: [item('oats', 1, '40 g dry oats'), item('milk', 1, '250 ml toned milk'), item('egg', 2, '2 boiled eggs')],
    tips: 'Boil a batch of eggs for the week and keep them refrigerated.',
    affordableSwap: 'Eggs are one of the cheapest complete proteins — no swap needed.',
  },
  {
    id: 'generalFitness-nonVeg-lunch',
    goal: 'generalFitness',
    preference: 'nonVeg',
    category: 'lunch',
    name: 'Chicken, rice, sabzi and curd',
    description: 'A protein-forward lunch with familiar flavours.',
    items: [
      item('rice', 1, '1 cup cooked rice'),
      item('chicken', 1, '100 g cooked chicken'),
      item('sabzi', 1, '1 katori sabzi'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Cook the chicken as a light curry or dry roast with minimal oil.',
    affordableSwap: 'Use 2–3 eggs as egg curry instead of chicken.',
  },
  {
    id: 'generalFitness-nonVeg-eveningSnack',
    goal: 'generalFitness',
    preference: 'nonVeg',
    category: 'eveningSnack',
    name: 'Banana with roasted chana and peanuts',
    description: 'Quick energy before or after training.',
    items: [item('banana', 1, '1 banana'), item('roastedChana', 1, '30 g roasted chana'), item('peanuts', 1, '20 g peanuts')],
    tips: 'Eat this 60–90 minutes before an evening workout.',
    affordableSwap: 'Roasted chana is usually cheaper than packaged protein snacks.',
  },
  {
    id: 'generalFitness-nonVeg-dinner',
    goal: 'generalFitness',
    preference: 'nonVeg',
    category: 'dinner',
    name: 'Roti, dal and sabzi',
    description: 'A light, balanced dinner.',
    items: [item('roti', 2, '2 rotis'), item('dal', 1, '1 katori dal'), item('sabzi', 1, '1 katori sabzi')],
    tips: 'Finish dinner 2–3 hours before bed if you can.',
    affordableSwap: 'Moong dal is light and usually affordable.',
  },

  // ---------- Muscle gain · Vegetarian ----------
  {
    id: 'muscleGain-veg-breakfast',
    goal: 'muscleGain',
    preference: 'veg',
    category: 'breakfast',
    name: 'Peanut banana oats',
    description: 'A larger breakfast with extra energy for training.',
    items: [
      item('oats', 2, '80 g dry oats'),
      item('milk', 1, '250 ml toned milk'),
      item('banana', 1, '1 banana'),
      item('peanuts', 1, '20 g peanuts'),
    ],
    tips: 'Crush the peanuts and stir them in at the end for texture.',
    affordableSwap: 'Use dalia instead of oats.',
  },
  {
    id: 'muscleGain-veg-lunch',
    goal: 'muscleGain',
    preference: 'veg',
    category: 'lunch',
    name: 'Paneer sabzi with roti, dal and curd',
    description: 'A high-protein vegetarian lunch.',
    items: [
      item('roti', 3, '3 rotis'),
      item('paneer', 1, '100 g paneer'),
      item('dal', 1, '1 katori dal'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Make paneer bhurji or a light paneer-capsicum sabzi with 1–2 teaspoons of oil.',
    affordableSwap: 'Replace paneer with 30 g dry soya chunks cooked as a curry.',
  },
  {
    id: 'muscleGain-veg-eveningSnack',
    goal: 'muscleGain',
    preference: 'veg',
    category: 'eveningSnack',
    name: 'Soya chunks chaat with milk and banana',
    description: 'A protein-rich snack around training time.',
    items: [item('soyaChunks', 1, '30 g dry soya chunks'), item('banana', 1, '1 banana'), item('milk', 1, '250 ml toned milk')],
    tips: 'Boil soya chunks, squeeze out water, then toss with onion, tomato, lemon and chaat masala.',
    affordableSwap: 'Soya chunks are among the most affordable vegetarian protein sources.',
  },
  {
    id: 'muscleGain-veg-dinner',
    goal: 'muscleGain',
    preference: 'veg',
    category: 'dinner',
    name: 'Rajma, rice and roti',
    description: 'A carb-rich dinner to refuel after training.',
    items: [
      item('rice', 1, '1 cup cooked rice'),
      item('rajma', 1, '1 katori rajma'),
      item('roti', 2, '2 rotis'),
      item('salad', 1, '1 bowl salad'),
    ],
    tips: 'Add a squeeze of lemon to the salad to improve iron absorption from the beans.',
    affordableSwap: 'Use chole or mixed dal instead of rajma.',
  },

  // ---------- Muscle gain · Non-vegetarian ----------
  {
    id: 'muscleGain-nonVeg-breakfast',
    goal: 'muscleGain',
    preference: 'nonVeg',
    category: 'breakfast',
    name: 'Oats, milk, banana and eggs',
    description: 'A large protein and carb breakfast.',
    items: [
      item('oats', 2, '80 g dry oats'),
      item('milk', 1, '250 ml toned milk'),
      item('banana', 1, '1 banana'),
      item('egg', 2, '2 boiled eggs'),
    ],
    tips: 'Eggs can be boiled, poached or made as a bhurji with little oil.',
    affordableSwap: 'Use dalia or poha instead of oats.',
  },
  {
    id: 'muscleGain-nonVeg-lunch',
    goal: 'muscleGain',
    preference: 'nonVeg',
    category: 'lunch',
    name: 'Chicken with rice, roti and curd',
    description: 'A high-protein, high-energy lunch.',
    items: [
      item('rice', 1, '1 cup cooked rice'),
      item('roti', 2, '2 rotis'),
      item('chicken', 1.5, '150 g cooked chicken'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Batch-cook chicken for two to three days and store it in the fridge.',
    affordableSwap: 'Replace part of the chicken with 2 eggs.',
  },
  {
    id: 'muscleGain-nonVeg-eveningSnack',
    goal: 'muscleGain',
    preference: 'nonVeg',
    category: 'eveningSnack',
    name: 'Milk with roasted chana and peanuts',
    description: 'An easy snack that travels well.',
    items: [item('milk', 1, '250 ml toned milk'), item('roastedChana', 1, '30 g roasted chana'), item('peanuts', 1, '20 g peanuts')],
    tips: 'Carry the chana and peanuts in a small box to the gym.',
    affordableSwap: 'Roasted chana is an affordable alternative to protein bars.',
  },
  {
    id: 'muscleGain-nonVeg-dinner',
    goal: 'muscleGain',
    preference: 'nonVeg',
    category: 'dinner',
    name: 'Egg bhurji with roti and dal',
    description: 'A protein-rich dinner with familiar flavours.',
    items: [
      item('roti', 3, '3 rotis'),
      item('egg', 2, '2-egg bhurji'),
      item('dal', 1, '1 katori dal'),
      item('sabzi', 1, '1 katori sabzi'),
    ],
    tips: 'Add onions, tomatoes and capsicum to the bhurji for extra vegetables.',
    affordableSwap: 'Eggs are already one of the most affordable protein options.',
  },

  // ---------- Fat loss · Vegetarian ----------
  {
    id: 'fatLoss-veg-breakfast',
    goal: 'fatLoss',
    preference: 'veg',
    category: 'breakfast',
    name: 'Oats with milk and banana',
    description: 'A filling breakfast that keeps you full until lunch.',
    items: [item('oats', 1, '40 g dry oats'), item('milk', 1, '250 ml toned milk'), item('banana', 1, '1 small–medium banana')],
    tips: 'Skip added sugar. Cinnamon or a few raisins add sweetness.',
    affordableSwap: 'Use dalia or vegetable poha instead of oats.',
  },
  {
    id: 'fatLoss-veg-lunch',
    goal: 'fatLoss',
    preference: 'veg',
    category: 'lunch',
    name: 'Roti, dal, sabzi and curd',
    description: 'A balanced lunch with plenty of vegetables.',
    items: [
      item('roti', 2, '2 rotis'),
      item('dal', 1, '1 katori dal'),
      item('sabzi', 1, '1 katori sabzi'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Start with the sabzi and salad, then the roti and dal. Measure cooking oil with a spoon.',
    affordableSwap: 'Seasonal vegetables are usually the best value.',
  },
  {
    id: 'fatLoss-veg-eveningSnack',
    goal: 'fatLoss',
    preference: 'veg',
    category: 'eveningSnack',
    name: 'Sprouts chaat with roasted chana',
    description: 'High-fibre, high-volume snack.',
    items: [item('sprouts', 1, '1 cup moong sprouts'), item('roastedChana', 1, '30 g roasted chana')],
    tips: 'Add onion, tomato, cucumber, lemon and chaat masala.',
    affordableSwap: 'Sprout moong at home — it costs much less than ready-made.',
  },
  {
    id: 'fatLoss-veg-dinner',
    goal: 'fatLoss',
    preference: 'veg',
    category: 'dinner',
    name: 'Paneer sabzi with roti',
    description: 'A lighter, protein-focused dinner.',
    items: [item('paneer', 0.75, '75 g paneer'), item('roti', 2, '2 rotis'), item('sabzi', 1, '1 katori sabzi')],
    tips: 'Low-fat paneer has fewer calories than the estimate shown here.',
    affordableSwap: 'Use 30 g dry soya chunks or a katori of dal instead of paneer.',
  },

  // ---------- Fat loss · Non-vegetarian ----------
  {
    id: 'fatLoss-nonVeg-breakfast',
    goal: 'fatLoss',
    preference: 'nonVeg',
    category: 'breakfast',
    name: 'Eggs with roti and fruit',
    description: 'A protein-first breakfast.',
    items: [
      item('egg', 2, '2 whole eggs'),
      item('eggWhite', 2, '2 extra egg whites'),
      item('roti', 1, '1 roti'),
      item('apple', 1, '1 apple'),
    ],
    tips: 'Make an omelette with onion, tomato and spinach using a little oil.',
    affordableSwap: 'Use any seasonal fruit instead of an apple.',
  },
  {
    id: 'fatLoss-nonVeg-lunch',
    goal: 'fatLoss',
    preference: 'nonVeg',
    category: 'lunch',
    name: 'Chicken with roti, salad and curd',
    description: 'A high-protein lunch that keeps you full.',
    items: [
      item('roti', 2, '2 rotis'),
      item('chicken', 1, '100 g cooked chicken'),
      item('salad', 1, '1 bowl salad'),
      item('curd', 1, '1 cup curd'),
    ],
    tips: 'Grilled, tandoori-style or a light curry all work well.',
    affordableSwap: 'Use 3 eggs as egg curry instead of chicken.',
  },
  {
    id: 'fatLoss-nonVeg-eveningSnack',
    goal: 'fatLoss',
    preference: 'nonVeg',
    category: 'eveningSnack',
    name: 'Milk with sprouts and roasted chana',
    description: 'A light snack with protein and fibre.',
    items: [item('milk', 1, '250 ml toned milk'), item('sprouts', 1, '1 cup sprouts'), item('roastedChana', 1, '30 g roasted chana')],
    tips: 'Have it plain or as a spiced chaat.',
    affordableSwap: 'Swap milk for a cup of curd or buttermilk.',
  },
  {
    id: 'fatLoss-nonVeg-dinner',
    goal: 'fatLoss',
    preference: 'nonVeg',
    category: 'dinner',
    name: 'Dal, rice and sabzi',
    description: 'A light, easy-to-digest dinner.',
    items: [item('rice', 1, '1 cup cooked rice'), item('dal', 1, '1 katori dal'), item('sabzi', 1, '1 katori sabzi')],
    tips: 'Use a smaller bowl for rice and add more sabzi if you are still hungry.',
    affordableSwap: 'Any dal works — choose what is cheapest this week.',
  },
];

export const HYDRATION_GUIDANCE = [
  'Most adults do well with roughly 2–3 litres of fluid a day. Needs rise in hot weather and on training days.',
  'Sip water through the day instead of drinking a lot at once.',
  'Drink 400–600 ml in the couple of hours before a workout, and sip during it.',
  'Pale-yellow urine is a simple sign that you are drinking enough.',
  'Buttermilk, lemon water and coconut water also count. Limit sugary drinks.',
];

export const NUTRITION_GUIDANCE = [
  'Build each plate around a protein source, a whole grain or roti, and plenty of vegetables.',
  'Spread protein across the day — dal, paneer, curd, sprouts, eggs and chicken are all good options.',
  'Choose whole fruits over juices for more fibre.',
  'Measure cooking oil and ghee — each teaspoon adds roughly 40–45 kcal.',
  'Change body weight slowly. Very low-calorie diets are not recommended without professional supervision.',
];

export const DIET_DISCLAIMER =
  'Sample plans for general guidance only. They are not personalised and do not guarantee weight or muscle changes. ' +
  'If you have a medical condition, are pregnant or have specific needs, consult a doctor or registered dietitian.';

export const NUTRITION_ESTIMATE_NOTE =
  'Calorie and protein figures are rounded estimates for plain ingredients. Actual values vary with ingredients, ' +
  'brands, recipes and serving sizes. Totals exclude cooking oil and items marked “varies”.';

export function getFoodById(foodId) {
  return FOODS[foodId] ?? null;
}

export function getMealById(mealId) {
  return MEALS.find((meal) => meal.id === mealId) ?? null;
}

export function getMealCategoryName(categoryId) {
  return MEAL_CATEGORIES.find((category) => category.id === categoryId)?.name ?? 'Meal';
}

export function getMealsFor(goal, preference) {
  return MEAL_CATEGORIES.map((category) =>
    MEALS.find((meal) => meal.goal === goal && meal.preference === preference && meal.category === category.id),
  ).filter(Boolean);
}

// Sums estimates for items that have data. unestimatedCount tells the UI how many items were left out.
export function getMealNutrition(meal) {
  let calories = 0;
  let protein = 0;
  let unestimatedCount = 0;
  for (const mealItem of meal?.items ?? []) {
    const food = getFoodById(mealItem.foodId);
    if (!food || food.calories == null || food.protein == null) {
      unestimatedCount += 1;
      continue;
    }
    calories += food.calories * mealItem.servings;
    protein += food.protein * mealItem.servings;
  }
  return { calories: Math.round(calories), protein: Math.round(protein), unestimatedCount };
}

export function getDayNutrition(meals) {
  return meals.reduce(
    (total, meal) => {
      const nutrition = getMealNutrition(meal);
      return {
        calories: total.calories + nutrition.calories,
        protein: total.protein + nutrition.protein,
        unestimatedCount: total.unestimatedCount + nutrition.unestimatedCount,
      };
    },
    { calories: 0, protein: 0, unestimatedCount: 0 },
  );
}

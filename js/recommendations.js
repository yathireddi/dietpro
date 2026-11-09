/**
 * NutriTrack - Nutrition Recommendation Engine (recommendations.html)
 * Rule-based dietary recommendations synthesizing profile metrics and food logs.
 */

function initRecommendationsPage() {
  if (!AuthService.protectRoute(true)) return;

  const user = StorageService.getCurrentUser();
  if (!user) return;

  generateRecommendations(user);
}

function generateRecommendations(user) {
  const todayStr = StorageService.formatLocalDate(new Date());
  const todayMeals = StorageService.getUserMeals(user.userId, todayStr);
  const dayTotals = StorageService.calculateDayTotals(todayMeals);

  // Targets
  const calorieTarget = StorageService.calculateDailyCalorieTarget(user);
  const macroTargets = StorageService.calculateMacroTargets(calorieTarget, user.fitnessGoal);
  const bmiInfo = StorageService.calculateBMI(user.weight, user.height);

  // Categories consumed
  const categoriesLogged = new Set(todayMeals.map(m => (m.category || '').toLowerCase()));
  const hasVegetables = categoriesLogged.has('vegetables');
  const hasFruits = categoriesLogged.has('fruits');
  const hasProteinSource = categoriesLogged.has('protein') || categoriesLogged.has('dairy');

  // Ratios
  const proteinRatio = macroTargets.protein > 0 ? (dayTotals.protein / macroTargets.protein) : 1;
  const calorieRatio = calorieTarget > 0 ? (dayTotals.calories / calorieTarget) : 1;

  // 1. Compute Overall Nutritional Balance Score (0 - 100)
  let score = 70;
  if (dayTotals.calories > 0) {
    // Calorie closeness (+- 15% gets full 30 pts)
    const calDiffPct = Math.abs(calorieRatio - 1);
    if (calDiffPct <= 0.15) score += 15;
    else if (calDiffPct > 0.3) score -= 10;

    // Protein adequacy (+10 pts)
    if (proteinRatio >= 0.8) score += 10;
    else if (proteinRatio < 0.5) score -= 10;

    // Category diversity (+5 each)
    if (hasVegetables) score += 5;
    if (hasFruits) score += 5;
    if (dayTotals.fiber >= 15) score += 5;
  }
  score = Math.max(30, Math.min(98, score));

  // Render Health Score Banner
  renderHealthScoreBanner(score, user, bmiInfo, calorieTarget, dayTotals);

  // 2. Rule-Based Actionable Recommendations
  renderPriorityRecommendations(user, calorieTarget, macroTargets, dayTotals, {
    hasVegetables,
    hasFruits,
    hasProteinSource,
    proteinRatio,
    calorieRatio
  });

  // 3. Foods to Include vs Moderate
  renderFoodsComparison(user);

  // 4. Sample Balanced Meal Plan
  renderSampleMealPlan(user);
}

function renderHealthScoreBanner(score, user, bmiInfo, target, totals) {
  const banner = document.getElementById('recommendationsScoreBanner');
  if (!banner) return;

  let scoreTitle = 'Excellent Diet Balancing';
  let scoreDesc = `Your nutritional intake aligns well with your ${user.fitnessGoal.toLowerCase()} objective. Keep logging consistently.`;

  if (score < 60) {
    scoreTitle = 'Nutritional Gaps Detected';
    scoreDesc = 'Several key macronutrients and micronutrient-rich categories are missing from today’s log. Review the guidelines below to optimize balance.';
  } else if (score < 80) {
    scoreTitle = 'Good Progress, Minor Tweaks Needed';
    scoreDesc = `You are on the right track towards your ${user.fitnessGoal.toLowerCase()} goal. A few targeted dietary adjustments can further improve results.`;
  }

  banner.innerHTML = `
    <div class="health-score-left">
      <div class="health-score-pill">
        <i class="bi bi-person-check-fill"></i> Goal: ${user.fitnessGoal} &bull; BMI: ${bmiInfo.value} (${bmiInfo.category})
      </div>
      <h2 class="health-score-title">${scoreTitle}</h2>
      <p class="health-score-desc">${scoreDesc}</p>
    </div>
    <div class="health-score-right">
      <div class="score-circle">
        <span class="score-num">${score}</span>
        <span class="score-lbl">Score / 100</span>
      </div>
    </div>
  `;
}

function renderPriorityRecommendations(user, target, macroTargets, totals, checks) {
  const container = document.getElementById('priorityRecsGrid');
  if (!container) return;

  const recs = [];

  // Protein Check
  if (checks.proteinRatio < 0.75) {
    const deficit = Math.round(macroTargets.protein - totals.protein);
    recs.push({
      badge: 'Protein Gap',
      badgeClass: 'badge-warning',
      icon: 'bi-egg-fill',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      title: 'Increase Lean Protein Sources',
      text: `You have currently consumed ${Math.round(totals.protein)}g of protein against your ${macroTargets.protein}g daily goal (${deficit}g remaining). Protein provides essential amino acids for satiety and lean tissue support.`,
      action: 'Suggested foods: Paneer, boiled eggs, grilled chicken breast, lentils (dal), or Greek yogurt.'
    });
  } else {
    recs.push({
      badge: 'Protein Optimized',
      badgeClass: 'badge-success',
      icon: 'bi-check-circle-fill',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      title: 'Strong Protein Foundation',
      text: `Great job! You have reached ${Math.round(totals.protein)}g of protein (${Math.round(checks.proteinRatio * 100)}% of your target). This supports satiety and muscle maintenance.`,
      action: 'Keep including moderate protein portions across all meals.'
    });
  }

  // Fiber & Vegetable Check
  if (!checks.hasVegetables || totals.fiber < 12) {
    recs.push({
      badge: 'Fiber & Micronutrients',
      badgeClass: 'badge-info',
      icon: 'bi-tree-fill',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      title: 'Add Fiber-Rich Vegetables',
      text: 'No substantial leafy vegetables or high-fiber foods detected today. Dietary fiber supports gut microbiome health, lowers glycemic spikes, and promotes prolonged fullness.',
      action: 'Add steamed broccoli, spinach, carrots, or roasted makhana to your next meal.'
    });
  }

  // Calorie Assessment
  if (totals.calories > target) {
    const overage = totals.calories - target;
    recs.push({
      badge: 'Calorie Surplus',
      badgeClass: 'badge-danger',
      icon: 'bi-exclamation-triangle-fill',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
      title: 'Calorie Target Exceeded',
      text: `You have consumed ${totals.calories} kcal, exceeding your calculated daily goal of ${target} kcal by ${overage} kcal. For ${user.fitnessGoal.toLowerCase()}, try capping evening portion sizes.`,
      action: 'Focus on light, water-dense options such as clear vegetable soups, salads, and herbal tea.'
    });
  } else if (user.fitnessGoal === 'Weight Loss' && checks.calorieRatio < 0.65 && totals.calories > 0) {
    recs.push({
      badge: 'Moderate Deficit Warning',
      badgeClass: 'badge-warning',
      icon: 'bi-shield-exclamation',
      iconBg: '#FEF3C7',
      iconColor: '#B45309',
      title: 'Avoid Over-Restricting Calories',
      text: `Your current intake is well below your target (${target - totals.calories} kcal left). Severe caloric restriction slows resting metabolic rate and causes energy fatigue.`,
      action: 'Incorporate healthy calorie sources like oatmeal, almonds, or fresh fruit.'
    });
  }

  // Goal-Specific Rule
  if (user.fitnessGoal === 'Weight Gain') {
    recs.push({
      badge: 'Weight Gain Strategy',
      badgeClass: 'badge-success',
      icon: 'bi-graph-up-arrow',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      title: 'Nutrient-Dense Caloric Surplus',
      text: 'To gain healthy weight steadily without excessive fat, consume clean energy-dense foods rather than refined sugars and trans-fats.',
      action: 'Include peanut butter, whole milk, oats, almonds, and avocados between regular meals.'
    });
  } else if (user.fitnessGoal === 'Weight Loss') {
    recs.push({
      badge: 'Weight Loss Strategy',
      badgeClass: 'badge-success',
      icon: 'bi-pie-chart-fill',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      title: 'Satiety & Portion Control',
      text: 'Drinking 300-500ml of water 20 minutes before meals and eating fibrous vegetables first reduces overall caloric overconsumption naturally.',
      action: 'Replace high-calorie sugary beverages with tender coconut water, green tea, or lemon water.'
    });
  }

  container.innerHTML = recs.map(r => `
    <div class="rec-card">
      <div class="rec-card-top">
        <div class="rec-card-icon" style="background: ${r.iconBg}; color: ${r.iconColor};">
          <i class="bi ${r.icon}"></i>
        </div>
        <span class="badge ${r.badgeClass}">${r.badge}</span>
      </div>
      <h3 class="rec-card-title">${r.title}</h3>
      <p class="rec-card-text">${r.text}</p>
      <div class="rec-action-box">
        <strong>Recommendation:</strong> ${r.action}
      </div>
    </div>
  `).join('');
}

function renderFoodsComparison(user) {
  const includeList = document.getElementById('includeFoodsList');
  const moderateList = document.getElementById('moderateFoodsList');
  if (!includeList || !moderateList) return;

  const includeItems = [
    { name: 'Spinach & Broccoli', note: 'High fiber, essential micronutrients, very low calories', icon: 'bi-tree', foodId: 'food_6' },
    { name: 'Paneer / Cottage Cheese', note: 'Slow-digesting casein protein, ideal for satiety', icon: 'bi-square-fill', foodId: 'food_19' },
    { name: 'Oats & Brown Rice', note: 'Complex carbohydrates with sustained glucose release', icon: 'bi-bowl', foodId: 'food_13' },
    { name: 'Boiled Eggs & Chicken', note: 'High biological value complete proteins for muscle retention', icon: 'bi-egg', foodId: 'food_20' },
    { name: 'Almonds & Chia Seeds', note: 'Omega-3 fatty acids, magnesium, and natural fiber', icon: 'bi-droplet-half', foodId: 'food_26' }
  ];

  const moderateItems = [
    { name: 'Ultra-Processed Snacks', note: 'High sodium and trans-fats; trigger rapid blood glucose crashes', icon: 'bi-exclamation-octagon' },
    { name: 'Sugary Carbonated Sodas', note: 'Empty calories that do not trigger fullness signals in the brain', icon: 'bi-cup-straw' },
    { name: 'Deep Fried Foods', note: 'High oxidized fatty acids, excessive calories in tiny portions', icon: 'bi-fire' },
    { name: 'Refined White Flour Items', note: 'Low fiber content leading to quick rebound hunger', icon: 'bi-slash-circle' }
  ];

  includeList.innerHTML = includeItems.map(item => `
    <div class="compare-item">
      <div class="compare-item-left">
        <i class="bi ${item.icon}" style="color: var(--primary); font-size: 1.2rem;"></i>
        <div>
          <strong style="font-size: 0.9rem; color: var(--text-main);">${item.name}</strong>
          <span style="display: block; font-size: 0.76rem; color: var(--text-muted);">${item.note}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-outline-primary" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;" onclick="openAddToMealModal('${item.foodId}')">
        + Log
      </button>
    </div>
  `).join('');

  moderateList.innerHTML = moderateItems.map(item => `
    <div class="compare-item">
      <div class="compare-item-left">
        <i class="bi ${item.icon}" style="color: #D97706; font-size: 1.2rem;"></i>
        <div>
          <strong style="font-size: 0.9rem; color: var(--text-main);">${item.name}</strong>
          <span style="display: block; font-size: 0.76rem; color: var(--text-muted);">${item.note}</span>
        </div>
      </div>
      <span class="badge badge-warning" style="font-size: 0.72rem;">Limit Portion</span>
    </div>
  `).join('');
}

function renderSampleMealPlan(user) {
  const container = document.getElementById('sampleMealPlanTimeline');
  if (!container) return;

  const isLoss = user.fitnessGoal === 'Weight Loss';
  const isGain = user.fitnessGoal === 'Weight Gain';

  const breakfast = isLoss 
    ? { title: 'Oatmeal & Boiled Egg', desc: '50g rolled oats cooked in milk with 1 sliced apple and 1 boiled egg. ~380 kcal | 18g Protein' }
    : isGain
    ? { title: 'Loaded Oatmeal & Whole Milk', desc: '80g oats with whole milk, 1 banana, 20g almonds, and 2 boiled eggs. ~620 kcal | 28g Protein' }
    : { title: 'Whole Wheat Toast & Eggs', desc: '2 slices toasted whole wheat bread with 2 poached eggs and 1 orange. ~420 kcal | 20g Protein' };

  const lunch = isLoss
    ? { title: 'Grilled Chicken & Steamed Broccoli', desc: '160g chicken breast, 1 cup steamed broccoli, and 1/2 cup brown rice. ~440 kcal | 48g Protein' }
    : isGain
    ? { title: 'Paneer Curry, Rice & Dal', desc: '150g paneer with 1 cup cooked brown rice and 1 bowl lentils. ~680 kcal | 35g Protein' }
    : { title: 'Lentil Dal, Rice & Curd', desc: '1 bowl dal, 150g steamed rice, and 1 katori curd with mixed greens. ~480 kcal | 22g Protein' };

  const snack = isLoss
    ? { title: 'Green Tea & Roasted Makhana', desc: '1 mug unsweetened green tea with 30g roasted fox nuts. ~110 kcal | 3g Protein' }
    : isGain
    ? { title: 'Greek Yogurt & Almonds', desc: '200g Greek yogurt with 30g almonds and honey. ~320 kcal | 22g Protein' }
    : { title: 'Fresh Papaya & Peanuts', desc: '1 cup papaya cubes with a handful of roasted peanuts. ~210 kcal | 8g Protein' };

  const dinner = isLoss
    ? { title: 'Steamed Spinach & Tofu/Paneer', desc: '120g grilled tofu or paneer with sautéed spinach and carrots. ~320 kcal | 24g Protein' }
    : isGain
    ? { title: 'Baked Fish/Chicken with Sweet Potato', desc: '180g salmon or chicken fillet with 1 medium baked sweet potato and salad. ~550 kcal | 42g Protein' }
    : { title: 'Chickpea Salad & Quinoa', desc: '1 bowl boiled chickpeas with diced tomatoes, cucumbers, and 100g quinoa. ~390 kcal | 18g Protein' };

  const meals = [
    { label: 'Breakfast (8:30 AM)', ...breakfast },
    { label: 'Lunch (1:00 PM)', ...lunch },
    { label: 'Evening Snack (4:30 PM)', ...snack },
    { label: 'Dinner (8:00 PM)', ...dinner }
  ];

  container.innerHTML = meals.map(m => `
    <div class="timeline-card">
      <span class="timeline-badge">${m.label}</span>
      <h4 class="timeline-title">${m.title}</h4>
      <p class="timeline-desc">${m.desc}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('recommendationsPageMarker')) {
    initRecommendationsPage();
  }
});


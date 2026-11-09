/**
 * NutriTrack - Dashboard Controller
 * Dynamic calculations, circular calorie meter, macro progress bars,
 * meal category lists, and Chart.js visualizations.
 */

let macroDoughnutChart = null;
let mealCalorieBarChart = null;

function initDashboard() {
  if (!AuthService.protectRoute(true)) return;

  const user = StorageService.getCurrentUser();
  if (!user) return;

  refreshDashboardData();
}

function refreshDashboardData() {
  const user = StorageService.getCurrentUser();
  if (!user) return;

  const todayStr = StorageService.formatLocalDate(new Date());
  const todayMeals = StorageService.getUserMeals(user.userId, todayStr);

  // 1. Calculate Targets
  const calorieTarget = StorageService.calculateDailyCalorieTarget(user);
  const macroTargets = StorageService.calculateMacroTargets(calorieTarget, user.fitnessGoal);

  // 2. Calculate Consumed Totals
  const dayTotals = StorageService.calculateDayTotals(todayMeals);

  // 3. Update Circular Progress & Calorie Card
  updateCalorieOverview(calorieTarget, dayTotals.calories);

  // 4. Update Macronutrient Progress Cards
  updateMacroCards(macroTargets, dayTotals);

  // 5. Update Today's Meals Section
  renderTodayMealsList(todayMeals);

  // 6. Update Recommendation Alert Card
  renderDashboardRecommendation(user, calorieTarget, dayTotals);

  // 7. Update Charts
  renderDashboardCharts(todayMeals, dayTotals, macroTargets);
}

// Global hook for quick add modal refresh
window.refreshCurrentPageData = function() {
  refreshDashboardData();
};

/**
 * Update Circular Progress Gauge and values
 */
function updateCalorieOverview(target, consumed) {
  const remaining = Math.max(0, target - consumed);
  const pct = Math.min(100, Math.round((consumed / target) * 100));

  const targetEl = document.getElementById('dashCalTarget');
  const consumedEl = document.getElementById('dashCalConsumed');
  const remainingEl = document.getElementById('dashCalRemaining');
  const circleValEl = document.getElementById('dashCircleVal');
  const circleProgressEl = document.getElementById('dashCircleProgress');

  if (targetEl) targetEl.textContent = `${target.toLocaleString()} kcal`;
  if (consumedEl) consumedEl.textContent = `${consumed.toLocaleString()} kcal`;
  if (remainingEl) remainingEl.textContent = `${remaining.toLocaleString()} kcal`;
  if (circleValEl) circleValEl.textContent = remaining.toLocaleString();

  if (circleProgressEl) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius; // ~439.82
    circleProgressEl.style.strokeDasharray = `${circumference}`;

    if (consumed > target) {
      // Over budget
      circleProgressEl.style.strokeDashoffset = '0';
      circleProgressEl.style.stroke = '#EF4444'; // Danger
    } else {
      const offset = circumference - (pct / 100) * circumference;
      circleProgressEl.style.strokeDashoffset = `${offset}`;
      circleProgressEl.style.stroke = '#2EAD70'; // Primary
    }
  }
}

/**
 * Update Macro Progress Cards
 */
function updateMacroCards(targets, totals) {
  // Protein
  const pConsumed = Math.round(totals.protein);
  const pTarget = targets.protein;
  const pPct = Math.min(100, Math.round((pConsumed / pTarget) * 100));
  const pRemain = Math.max(0, pTarget - pConsumed);

  const protValEl = document.getElementById('dashProteinVal');
  const protTargetEl = document.getElementById('dashProteinTarget');
  const protBarEl = document.getElementById('dashProteinBar');
  const protRemainEl = document.getElementById('dashProteinRemain');
  const protPctEl = document.getElementById('dashProteinPct');

  if (protValEl) protValEl.textContent = `${pConsumed}g`;
  if (protTargetEl) protTargetEl.textContent = `/ ${pTarget}g`;
  if (protBarEl) protBarEl.style.width = `${pPct}%`;
  if (protRemainEl) protRemainEl.textContent = `${pRemain}g left`;
  if (protPctEl) protPctEl.textContent = `${pPct}%`;

  // Carbs
  const cConsumed = Math.round(totals.carbohydrates);
  const cTarget = targets.carbohydrates;
  const cPct = Math.min(100, Math.round((cConsumed / cTarget) * 100));
  const cRemain = Math.max(0, cTarget - cConsumed);

  const carbsValEl = document.getElementById('dashCarbsVal');
  const carbsTargetEl = document.getElementById('dashCarbsTarget');
  const carbsBarEl = document.getElementById('dashCarbsBar');
  const carbsRemainEl = document.getElementById('dashCarbsRemain');
  const carbsPctEl = document.getElementById('dashCarbsPct');

  if (carbsValEl) carbsValEl.textContent = `${cConsumed}g`;
  if (carbsTargetEl) carbsTargetEl.textContent = `/ ${cTarget}g`;
  if (carbsBarEl) carbsBarEl.style.width = `${cPct}%`;
  if (carbsRemainEl) carbsRemainEl.textContent = `${cRemain}g left`;
  if (carbsPctEl) carbsPctEl.textContent = `${cPct}%`;

  // Fat
  const fConsumed = Math.round(totals.fat);
  const fTarget = targets.fat;
  const fPct = Math.min(100, Math.round((fConsumed / fTarget) * 100));
  const fRemain = Math.max(0, fTarget - fConsumed);

  const fatValEl = document.getElementById('dashFatVal');
  const fatTargetEl = document.getElementById('dashFatTarget');
  const fatBarEl = document.getElementById('dashFatBar');
  const fatRemainEl = document.getElementById('dashFatRemain');
  const fatPctEl = document.getElementById('dashFatPct');

  if (fatValEl) fatValEl.textContent = `${fConsumed}g`;
  if (fatTargetEl) fatTargetEl.textContent = `/ ${fTarget}g`;
  if (fatBarEl) fatBarEl.style.width = `${fPct}%`;
  if (fatRemainEl) fatRemainEl.textContent = `${fRemain}g left`;
  if (fatPctEl) fatPctEl.textContent = `${fPct}%`;
}

/**
 * Render Today's Meals Section
 */
function renderTodayMealsList(meals) {
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  mealTypes.forEach(type => {
    const listEl = document.getElementById(`mealList_${type}`);
    const badgeEl = document.getElementById(`mealBadge_${type}`);
    if (!listEl) return;

    const items = meals.filter(m => m.mealType.toLowerCase() === type.toLowerCase());
    const totalCals = items.reduce((sum, item) => sum + (item.calories || 0), 0);

    if (badgeEl) {
      badgeEl.textContent = `${totalCals} kcal`;
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="meal-empty-hint">
          <i class="bi bi-plus-circle" style="font-size: 1.5rem; opacity: 0.5;"></i>
          <span>No ${type.toLowerCase()} logged yet</span>
        </div>
      `;
    } else {
      listEl.innerHTML = items.map(item => `
        <div class="meal-item-row" data-meal-id="${item.mealId}">
          <div class="meal-item-left">
            <div>
              <div class="meal-item-name">${item.foodName}</div>
              <div class="meal-item-qty">${item.quantity}g &bull; P: ${item.protein}g | C: ${item.carbohydrates}g | F: ${item.fat}g</div>
            </div>
          </div>
          <div class="meal-item-right">
            <span class="meal-item-cal">${item.calories} kcal</span>
            <button class="meal-delete-btn" title="Delete meal entry" onclick="deleteDashboardMeal('${item.mealId}', '${item.foodName}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  });
}

function deleteDashboardMeal(mealId, foodName) {
  if (confirm(`Remove "${foodName}" from today's log?`)) {
    try {
      StorageService.deleteMeal(mealId);
      NutriApp.showToast(`Removed "${foodName}"`, 'info');
      refreshDashboardData();
    } catch (e) {
      NutriApp.showToast('Failed to delete meal record.', 'error');
    }
  }
}
window.deleteDashboardMeal = deleteDashboardMeal;

/**
 * Recommendation highlight on dashboard
 */
function renderDashboardRecommendation(user, calorieTarget, totals) {
  const recEl = document.getElementById('dashRecCard');
  if (!recEl) return;

  const pRatio = totals.protein / (StorageService.calculateMacroTargets(calorieTarget, user.fitnessGoal).protein || 1);
  const calsConsumed = totals.calories;

  let title = 'Nutritional Balance Insight';
  let message = 'Keep logging your meals regularly to receive targeted dietary guidance.';
  let icon = 'bi-lightbulb-fill';

  if (calsConsumed === 0) {
    title = 'Start Your Day Smart!';
    message = 'Log your breakfast to kick off your daily calorie and macronutrient tracking.';
    icon = 'bi-sunrise';
  } else if (calsConsumed > calorieTarget) {
    title = 'Calorie Ceiling Reached';
    message = `You have exceeded your ${calorieTarget} kcal daily target by ${calsConsumed - calorieTarget} kcal. Consider light, water-rich vegetables like cucumber or leafy greens for your remaining meals.`;
    icon = 'bi-exclamation-circle-fill';
  } else if (pRatio < 0.6) {
    title = 'Boost Your Protein Intake';
    message = 'Your protein intake is currently below target. Adding paneer, boiled eggs, Greek yogurt, or lentils will help support satiety and muscle repair.';
    icon = 'bi-shield-check';
  } else if (user.fitnessGoal === 'Weight Loss' && calsConsumed <= calorieTarget) {
    title = 'Optimal Caloric Deficit';
    message = `You are on track for steady weight loss with ${calorieTarget - calsConsumed} kcal remaining today. Great job keeping your nutrition balanced!`;
    icon = 'bi-trophy-fill';
  } else {
    title = 'Balanced Macronutrients';
    message = 'Your meals today reflect a solid balance between proteins, carbohydrates, and healthy fats. Stay hydrated!';
    icon = 'bi-check-circle-fill';
  }

  recEl.innerHTML = `
    <div class="rec-alert-left">
      <div class="rec-alert-icon"><i class="bi ${icon}"></i></div>
      <div class="rec-alert-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    </div>
    <a href="recommendations.html" class="btn btn-sm btn-outline-primary" style="white-space: nowrap;">
      View Full Analysis <i class="bi bi-arrow-right"></i>
    </a>
  `;
}

/**
 * Render Chart.js Visualizations
 */
function renderDashboardCharts(todayMeals, dayTotals, macroTargets) {
  if (typeof Chart === 'undefined') return;

  // 1. Macronutrient Doughnut Chart
  const doughnutCtx = document.getElementById('macroDoughnutChart');
  if (doughnutCtx) {
    const p = Math.round(dayTotals.protein) || 0;
    const c = Math.round(dayTotals.carbohydrates) || 0;
    const f = Math.round(dayTotals.fat) || 0;

    const hasData = (p + c + f) > 0;
    const dataValues = hasData ? [p, c, f] : [1, 1, 1];
    const dataColors = hasData ? ['#2EAD70', '#0EA5E9', '#FF9F43'] : ['#E2E8F0', '#E2E8F0', '#E2E8F0'];

    if (macroDoughnutChart) {
      macroDoughnutChart.destroy();
    }

    macroDoughnutChart = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Protein (g)', 'Carbohydrates (g)', 'Fat (g)'],
        datasets: [{
          data: dataValues,
          backgroundColor: dataColors,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { family: 'Inter', size: 12, weight: 500 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (!hasData) return 'No data logged yet';
                const label = context.label || '';
                const val = context.raw || 0;
                return ` ${label}: ${val}g`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  // 2. Meal Calorie Bar Chart
  const barCtx = document.getElementById('mealBarChart');
  if (barCtx) {
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const mealCalories = mealTypes.map(type => {
      return todayMeals
        .filter(m => m.mealType.toLowerCase() === type.toLowerCase())
        .reduce((sum, item) => sum + (item.calories || 0), 0);
    });

    if (mealCalorieBarChart) {
      mealCalorieBarChart.destroy();
    }

    mealCalorieBarChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: mealTypes,
        datasets: [{
          label: 'Calories (kcal)',
          data: mealCalories,
          backgroundColor: [
            'rgba(245, 158, 11, 0.85)',
            'rgba(14, 165, 233, 0.85)',
            'rgba(124, 58, 237, 0.85)',
            'rgba(46, 173, 112, 0.85)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.raw} kcal`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#F2F4F7' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              callback: value => `${value} kcal`
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 12, weight: 600 } }
          }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboardPageMarker')) {
    initDashboard();
  }
});


/**
 * NutriTrack - Meal History & Weekly Analytics Controller (history.html)
 */

let weeklyChartInstance = null;
let currentFilterMode = '7days'; // 'today', 'yesterday', '7days', 'custom'
let activeFilterDate = StorageService.formatLocalDate(new Date());
let historySearchTerm = '';

function initHistoryPage() {
  if (!AuthService.protectRoute(true)) return;

  bindHistoryFilterEvents();
  renderWeeklyAnalyticsChart();
  renderHistoryView();
  initEditModal();
}

function bindHistoryFilterEvents() {
  // Quick date pill filters
  const datePills = document.querySelectorAll('.history-date-btn');
  const customDateInput = document.getElementById('historyCustomDate');
  const searchInput = document.getElementById('historySearchInput');

  datePills.forEach(pill => {
    pill.addEventListener('click', () => {
      datePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      currentFilterMode = pill.getAttribute('data-mode');
      const today = new Date();

      if (currentFilterMode === 'today') {
        activeFilterDate = StorageService.formatLocalDate(today);
      } else if (currentFilterMode === 'yesterday') {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        activeFilterDate = StorageService.formatLocalDate(yest);
      } else if (currentFilterMode === '7days') {
        activeFilterDate = null; // Range mode
      }

      renderHistoryView();
    });
  });

  if (customDateInput) {
    customDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        datePills.forEach(p => p.classList.remove('active'));
        currentFilterMode = 'custom';
        activeFilterDate = e.target.value;
        renderHistoryView();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      historySearchTerm = e.target.value.toLowerCase().trim();
      renderHistoryView();
    });
  }
}

/**
 * Weekly Chart.js Visualization (Last 7 Days)
 */
function renderWeeklyAnalyticsChart() {
  const chartCanvas = document.getElementById('weeklyNutritionChart');
  if (!chartCanvas || typeof Chart === 'undefined') return;

  const user = StorageService.getCurrentUser();
  if (!user) return;

  const calorieTarget = StorageService.calculateDailyCalorieTarget(user);

  // Generate last 7 days dates
  const days = [];
  const labels = [];
  const calorieData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = StorageService.formatLocalDate(d);
    days.push(dateStr);

    const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    labels.push(dayName);

    const meals = StorageService.getUserMeals(user.userId, dateStr);
    const dayTotals = StorageService.calculateDayTotals(meals);
    calorieData.push(dayTotals.calories);
  }

  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Consumed (kcal)',
          data: calorieData,
          backgroundColor: calorieData.map(val => val > calorieTarget ? '#EF4444' : '#2EAD70'),
          borderRadius: 8,
          barPercentage: 0.6
        },
        {
          type: 'line',
          label: `Daily Target (${calorieTarget} kcal)`,
          data: new Array(7).fill(calorieTarget),
          borderColor: '#176B4D',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Inter', size: 12, weight: 600 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.raw} kcal`;
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

/**
 * Render Day-by-Day or Filtered Meal Records
 */
function renderHistoryView() {
  const user = StorageService.getCurrentUser();
  if (!user) return;

  const container = document.getElementById('historyDaysContainer');
  if (!container) return;

  let allUserMeals = StorageService.getAllMeals().filter(m => m.userId === user.userId);

  // Apply search filter if present
  if (historySearchTerm) {
    allUserMeals = allUserMeals.filter(m => 
      m.foodName.toLowerCase().includes(historySearchTerm) ||
      m.category.toLowerCase().includes(historySearchTerm) ||
      m.mealType.toLowerCase().includes(historySearchTerm)
    );
  }

  // Determine which dates to show
  let targetDates = [];
  const today = new Date();

  if (currentFilterMode === '7days') {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      targetDates.push(StorageService.formatLocalDate(d));
    }
  } else if (activeFilterDate) {
    targetDates = [activeFilterDate];
  }

  // Calculate summary metrics across the selected view
  const viewMeals = allUserMeals.filter(m => targetDates.includes(m.date));
  const viewTotals = StorageService.calculateDayTotals(viewMeals);

  const sumCalEl = document.getElementById('historySummaryCal');
  const sumProtEl = document.getElementById('historySummaryProt');
  const sumCarbsEl = document.getElementById('historySummaryCarbs');
  const sumFatEl = document.getElementById('historySummaryFat');

  if (sumCalEl) sumCalEl.textContent = `${viewTotals.calories.toLocaleString()} kcal`;
  if (sumProtEl) sumProtEl.textContent = `${Math.round(viewTotals.protein)}g`;
  if (sumCarbsEl) sumCarbsEl.textContent = `${Math.round(viewTotals.carbohydrates)}g`;
  if (sumFatEl) sumFatEl.textContent = `${Math.round(viewTotals.fat)}g`;

  if (viewMeals.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
        <h3 class="empty-state-title">No Meal Records Found</h3>
        <p class="empty-state-desc">There are no food records for the selected period. Start logging your breakfast, lunch, or dinner.</p>
        <a href="add-meal.html" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Record a Meal</a>
      </div>
    `;
    return;
  }

  // Group by date
  container.innerHTML = targetDates.map(dateStr => {
    const dayMeals = viewMeals.filter(m => m.date === dateStr);
    if (dayMeals.length === 0) return ''; // Skip empty days in multi-day range

    const dayTotals = StorageService.calculateDayTotals(dayMeals);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    return `
      <div class="card mb-4" style="border-left: 5px solid var(--primary);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.2rem;">
              <i class="bi bi-calendar3" style="color: var(--primary); margin-right: 0.4rem;"></i>
              ${formattedDate}
            </h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${dayMeals.length} items logged</span>
          </div>
          <div style="display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap;">
            <span class="badge badge-success" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
              Total: ${dayTotals.calories} kcal
            </span>
            <span style="font-size: 0.82rem; color: var(--text-secondary);">
              P: ${Math.round(dayTotals.protein)}g &bull; C: ${Math.round(dayTotals.carbohydrates)}g &bull; F: ${Math.round(dayTotals.fat)}g
            </span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${mealTypes.map(type => {
            const typeItems = dayMeals.filter(m => m.mealType.toLowerCase() === type.toLowerCase());
            if (typeItems.length === 0) return '';

            const subtotalCal = typeItems.reduce((s, it) => s + (it.calories || 0), 0);

            return `
              <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 0.85rem 1.15rem; border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <strong style="color: var(--secondary); font-size: 0.95rem;">${type}</strong>
                  <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">${subtotalCal} kcal</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  ${typeItems.map(item => `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                      <div>
                        <strong style="font-size: 0.9rem; color: var(--text-main);">${item.foodName}</strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 0.4rem;">(${item.quantity}g)</span>
                        <div style="font-size: 0.74rem; color: var(--text-muted);">
                          P: ${item.protein}g | C: ${item.carbohydrates}g | F: ${item.fat}g | Fiber: ${item.fiber || 0}g
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-weight: 700; color: var(--secondary); font-size: 0.9rem;">${item.calories} kcal</span>
                        <button class="btn btn-sm btn-outline" style="padding: 0.25rem 0.5rem;" title="Edit" onclick="openHistoryEditModal('${item.mealId}')">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger-outline" style="padding: 0.25rem 0.5rem;" title="Delete" onclick="deleteHistoryMeal('${item.mealId}', '${item.foodName}')">
                          <i class="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Edit Modal Controller in History
 */
let historyEditingMeal = null;

function initEditModal() {
  const form = document.getElementById('historyEditForm');
  const qtyInput = document.getElementById('historyEditQty');

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      if (!historyEditingMeal) return;
      const qty = parseFloat(qtyInput.value) || 0;
      const food = FoodService.getFoodById(historyEditingMeal.foodId);
      if (food) {
        const n = FoodService.calculateNutrients(food, qty);
        const preview = document.getElementById('historyEditPreview');
        if (preview) {
          preview.innerHTML = `
            <div class="quick-calc-grid">
              <div class="stat-pill"><span class="pill-label">Calories</span> <strong>${n.calories} kcal</strong></div>
              <div class="stat-pill"><span class="pill-label">Protein</span> <strong>${n.protein}g</strong></div>
              <div class="stat-pill"><span class="pill-label">Carbs</span> <strong>${n.carbohydrates}g</strong></div>
              <div class="stat-pill"><span class="pill-label">Fat</span> <strong>${n.fat}g</strong></div>
            </div>
          `;
        }
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!historyEditingMeal) return;

      const qty = parseFloat(qtyInput.value);
      const mealType = document.getElementById('historyEditType').value;
      const dateVal = document.getElementById('historyEditDate').value;

      if (!qty || qty <= 0) {
        NutriApp.showToast('Please enter a valid quantity.', 'error');
        return;
      }

      const food = FoodService.getFoodById(historyEditingMeal.foodId);
      const n = food ? FoodService.calculateNutrients(food, qty) : {
        calories: Math.round((historyEditingMeal.calories / historyEditingMeal.quantity) * qty),
        protein: +((historyEditingMeal.protein / historyEditingMeal.quantity) * qty).toFixed(1),
        carbohydrates: +((historyEditingMeal.carbohydrates / historyEditingMeal.quantity) * qty).toFixed(1),
        fat: +((historyEditingMeal.fat / historyEditingMeal.quantity) * qty).toFixed(1),
        fiber: 0
      };

      try {
        StorageService.updateMeal(historyEditingMeal.mealId, {
          quantity: qty,
          mealType: mealType,
          date: dateVal,
          calories: n.calories,
          protein: n.protein,
          carbohydrates: n.carbohydrates,
          fat: n.fat,
          fiber: n.fiber
        });

        NutriApp.showToast('Meal updated successfully.', 'success');
        NutriApp.closeModal('historyEditModal');
        renderHistoryView();
        renderWeeklyAnalyticsChart();
      } catch (err) {
        NutriApp.showToast(err.message, 'error');
      }
    });
  }
}

function openHistoryEditModal(mealId) {
  const meal = StorageService.getMealById(mealId);
  if (!meal) return;

  historyEditingMeal = meal;

  const titleEl = document.getElementById('historyEditFoodTitle');
  const qtyInput = document.getElementById('historyEditQty');
  const typeSelect = document.getElementById('historyEditType');
  const dateInput = document.getElementById('historyEditDate');

  if (titleEl) titleEl.textContent = `Edit ${meal.foodName}`;
  if (qtyInput) qtyInput.value = meal.quantity;
  if (typeSelect) typeSelect.value = meal.mealType;
  if (dateInput) dateInput.value = meal.date;

  qtyInput.dispatchEvent(new Event('input'));
  NutriApp.openModal('historyEditModal');
}
window.openHistoryEditModal = openHistoryEditModal;

function deleteHistoryMeal(mealId, foodName) {
  if (confirm(`Remove "${foodName}" from history?`)) {
    try {
      StorageService.deleteMeal(mealId);
      NutriApp.showToast(`Deleted "${foodName}"`, 'info');
      renderHistoryView();
      renderWeeklyAnalyticsChart();
    } catch (e) {
      NutriApp.showToast('Failed to delete meal record.', 'error');
    }
  }
}
window.deleteHistoryMeal = deleteHistoryMeal;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('historyPageMarker')) {
    initHistoryPage();
  }
});


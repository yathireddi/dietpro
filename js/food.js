/**
 * NutriTrack - Food Database Controller (food.html)
 */

let currentCategory = 'All';
let currentSearch = '';
let currentSort = 'name_asc';
let activeSelectedFood = null;

function initFoodPage() {
  if (!AuthService.protectRoute(true)) return;

  bindFoodFilterEvents();
  renderFoodCards();
  initFoodDetailModal();
  initFoodAddToMealModal();
}

function bindFoodFilterEvents() {
  // Search input
  const searchInput = document.getElementById('foodSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderFoodCards();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('foodSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFoodCards();
    });
  }

  // Category pills
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'All';
      renderFoodCards();
    });
  });
}

function renderFoodCards() {
  const container = document.getElementById('foodCardsGrid');
  const countEl = document.getElementById('foodResultsCount');
  if (!container) return;

  const foods = FoodService.searchFoods(currentSearch, currentCategory, currentSort);

  if (countEl) {
    countEl.textContent = `Showing ${foods.length} food items`;
  }

  if (foods.length === 0) {
    container.innerHTML = `
      <div class="col-12 empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i class="bi bi-search"></i></div>
        <h3 class="empty-state-title">No Food Items Found</h3>
        <p class="empty-state-desc">We couldn't find any food matching "${currentSearch}". Try another search term or filter category.</p>
        <button class="btn btn-outline-primary" onclick="resetFoodFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = foods.map(food => {
    return `
      <div class="food-card" data-food-id="${food.foodId}">
        <div>
          <div class="food-card-header">
            <div class="food-avatar-badge">
              <i class="bi ${food.icon || 'bi-egg-fill'}"></i>
            </div>
            <div class="food-header-titles">
              <h3 class="food-title">${food.foodName}</h3>
              <span class="food-category-tag">${food.category}</span>
            </div>
            <div class="food-calorie-badge">
              <div class="food-cal-number">${food.calories}</div>
              <div class="food-cal-unit">kcal / 100g</div>
            </div>
          </div>

          <div class="food-prep-info">
            <i class="bi bi-info-circle"></i>
            <span>${food.prepMethod || 'Standard preparation'} &bull; ${food.servingHint || ''}</span>
          </div>

          <div class="food-macros-grid">
            <div class="food-macro-col">
              <strong>${food.protein}g</strong>
              <span>Protein</span>
            </div>
            <div class="food-macro-col">
              <strong>${food.carbohydrates}g</strong>
              <span>Carbs</span>
            </div>
            <div class="food-macro-col">
              <strong>${food.fat}g</strong>
              <span>Fat</span>
            </div>
            <div class="food-macro-col">
              <strong>${food.fiber || 0}g</strong>
              <span>Fiber</span>
            </div>
          </div>
        </div>

        <div class="food-card-actions">
          <button class="btn btn-sm btn-outline" onclick="openFoodDetailModal('${food.foodId}')">
            <i class="bi bi-eye"></i> Details
          </button>
          <button class="btn btn-sm btn-primary" onclick="openAddToMealModal('${food.foodId}')">
            <i class="bi bi-plus-lg"></i> Add to Meal
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function resetFoodFilters() {
  currentCategory = 'All';
  currentSearch = '';
  currentSort = 'name_asc';

  const searchInput = document.getElementById('foodSearchInput');
  const sortSelect = document.getElementById('foodSortSelect');
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'name_asc';

  document.querySelectorAll('.category-pill').forEach(p => {
    if (p.getAttribute('data-category') === 'All') p.classList.add('active');
    else p.classList.remove('active');
  });

  renderFoodCards();
}
window.resetFoodFilters = resetFoodFilters;

/**
 * Food Detail Modal
 */
function initFoodDetailModal() {
  // Setup handled by openFoodDetailModal
}

function openFoodDetailModal(foodId) {
  const food = FoodService.getFoodById(foodId);
  if (!food) return;

  const modalEl = document.getElementById('foodDetailModal');
  const titleEl = document.getElementById('detailFoodName');
  const catEl = document.getElementById('detailFoodCategory');
  const iconEl = document.getElementById('detailFoodIcon');
  const bodyEl = document.getElementById('detailFoodBody');
  const actionBtn = document.getElementById('detailAddMealBtn');

  if (titleEl) titleEl.textContent = food.foodName;
  if (catEl) catEl.textContent = food.category;
  if (iconEl) iconEl.className = `bi ${food.icon || 'bi-egg-fill'}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <span style="font-size: 2.5rem; font-weight: 800; color: var(--secondary);">${food.calories}</span>
        <span style="font-size: 0.9rem; color: var(--text-muted); display: block;">calories per 100g edible portion</span>
      </div>

      <div style="background: var(--bg-main); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-secondary);">Nutritional Breakdown (per 100g):</h4>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-light);">
          <span>Protein</span> <strong>${food.protein} g</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-light);">
          <span>Carbohydrates</span> <strong>${food.carbohydrates} g</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-light);">
          <span>Dietary Fat</span> <strong>${food.fat} g</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.4rem 0;">
          <span>Dietary Fiber</span> <strong>${food.fiber || 0} g</strong>
        </div>
      </div>

      <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
        <p><strong>Serving Hint:</strong> ${food.servingHint || 'Standard serving is approximately 100g.'}</p>
        <p><strong>Preparation:</strong> ${food.prepMethod || 'Fresh / standard cooked.'}</p>
      </div>
    `;
  }

  if (actionBtn) {
    actionBtn.onclick = () => {
      NutriApp.closeModal('foodDetailModal');
      openAddToMealModal(food.foodId);
    };
  }

  NutriApp.openModal('foodDetailModal');
}
window.openFoodDetailModal = openFoodDetailModal;

/**
 * Add To Meal Modal from Food Database Page
 */
function initFoodAddToMealModal() {
  const form = document.getElementById('logFoodModalForm');
  const qtyInput = document.getElementById('logFoodQuantity');

  if (qtyInput) {
    qtyInput.addEventListener('input', updateLogFoodPreview);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeSelectedFood) return;

      const mealType = document.getElementById('logFoodMealType').value;
      const quantity = parseFloat(document.getElementById('logFoodQuantity').value);
      const dateVal = document.getElementById('logFoodDate').value || StorageService.formatLocalDate(new Date());

      if (!quantity || quantity <= 0) {
        NutriApp.showToast('Please enter a valid quantity in grams.', 'error');
        return;
      }

      const nutrients = FoodService.calculateNutrients(activeSelectedFood, quantity);

      try {
        StorageService.addMeal({
          foodId: activeSelectedFood.foodId,
          foodName: activeSelectedFood.foodName,
          category: activeSelectedFood.category,
          mealType: mealType,
          quantity: quantity,
          calories: nutrients.calories,
          protein: nutrients.protein,
          carbohydrates: nutrients.carbohydrates,
          fat: nutrients.fat,
          fiber: nutrients.fiber,
          date: dateVal
        });

        NutriApp.showToast(`Logged ${activeSelectedFood.foodName} (${quantity}g) to ${mealType}!`, 'success');
        NutriApp.closeModal('logFoodModal');
        form.reset();
      } catch (err) {
        NutriApp.showToast(err.message, 'error');
      }
    });
  }
}

function openAddToMealModal(foodId) {
  const food = FoodService.getFoodById(foodId);
  if (!food) return;

  activeSelectedFood = food;
  const nameEl = document.getElementById('logFoodTitle');
  const qtyInput = document.getElementById('logFoodQuantity');
  const dateInput = document.getElementById('logFoodDate');

  if (nameEl) nameEl.textContent = `Log ${food.foodName}`;
  if (qtyInput) qtyInput.value = '100'; // Default 100g
  if (dateInput) dateInput.value = StorageService.formatLocalDate(new Date());

  updateLogFoodPreview();
  NutriApp.openModal('logFoodModal');
}
window.openAddToMealModal = openAddToMealModal;

function updateLogFoodPreview() {
  if (!activeSelectedFood) return;
  const qty = parseFloat(document.getElementById('logFoodQuantity').value) || 0;
  const previewEl = document.getElementById('logFoodNutrientPreview');
  if (!previewEl) return;

  const nutrients = FoodService.calculateNutrients(activeSelectedFood, qty);
  previewEl.innerHTML = `
    <div class="quick-calc-grid">
      <div class="stat-pill"><span class="pill-label">Calories</span> <strong>${nutrients.calories} kcal</strong></div>
      <div class="stat-pill"><span class="pill-label">Protein</span> <strong>${nutrients.protein}g</strong></div>
      <div class="stat-pill"><span class="pill-label">Carbs</span> <strong>${nutrients.carbohydrates}g</strong></div>
      <div class="stat-pill"><span class="pill-label">Fat</span> <strong>${nutrients.fat}g</strong></div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('foodPageMarker')) {
    initFoodPage();
  }
});


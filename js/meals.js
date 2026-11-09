/**
 * NutriTrack - Add Meal Controller (add-meal.html)
 * Dynamic live calculation, meal recording, and date-filtered entry manager.
 */

let editingMealId = null;

function initAddMealPage() {
  if (!AuthService.protectRoute(true)) return;

  populateFoodDropdown();
  setDefaultDate();
  bindAddMealFormEvents();
  renderDateMealEntries();
}

/**
 * Populate food select list with categorized options
 */
function populateFoodDropdown() {
  const select = document.getElementById('mealFoodSelect');
  if (!select) return;

  const foods = FoodService.getAllFoods();
  select.innerHTML = '<option value="">-- Choose a Food Item --</option>';

  const categories = FoodService.getCategories().filter(c => c !== 'All');

  categories.forEach(cat => {
    const catFoods = foods.filter(f => f.category.toLowerCase() === cat.toLowerCase());
    if (catFoods.length > 0) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = cat;
      catFoods.forEach(food => {
        const opt = document.createElement('option');
        opt.value = food.foodId;
        opt.textContent = `${food.foodName} (${food.calories} kcal / 100g)`;
        optGroup.appendChild(opt);
      });
      select.appendChild(optGroup);
    }
  });
}

function setDefaultDate() {
  const dateInput = document.getElementById('mealDateInput');
  if (dateInput && !dateInput.value) {
    dateInput.value = StorageService.formatLocalDate(new Date());
  }
}

/**
 * Bind live calculations and form submissions
 */
function bindAddMealFormEvents() {
  const form = document.getElementById('addMealMainForm');
  const foodSelect = document.getElementById('mealFoodSelect');
  const qtyInput = document.getElementById('mealQuantityInput');
  const dateInput = document.getElementById('mealDateInput');

  // Live calculation updates
  const updateLiveCalculation = () => {
    const foodId = foodSelect.value;
    const qty = parseFloat(qtyInput.value) || 0;

    const calPreview = document.getElementById('liveCalVal');
    const protPreview = document.getElementById('liveProtVal');
    const carbsPreview = document.getElementById('liveCarbsVal');
    const fatPreview = document.getElementById('liveFatVal');
    const fiberPreview = document.getElementById('liveFiberVal');

    if (!foodId || qty <= 0) {
      if (calPreview) calPreview.textContent = '0 kcal';
      if (protPreview) protPreview.textContent = '0.0 g';
      if (carbsPreview) carbsPreview.textContent = '0.0 g';
      if (fatPreview) fatPreview.textContent = '0.0 g';
      if (fiberPreview) fiberPreview.textContent = '0.0 g';
      return;
    }

    const food = FoodService.getFoodById(foodId);
    if (!food) return;

    const nutrients = FoodService.calculateNutrients(food, qty);

    if (calPreview) calPreview.textContent = `${nutrients.calories} kcal`;
    if (protPreview) protPreview.textContent = `${nutrients.protein} g`;
    if (carbsPreview) carbsPreview.textContent = `${nutrients.carbohydrates} g`;
    if (fatPreview) fatPreview.textContent = `${nutrients.fat} g`;
    if (fiberPreview) fiberPreview.textContent = `${nutrients.fiber} g`;
  };

  if (foodSelect) foodSelect.addEventListener('change', updateLiveCalculation);
  if (qtyInput) qtyInput.addEventListener('input', updateLiveCalculation);

  // Quick quantity increment buttons
  document.querySelectorAll('.qty-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const addVal = parseInt(btn.getAttribute('data-add'), 10) || 0;
      const setVal = parseInt(btn.getAttribute('data-set'), 10) || 0;

      let current = parseFloat(qtyInput.value) || 0;
      if (setVal > 0) {
        qtyInput.value = setVal;
      } else if (addVal > 0) {
        qtyInput.value = current + addVal;
      }
      updateLiveCalculation();
    });
  });

  // When date changes, refresh the table of entries for that day
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      renderDateMealEntries();
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const foodId = foodSelect.value;
      const mealTypeRadio = document.querySelector('input[name="mealType"]:checked');
      const mealType = mealTypeRadio ? mealTypeRadio.value : 'Breakfast';
      const quantity = parseFloat(qtyInput.value);
      const dateVal = dateInput.value;

      if (!foodId) {
        NutriApp.showToast('Please select a food item.', 'error');
        return;
      }

      if (!quantity || quantity <= 0) {
        NutriApp.showToast('Please specify a positive quantity in grams.', 'error');
        return;
      }

      if (!dateVal) {
        NutriApp.showToast('Please select a date for the meal record.', 'error');
        return;
      }

      const food = FoodService.getFoodById(foodId);
      const nutrients = FoodService.calculateNutrients(food, quantity);

      try {
        if (editingMealId) {
          // Update existing
          StorageService.updateMeal(editingMealId, {
            foodId: food.foodId,
            foodName: food.foodName,
            category: food.category,
            mealType: mealType,
            quantity: quantity,
            calories: nutrients.calories,
            protein: nutrients.protein,
            carbohydrates: nutrients.carbohydrates,
            fat: nutrients.fat,
            fiber: nutrients.fiber,
            date: dateVal
          });

          NutriApp.showToast(`Updated "${food.foodName}" successfully!`, 'success');
          cancelEditMeal();
        } else {
          // Add new
          StorageService.addMeal({
            foodId: food.foodId,
            foodName: food.foodName,
            category: food.category,
            mealType: mealType,
            quantity: quantity,
            calories: nutrients.calories,
            protein: nutrients.protein,
            carbohydrates: nutrients.carbohydrates,
            fat: nutrients.fat,
            fiber: nutrients.fiber,
            date: dateVal
          });

          NutriApp.showToast(`Logged ${food.foodName} (${quantity}g) to ${mealType}!`, 'success');
        }

        form.reset();
        setDefaultDate();
        updateLiveCalculation();
        renderDateMealEntries();
      } catch (err) {
        NutriApp.showToast(err.message, 'error');
      }
    });
  }
}

/**
 * Render logged meals for the selected date
 */
function renderDateMealEntries() {
  const user = StorageService.getCurrentUser();
  if (!user) return;

  const dateInput = document.getElementById('mealDateInput');
  const selectedDate = dateInput ? dateInput.value : StorageService.formatLocalDate(new Date());

  const container = document.getElementById('loggedMealsTableBody');
  const totalCalEl = document.getElementById('daySummaryTotalCal');
  const totalProtEl = document.getElementById('daySummaryTotalProt');
  const totalCarbsEl = document.getElementById('daySummaryTotalCarbs');
  const totalFatEl = document.getElementById('daySummaryTotalFat');
  const entriesCountEl = document.getElementById('dayEntriesCount');

  if (!container) return;

  const meals = StorageService.getUserMeals(user.userId, selectedDate);
  const totals = StorageService.calculateDayTotals(meals);

  if (totalCalEl) totalCalEl.textContent = `${totals.calories} kcal`;
  if (totalProtEl) totalProtEl.textContent = `${Math.round(totals.protein)}g`;
  if (totalCarbsEl) totalCarbsEl.textContent = `${Math.round(totals.carbohydrates)}g`;
  if (totalFatEl) totalFatEl.textContent = `${Math.round(totals.fat)}g`;
  if (entriesCountEl) entriesCountEl.textContent = `${meals.length} items logged`;

  if (meals.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          <i class="bi bi-inbox" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          No meals recorded for ${selectedDate}. Use the form above to add a meal.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = meals.map((m, index) => {
    let typeBadgeClass = 'badge-success';
    if (m.mealType === 'Breakfast') typeBadgeClass = 'badge-warning';
    if (m.mealType === 'Lunch') typeBadgeClass = 'badge-info';
    if (m.mealType === 'Dinner') typeBadgeClass = 'badge-secondary';

    return `
      <tr>
        <td><strong>#${index + 1}</strong></td>
        <td>
          <span class="badge ${typeBadgeClass}">${m.mealType}</span>
        </td>
        <td>
          <strong>${m.foodName}</strong>
          <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">${m.category}</span>
        </td>
        <td>${m.quantity} g</td>
        <td><strong style="color: var(--secondary);">${m.calories} kcal</strong></td>
        <td style="font-size: 0.85rem; color: var(--text-secondary);">
          P: ${m.protein}g | C: ${m.carbohydrates}g | F: ${m.fat}g
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm btn-outline" style="padding: 0.3rem 0.6rem;" title="Edit entry" onclick="startEditMeal('${m.mealId}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger-outline" style="padding: 0.3rem 0.6rem;" title="Delete entry" onclick="deleteMealRecord('${m.mealId}', '${m.foodName}')">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Edit meal workflow
 */
function startEditMeal(mealId) {
  const meal = StorageService.getMealById(mealId);
  if (!meal) return;

  editingMealId = mealId;

  const foodSelect = document.getElementById('mealFoodSelect');
  const qtyInput = document.getElementById('mealQuantityInput');
  const dateInput = document.getElementById('mealDateInput');
  const submitBtn = document.getElementById('mealSubmitBtn');
  const cancelBtn = document.getElementById('mealCancelEditBtn');

  if (foodSelect) foodSelect.value = meal.foodId;
  if (qtyInput) qtyInput.value = meal.quantity;
  if (dateInput) dateInput.value = meal.date;

  // Radio button for mealType
  const radio = document.querySelector(`input[name="mealType"][value="${meal.mealType}"]`);
  if (radio) radio.checked = true;

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="bi bi-check-lg"></i> Update Meal Record';
  }
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-flex';
  }

  // Trigger preview update
  qtyInput.dispatchEvent(new Event('input'));

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
  NutriApp.showToast(`Editing "${meal.foodName}"`, 'info');
}
window.startEditMeal = startEditMeal;

function cancelEditMeal() {
  editingMealId = null;
  const form = document.getElementById('addMealMainForm');
  const submitBtn = document.getElementById('mealSubmitBtn');
  const cancelBtn = document.getElementById('mealCancelEditBtn');

  if (form) form.reset();
  setDefaultDate();

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Add Meal to Log';
  }
  if (cancelBtn) {
    cancelBtn.style.display = 'none';
  }

  const qtyInput = document.getElementById('mealQuantityInput');
  if (qtyInput) qtyInput.dispatchEvent(new Event('input'));
}
window.cancelEditMeal = cancelEditMeal;

function deleteMealRecord(mealId, foodName) {
  if (confirm(`Are you sure you want to delete "${foodName}" from the records?`)) {
    try {
      StorageService.deleteMeal(mealId);
      NutriApp.showToast(`Deleted "${foodName}"`, 'info');
      renderDateMealEntries();
    } catch (e) {
      NutriApp.showToast('Failed to delete meal record.', 'error');
    }
  }
}
window.deleteMealRecord = deleteMealRecord;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('addMealPageMarker')) {
    initAddMealPage();
  }
});


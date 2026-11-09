/**
 * NutriTrack - Profile Controller (profile.html)
 * Displays user metrics, BMI visual gauge, Mifflin-St Jeor calculations,
 * and profile editor with instant recalculated targets.
 */

function initProfilePage() {
  if (!AuthService.protectRoute(true)) return;

  renderUserProfileData();
  bindProfileFormEvents();
}

function renderUserProfileData() {
  const user = StorageService.getCurrentUser();
  if (!user) return;

  // Header and static view elements
  const nameEl = document.getElementById('profileHeaderName');
  const emailEl = document.getElementById('profileHeaderEmail');
  const goalBadge = document.getElementById('profileHeaderGoalBadge');
  const avatarInitials = document.getElementById('profileBigAvatarInitials');

  if (nameEl) nameEl.textContent = user.fullName;
  if (emailEl) emailEl.textContent = user.email;
  if (goalBadge) goalBadge.textContent = user.fitnessGoal;

  const initials = (user.fullName || 'NT')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (avatarInitials) avatarInitials.textContent = initials;

  // 1. Calculations: BMI
  const bmi = StorageService.calculateBMI(user.weight, user.height);
  const bmiValEl = document.getElementById('profileBmiVal');
  const bmiBadgeEl = document.getElementById('profileBmiBadge');
  const bmiDescEl = document.getElementById('profileBmiDesc');
  const bmiPointerEl = document.getElementById('profileBmiPointer');

  if (bmiValEl) bmiValEl.textContent = bmi.value;
  if (bmiBadgeEl) {
    bmiBadgeEl.textContent = bmi.category;
    bmiBadgeEl.className = `badge ${bmi.badgeClass}`;
  }
  if (bmiDescEl) bmiDescEl.textContent = bmi.description;

  // Position pointer on the 10 - 40 BMI gauge scale
  if (bmiPointerEl) {
    // 10 is 0%, 40 is 100%
    const gaugePct = Math.max(0, Math.min(100, ((bmi.value - 10) / 30) * 100));
    bmiPointerEl.style.left = `${gaugePct}%`;
  }

  // 2. Calculations: Mifflin-St Jeor BMR & Calorie Target
  const bmr = StorageService.calculateBMR(user.gender, user.weight, user.height, user.age);
  const targetCalories = StorageService.calculateDailyCalorieTarget(user);

  let activityMultiplier = 1.2;
  switch (user.activityLevel) {
    case 'Sedentary': activityMultiplier = 1.2; break;
    case 'Lightly Active': activityMultiplier = 1.375; break;
    case 'Moderately Active': activityMultiplier = 1.55; break;
    case 'Very Active': activityMultiplier = 1.725; break;
  }
  const maintenance = Math.round(bmr * activityMultiplier);
  const macroTargets = StorageService.calculateMacroTargets(targetCalories, user.fitnessGoal);

  const bmrEl = document.getElementById('profileBmrVal');
  const maintEl = document.getElementById('profileMaintVal');
  const targetCalEl = document.getElementById('profileTargetCalVal');
  const goalAdjustmentEl = document.getElementById('profileGoalAdjVal');

  if (bmrEl) bmrEl.textContent = `${bmr.toLocaleString()} kcal/day`;
  if (maintEl) maintEl.textContent = `${maintenance.toLocaleString()} kcal/day`;
  if (targetCalEl) targetCalEl.textContent = `${targetCalories.toLocaleString()} kcal/day`;

  if (goalAdjustmentEl) {
    if (user.fitnessGoal === 'Weight Loss') {
      goalAdjustmentEl.textContent = '-300 kcal (Caloric Deficit for steady fat loss)';
      goalAdjustmentEl.style.color = '#176B4D';
    } else if (user.fitnessGoal === 'Weight Gain') {
      goalAdjustmentEl.textContent = '+300 kcal (Caloric Surplus for muscle building)';
      goalAdjustmentEl.style.color = '#2563EB';
    } else {
      goalAdjustmentEl.textContent = '0 kcal (Maintenance equilibrium)';
      goalAdjustmentEl.style.color = 'var(--text-secondary)';
    }
  }

  // Target Macros
  const targetProtEl = document.getElementById('profileTargetProt');
  const targetCarbsEl = document.getElementById('profileTargetCarbs');
  const targetFatEl = document.getElementById('profileTargetFat');

  if (targetProtEl) targetProtEl.textContent = `${macroTargets.protein}g (${macroTargets.ratios.protein}%)`;
  if (targetCarbsEl) targetCarbsEl.textContent = `${macroTargets.carbohydrates}g (${macroTargets.ratios.carbs}%)`;
  if (targetFatEl) targetFatEl.textContent = `${macroTargets.fat}g (${macroTargets.ratios.fat}%)`;

  // 3. Populate Edit Form Inputs
  const nameInput = document.getElementById('editFullName');
  const ageInput = document.getElementById('editAge');
  const genderInput = document.getElementById('editGender');
  const heightInput = document.getElementById('editHeight');
  const weightInput = document.getElementById('editWeight');
  const activityInput = document.getElementById('editActivity');
  const goalInput = document.getElementById('editGoal');

  if (nameInput) nameInput.value = user.fullName || '';
  if (ageInput) ageInput.value = user.age || 25;
  if (genderInput) genderInput.value = user.gender || 'Male';
  if (heightInput) heightInput.value = user.height || 170;
  if (weightInput) weightInput.value = user.weight || 70;
  if (activityInput) activityInput.value = user.activityLevel || 'Moderately Active';
  if (goalInput) goalInput.value = user.fitnessGoal || 'Weight Loss';
}

function bindProfileFormEvents() {
  const form = document.getElementById('profileEditForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = StorageService.getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById('editFullName').value.trim();
    const age = parseInt(document.getElementById('editAge').value, 10);
    const gender = document.getElementById('editGender').value;
    const height = parseFloat(document.getElementById('editHeight').value);
    const weight = parseFloat(document.getElementById('editWeight').value);
    const activityLevel = document.getElementById('editActivity').value;
    const fitnessGoal = document.getElementById('editGoal').value;

    if (!fullName) {
      NutriApp.showToast('Full Name cannot be empty.', 'error');
      return;
    }
    if (isNaN(age) || age < 10 || age > 120) {
      NutriApp.showToast('Please enter a valid age between 10 and 120.', 'error');
      return;
    }
    if (isNaN(height) || height < 80 || height > 260) {
      NutriApp.showToast('Please enter a valid height in cm (80 - 260 cm).', 'error');
      return;
    }
    if (isNaN(weight) || weight < 25 || weight > 350) {
      NutriApp.showToast('Please enter a valid weight in kg (25 - 350 kg).', 'error');
      return;
    }

    try {
      const updated = StorageService.updateUserProfile(user.userId, {
        fullName,
        age,
        gender,
        height,
        weight,
        activityLevel,
        fitnessGoal
      });

      NutriApp.currentUser = updated;
      NutriApp.bindHeaderInfo();
      renderUserProfileData();

      NutriApp.showToast('Profile updated! New calorie & macro targets applied.', 'success');
    } catch (err) {
      NutriApp.showToast(err.message, 'error');
    }
  });

  // Export data button
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const user = StorageService.getCurrentUser();
      const meals = StorageService.getUserMeals(user.userId);
      const payload = {
        user,
        meals,
        exportedAt: new Date().toISOString(),
        version: 'NutriTrack-MVP-v1'
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutritrack_${user.fullName.replace(/\s+/g, '_')}_data.json`;
      a.click();
      URL.revokeObjectURL(url);
      NutriApp.showToast('NutriTrack data exported as JSON.', 'success');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profilePageMarker')) {
    initProfilePage();
  }
});


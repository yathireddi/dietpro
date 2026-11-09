/**
 * NutriTrack - Core App & UI Orchestrator
 * Shared layout behavior, toasts, navigation highlight, and quick-add modal.
 */

const NutriApp = {
  currentUser: null,

  init: function() {
    this.currentUser = StorageService.getCurrentUser();
    this.bindHeaderInfo();
    this.highlightActiveNav();
    this.bindSidebarToggle();
    this.bindGlobalLogout();
    this.initQuickAddModal();
  },

  /**
   * Updates user welcome text, avatar initials, and current date
   */
  bindHeaderInfo: function() {
    const user = this.currentUser;
    const nameEls = document.querySelectorAll('.user-display-name');
    const emailEls = document.querySelectorAll('.user-display-email');
    const avatarEls = document.querySelectorAll('.user-avatar-initials');
    const dateEls = document.querySelectorAll('.current-date-display');

    if (user) {
      nameEls.forEach(el => el.textContent = user.fullName || 'User');
      emailEls.forEach(el => el.textContent = user.email || '');
      
      const initials = (user.fullName || 'NT')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      avatarEls.forEach(el => el.textContent = initials);
    }

    // Format readable date: "Monday, Nov 9, 2026"
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const dateFormatted = today.toLocaleDateString('en-US', options);
    dateEls.forEach(el => el.textContent = dateFormatted);
  },

  /**
   * Highlights current navigation item based on path
   */
  highlightActiveNav: function() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  /**
   * Sidebar toggle for mobile responsive view
   */
  bindSidebarToggle: function() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    };

    if (overlay) overlay.addEventListener('click', closeSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  },

  /**
   * Global logout triggers
   */
  bindGlobalLogout: function() {
    const logoutBtns = document.querySelectorAll('.action-logout');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out of NutriTrack?')) {
          AuthService.handleLogout();
        }
      });
    });
  },

  /**
   * Global Toast Notification Manager
   */
  showToast: function(message, type = 'success', duration = 3500) {
    let container = document.getElementById('nutriToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'nutriToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconClass = 'bi-check-circle-fill';
    if (type === 'error') iconClass = 'bi-x-circle-fill';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill';
    if (type === 'info') iconClass = 'bi-info-circle-fill';

    toast.innerHTML = `
      <i class="bi ${iconClass} toast-icon"></i>
      <div class="toast-content">${message}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    const removeToast = () => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
  },

  /**
   * Quick Add Food Modal Setup (Shared)
   */
  initQuickAddModal: function() {
    const modalEl = document.getElementById('quickAddMealModal');
    if (!modalEl) return;

    const foodSelect = document.getElementById('quickFoodSelect');
    const mealTypeSelect = document.getElementById('quickMealType');
    const quantityInput = document.getElementById('quickQuantity');
    const form = document.getElementById('quickAddMealForm');

    // Populate food select options if empty
    if (foodSelect && foodSelect.children.length <= 1) {
      const foods = FoodService.getAllFoods();
      foods.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.foodId;
        opt.textContent = `${f.foodName} (${f.category}) - ${f.calories} kcal/100g`;
        foodSelect.appendChild(opt);
      });
    }

    // Dynamic preview of nutrients
    const updatePreview = () => {
      const foodId = foodSelect ? foodSelect.value : '';
      const qty = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
      const previewEl = document.getElementById('quickNutrientPreview');

      if (!previewEl) return;

      if (!foodId || qty <= 0) {
        previewEl.innerHTML = '<span class="text-muted">Enter food and quantity to calculate calories & macros.</span>';
        return;
      }

      const food = FoodService.getFoodById(foodId);
      if (!food) return;

      const nutrients = FoodService.calculateNutrients(food, qty);
      previewEl.innerHTML = `
        <div class="quick-calc-grid">
          <div class="stat-pill"><span class="pill-label">Calories</span> <strong>${nutrients.calories} kcal</strong></div>
          <div class="stat-pill"><span class="pill-label">Protein</span> <strong>${nutrients.protein}g</strong></div>
          <div class="stat-pill"><span class="pill-label">Carbs</span> <strong>${nutrients.carbohydrates}g</strong></div>
          <div class="stat-pill"><span class="pill-label">Fat</span> <strong>${nutrients.fat}g</strong></div>
        </div>
      `;
    };

    if (foodSelect) foodSelect.addEventListener('change', updatePreview);
    if (quantityInput) quantityInput.addEventListener('input', updatePreview);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const foodId = foodSelect.value;
        const mealType = mealTypeSelect.value;
        const quantity = parseFloat(quantityInput.value);

        if (!foodId) {
          NutriApp.showToast('Please select a food item.', 'error');
          return;
        }
        if (!quantity || quantity <= 0) {
          NutriApp.showToast('Please enter a valid quantity in grams.', 'error');
          return;
        }

        const food = FoodService.getFoodById(foodId);
        const nutrients = FoodService.calculateNutrients(food, quantity);
        const todayStr = StorageService.formatLocalDate(new Date());

        try {
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
            date: todayStr
          });

          NutriApp.showToast(`Logged ${food.foodName} (${quantity}g) to ${mealType}!`, 'success');
          NutriApp.closeModal('quickAddMealModal');
          form.reset();
          updatePreview();

          // If on a page with reload hooks (dashboard, meals, history), trigger them
          if (typeof window.refreshCurrentPageData === 'function') {
            window.refreshCurrentPageData();
          }
        } catch (err) {
          NutriApp.showToast(err.message, 'error');
        }
      });
    }
  },

  openModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
};

// Global DOM Ready Hook
document.addEventListener('DOMContentLoaded', () => {
  NutriApp.init();

  // Close modals on data-dismiss click or backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });
});

window.NutriApp = NutriApp;


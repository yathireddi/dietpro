/**
 * NutriTrack - Storage & Calculation Engine
 * LocalStorage wrapper with user separation, nutritional calculations,
 * and data models ready for future Spring Boot / MySQL REST APIs.
 */

const STORAGE_KEYS = {
  USERS: 'nutritrack_users',
  MEALS: 'nutritrack_meals',
  CURRENT_USER: 'nutritrack_current_user',
  REMEMBERED_EMAIL: 'nutritrack_remembered_email',
  INITIALIZED: 'nutritrack_initialized_v2'
};

const StorageService = {
  // ----------------------------------------------------
  // INITIALIZATION & SEED DATA
  // ----------------------------------------------------
  init: function() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEALS)) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.seedDemoData();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  seedDemoData: function() {
    // 1. Create Demo User
    const demoUser = {
      userId: 'usr_demo_101',
      fullName: 'Alex Morgan',
      email: 'demo@nutritrack.com',
      password: 'password123', // NOTE: Demo localStorage simulation only
      age: 26,
      gender: 'Male',
      height: 178, // cm
      weight: 74,  // kg
      activityLevel: 'Moderately Active',
      fitnessGoal: 'Weight Loss',
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    if (!users.some(u => u.email === demoUser.email)) {
      users.push(demoUser);
      this.saveUsers(users);
    }

    // 2. Pre-populate 7 days of realistic meals for demo user
    const today = new Date();
    const existingMeals = this.getAllMeals();
    const demoMeals = [];

    // Function to format date string YYYY-MM-DD
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Day 0 (Today) meals
    const todayStr = formatDate(today);
    demoMeals.push(
      {
        mealId: 'meal_demo_01',
        userId: demoUser.userId,
        foodId: 'food_13',
        foodName: 'Oats',
        category: 'Grains',
        mealType: 'Breakfast',
        quantity: 60,
        calories: 233,
        protein: 10.1,
        carbohydrates: 39.8,
        fat: 4.1,
        fiber: 6.4,
        date: todayStr,
        time: '08:30',
        createdAt: new Date(today.setHours(8, 30, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_02',
        userId: demoUser.userId,
        foodId: 'food_16',
        foodName: 'Whole Milk',
        category: 'Dairy',
        mealType: 'Breakfast',
        quantity: 200,
        calories: 122,
        protein: 6.4,
        carbohydrates: 9.6,
        fat: 6.6,
        fiber: 0.0,
        date: todayStr,
        time: '08:35',
        createdAt: new Date(today.setHours(8, 35, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_03',
        userId: demoUser.userId,
        foodId: 'food_1',
        foodName: 'Apple',
        category: 'Fruits',
        mealType: 'Breakfast',
        quantity: 150,
        calories: 78,
        protein: 0.5,
        carbohydrates: 20.7,
        fat: 0.3,
        fiber: 3.6,
        date: todayStr,
        time: '08:45',
        createdAt: new Date(today.setHours(8, 45, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_04',
        userId: demoUser.userId,
        foodId: 'food_21',
        foodName: 'Chicken Breast',
        category: 'Protein',
        mealType: 'Lunch',
        quantity: 160,
        calories: 264,
        protein: 49.6,
        carbohydrates: 0.0,
        fat: 5.8,
        fiber: 0.0,
        date: todayStr,
        time: '13:15',
        createdAt: new Date(today.setHours(13, 15, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_05',
        userId: demoUser.userId,
        foodId: 'food_12',
        foodName: 'Brown Rice',
        category: 'Grains',
        mealType: 'Lunch',
        quantity: 150,
        calories: 167,
        protein: 3.9,
        carbohydrates: 34.5,
        fat: 1.4,
        fiber: 2.7,
        date: todayStr,
        time: '13:20',
        createdAt: new Date(today.setHours(13, 20, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_06',
        userId: demoUser.userId,
        foodId: 'food_7',
        foodName: 'Broccoli',
        category: 'Vegetables',
        mealType: 'Lunch',
        quantity: 120,
        calories: 41,
        protein: 3.4,
        carbohydrates: 7.9,
        fat: 0.5,
        fiber: 3.1,
        date: todayStr,
        time: '13:25',
        createdAt: new Date(today.setHours(13, 25, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_07',
        userId: demoUser.userId,
        foodId: 'food_26',
        foodName: 'Almonds',
        category: 'Snacks',
        mealType: 'Snacks',
        quantity: 25,
        calories: 145,
        protein: 5.3,
        carbohydrates: 5.4,
        fat: 12.5,
        fiber: 3.1,
        date: todayStr,
        time: '16:30',
        createdAt: new Date(today.setHours(16, 30, 0, 0)).toISOString()
      },
      {
        mealId: 'meal_demo_08',
        userId: demoUser.userId,
        foodId: 'food_31',
        foodName: 'Green Tea',
        category: 'Beverages',
        mealType: 'Snacks',
        quantity: 250,
        calories: 3,
        protein: 0.5,
        carbohydrates: 0.0,
        fat: 0.0,
        fiber: 0.0,
        date: todayStr,
        time: '16:35',
        createdAt: new Date(today.setHours(16, 35, 0, 0)).toISOString()
      }
    );

    // Past 6 days meals (Days 1 to 6 back)
    const pastMealsSamples = [
      // Day -1 (Yesterday)
      [
        { foodId: 'food_20', name: 'Whole Egg', cat: 'Protein', type: 'Breakfast', q: 150, cal: 215, p: 18.9, c: 1.1, f: 14.3, fib: 0 },
        { foodId: 'food_14', name: 'Whole Wheat Bread', cat: 'Grains', type: 'Breakfast', q: 76, cal: 188, p: 9.9, c: 31.2, f: 2.6, fib: 5.3 },
        { foodId: 'food_23', name: 'Lentils (Dal)', cat: 'Protein', type: 'Lunch', q: 200, cal: 232, p: 18.0, c: 40.2, f: 0.8, fib: 15.8 },
        { foodId: 'food_11', name: 'White Rice', cat: 'Grains', type: 'Lunch', q: 150, cal: 195, p: 4.1, c: 42.3, f: 0.5, fib: 0.6 },
        { foodId: 'food_6', name: 'Spinach', cat: 'Vegetables', type: 'Dinner', q: 150, cal: 35, p: 4.4, c: 5.4, f: 0.6, fib: 3.3 },
        { foodId: 'food_19', name: 'Paneer (Cottage Cheese)', cat: 'Dairy', type: 'Dinner', q: 100, cal: 265, p: 18.3, c: 3.4, f: 20.8, fib: 0 },
        { foodId: 'food_28', name: 'Roasted Makhana (Fox Nuts)', cat: 'Snacks', type: 'Snacks', q: 30, cal: 104, p: 2.9, c: 23.1, f: 0.0, fib: 4.4 }
      ],
      // Day -2
      [
        { foodId: 'food_18', name: 'Greek Yogurt', cat: 'Dairy', type: 'Breakfast', q: 200, cal: 118, p: 20.0, c: 7.2, f: 0.8, fib: 0 },
        { foodId: 'food_2', name: 'Banana', cat: 'Fruits', type: 'Breakfast', q: 120, cal: 107, p: 1.3, c: 27.4, f: 0.4, fib: 3.1 },
        { foodId: 'food_22', name: 'Fish (Salmon)', cat: 'Protein', type: 'Lunch', q: 170, cal: 354, p: 34.7, c: 0.0, fat: 22.8, fib: 0 },
        { foodId: 'food_9', name: 'Sweet Potato', cat: 'Vegetables', type: 'Lunch', q: 150, cal: 129, p: 2.4, c: 30.2, f: 0.2, fib: 4.5 },
        { foodId: 'food_24', name: 'Chickpeas (Chana)', cat: 'Dinner', q: 180, cal: 295, p: 16.0, c: 49.3, f: 4.7, fib: 13.7 },
        { foodId: 'food_27', name: 'Peanuts', cat: 'Snacks', type: 'Snacks', q: 30, cal: 170, p: 7.7, c: 4.8, f: 14.8, fib: 2.6 }
      ],
      // Day -3
      [
        { foodId: 'food_13', name: 'Oats', cat: 'Grains', type: 'Breakfast', q: 50, cal: 195, p: 8.5, c: 33.2, f: 3.5, fib: 5.3 },
        { foodId: 'food_17', name: 'Curd (Indian Yogurt)', cat: 'Dairy', type: 'Lunch', q: 150, cal: 90, p: 5.3, c: 7.1, f: 4.8, fib: 0 },
        { foodId: 'food_21', name: 'Chicken Breast', cat: 'Lunch', q: 180, cal: 297, p: 55.8, c: 0.0, f: 6.5, fib: 0 },
        { foodId: 'food_15', name: 'Quinoa', cat: 'Dinner', q: 150, cal: 180, p: 6.6, c: 32.0, f: 2.9, fib: 4.2 },
        { foodId: 'food_25', name: 'Tofu', cat: 'Dinner', q: 120, cal: 91, p: 9.7, c: 2.3, f: 5.8, fib: 0.4 },
        { foodId: 'food_4', name: 'Papaya', cat: 'Snacks', type: 'Snacks', q: 150, cal: 65, p: 0.8, c: 16.2, f: 0.5, fib: 2.6 }
      ],
      // Day -4
      [
        { foodId: 'food_20', name: 'Whole Egg', cat: 'Protein', type: 'Breakfast', q: 100, cal: 143, p: 12.6, c: 0.7, f: 9.5, fib: 0 },
        { foodId: 'food_14', name: 'Whole Wheat Bread', cat: 'Grains', type: 'Breakfast', q: 76, cal: 188, p: 9.9, c: 31.2, f: 2.6, fib: 5.3 },
        { foodId: 'food_21', name: 'Chicken Breast', cat: 'Lunch', q: 150, cal: 248, p: 46.5, c: 0.0, f: 5.4, fib: 0 },
        { foodId: 'food_12', name: 'Brown Rice', cat: 'Grains', type: 'Lunch', q: 150, cal: 167, p: 3.9, c: 34.5, f: 1.4, fib: 2.7 },
        { foodId: 'food_23', name: 'Lentils (Dal)', cat: 'Dinner', q: 220, cal: 255, p: 19.8, c: 44.2, f: 0.9, fib: 17.4 },
        { foodId: 'food_3', name: 'Orange', cat: 'Snacks', type: 'Snacks', q: 130, cal: 61, p: 1.2, c: 15.3, f: 0.1, fib: 3.1 }
      ],
      // Day -5
      [
        { foodId: 'food_13', name: 'Oats', cat: 'Grains', type: 'Breakfast', q: 60, cal: 233, p: 10.1, c: 39.8, f: 4.1, fib: 6.4 },
        { foodId: 'food_16', name: 'Whole Milk', cat: 'Dairy', type: 'Breakfast', q: 200, cal: 122, p: 6.4, c: 9.6, f: 6.6, fib: 0 },
        { foodId: 'food_19', name: 'Paneer (Cottage Cheese)', cat: 'Dairy', type: 'Lunch', q: 120, cal: 318, p: 22.0, c: 4.1, f: 25.0, fib: 0 },
        { foodId: 'food_11', name: 'White Rice', cat: 'Grains', type: 'Lunch', q: 150, cal: 195, p: 4.1, c: 42.3, f: 0.5, fib: 0.6 },
        { foodId: 'food_24', name: 'Chickpeas (Chana)', cat: 'Dinner', q: 170, cal: 279, p: 15.1, c: 46.6, f: 4.4, fib: 12.9 },
        { foodId: 'food_32', name: 'Coconut Water', cat: 'Beverages', type: 'Snacks', q: 240, cal: 46, p: 1.7, c: 8.9, f: 0.5, fib: 2.6 }
      ],
      // Day -6
      [
        { foodId: 'food_20', name: 'Whole Egg', cat: 'Protein', type: 'Breakfast', q: 150, cal: 215, p: 18.9, c: 1.1, f: 14.3, fib: 0 },
        { foodId: 'food_5', name: 'Avocado', cat: 'Fruits', type: 'Breakfast', q: 80, cal: 128, p: 1.6, c: 6.8, f: 11.8, fib: 5.4 },
        { foodId: 'food_22', name: 'Fish (Salmon)', cat: 'Protein', type: 'Lunch', q: 160, cal: 333, p: 32.6, c: 0.0, f: 21.4, fib: 0 },
        { foodId: 'food_7', name: 'Broccoli', cat: 'Vegetables', type: 'Lunch', q: 150, cal: 51, p: 4.2, c: 9.9, f: 0.6, fib: 3.9 },
        { foodId: 'food_23', name: 'Lentils (Dal)', cat: 'Dinner', q: 200, cal: 232, p: 18.0, c: 40.2, f: 0.8, fib: 15.8 },
        { foodId: 'food_26', name: 'Almonds', cat: 'Snacks', type: 'Snacks', q: 25, cal: 145, p: 5.3, c: 5.4, f: 12.5, fib: 3.1 }
      ]
    ];

    pastMealsSamples.forEach((dayItems, dayOffset) => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (dayOffset + 1));
      const pastDateStr = formatDate(pastDate);

      dayItems.forEach((item, index) => {
        demoMeals.push({
          mealId: `meal_demo_${dayOffset + 1}_${index + 1}`,
          userId: demoUser.userId,
          foodId: item.foodId,
          foodName: item.name,
          category: item.cat,
          mealType: item.type,
          quantity: item.q,
          calories: item.cal,
          protein: item.p,
          carbohydrates: item.c,
          fat: item.f !== undefined ? item.f : 0,
          fiber: item.fib !== undefined ? item.fib : 0,
          date: pastDateStr,
          time: '12:00',
          createdAt: pastDate.toISOString()
        });
      });
    });

    // Merge without wiping if any existed
    const merged = [...existingMeals, ...demoMeals];
    this.saveMeals(merged);

    // Set demo user as current session default if none is set
    if (!this.getCurrentUser()) {
      this.setCurrentUser(demoUser);
    }
  },

  // ----------------------------------------------------
  // USER STORAGE & AUTHENTICATION
  // ----------------------------------------------------
  getUsers: function() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch (e) {
      console.error('Error reading users from storage', e);
      return [];
    }
  },

  saveUsers: function(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  findUserByEmail: function(email) {
    if (!email) return null;
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findUserById: function(userId) {
    if (!userId) return null;
    const users = this.getUsers();
    return users.find(u => u.userId === userId) || null;
  },

  registerUser: function(userData) {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      userId: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password, // Frontend demo storage
      age: parseInt(userData.age, 10),
      gender: userData.gender, // 'Male' | 'Female'
      height: parseFloat(userData.height), // cm
      weight: parseFloat(userData.weight), // kg
      activityLevel: userData.activityLevel, // 'Sedentary', etc.
      fitnessGoal: userData.fitnessGoal, // 'Weight Loss', etc.
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUserProfile: function(userId, updatedData) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx === -1) {
      throw new Error('User not found.');
    }

    const currentUser = users[idx];
    const updated = {
      ...currentUser,
      fullName: updatedData.fullName !== undefined ? updatedData.fullName.trim() : currentUser.fullName,
      age: updatedData.age !== undefined ? parseInt(updatedData.age, 10) : currentUser.age,
      gender: updatedData.gender !== undefined ? updatedData.gender : currentUser.gender,
      height: updatedData.height !== undefined ? parseFloat(updatedData.height) : currentUser.height,
      weight: updatedData.weight !== undefined ? parseFloat(updatedData.weight) : currentUser.weight,
      activityLevel: updatedData.activityLevel !== undefined ? updatedData.activityLevel : currentUser.activityLevel,
      fitnessGoal: updatedData.fitnessGoal !== undefined ? updatedData.fitnessGoal : currentUser.fitnessGoal,
      updatedAt: new Date().toISOString()
    };

    users[idx] = updated;
    this.saveUsers(users);

    // Sync session
    const session = this.getCurrentUser();
    if (session && session.userId === userId) {
      this.setCurrentUser(updated);
    }

    return updated;
  },

  // ----------------------------------------------------
  // SESSION MANAGEMENT
  // ----------------------------------------------------
  getCurrentUser: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: function(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  logout: function() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  isAuthenticated: function() {
    return !!this.getCurrentUser();
  },

  getRememberedEmail: function() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';
  },

  setRememberedEmail: function(email) {
    if (email) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }
  },

  // ----------------------------------------------------
  // MEALS CRUD
  // ----------------------------------------------------
  getAllMeals: function() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEALS) || '[]');
    } catch (e) {
      return [];
    }
  },

  saveMeals: function(meals) {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  },

  getUserMeals: function(userId, dateFilter = null) {
    if (!userId) return [];
    let meals = this.getAllMeals().filter(m => m.userId === userId);
    if (dateFilter) {
      meals = meals.filter(m => m.date === dateFilter);
    }
    // Sort chronologically (time asc)
    return meals.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  },

  getUserMealsByDateRange: function(userId, startDate, endDate) {
    if (!userId) return [];
    const meals = this.getAllMeals().filter(m => {
      if (m.userId !== userId) return false;
      return m.date >= startDate && m.date <= endDate;
    });
    return meals.sort((a, b) => a.date.localeCompare(b.date));
  },

  getMealById: function(mealId) {
    const meals = this.getAllMeals();
    return meals.find(m => m.mealId === mealId) || null;
  },

  addMeal: function(mealData) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Must be logged in to record meals.');

    const newMeal = {
      mealId: 'meal_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: user.userId,
      foodId: mealData.foodId,
      foodName: mealData.foodName,
      category: mealData.category || 'Other',
      mealType: mealData.mealType, // 'Breakfast', 'Lunch', 'Dinner', 'Snacks'
      quantity: parseFloat(mealData.quantity),
      calories: Math.round(mealData.calories),
      protein: +(parseFloat(mealData.protein) || 0).toFixed(1),
      carbohydrates: +(parseFloat(mealData.carbohydrates) || 0).toFixed(1),
      fat: +(parseFloat(mealData.fat) || 0).toFixed(1),
      fiber: +(parseFloat(mealData.fiber) || 0).toFixed(1),
      date: mealData.date, // 'YYYY-MM-DD'
      time: mealData.time || new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    };

    const meals = this.getAllMeals();
    meals.push(newMeal);
    this.saveMeals(meals);
    return newMeal;
  },

  updateMeal: function(mealId, updatedData) {
    const meals = this.getAllMeals();
    const index = meals.findIndex(m => m.mealId === mealId);
    if (index === -1) throw new Error('Meal record not found.');

    const current = meals[index];
    const updated = {
      ...current,
      foodId: updatedData.foodId || current.foodId,
      foodName: updatedData.foodName || current.foodName,
      category: updatedData.category || current.category,
      mealType: updatedData.mealType || current.mealType,
      quantity: updatedData.quantity !== undefined ? parseFloat(updatedData.quantity) : current.quantity,
      calories: updatedData.calories !== undefined ? Math.round(updatedData.calories) : current.calories,
      protein: updatedData.protein !== undefined ? +(parseFloat(updatedData.protein)).toFixed(1) : current.protein,
      carbohydrates: updatedData.carbohydrates !== undefined ? +(parseFloat(updatedData.carbohydrates)).toFixed(1) : current.carbohydrates,
      fat: updatedData.fat !== undefined ? +(parseFloat(updatedData.fat)).toFixed(1) : current.fat,
      fiber: updatedData.fiber !== undefined ? +(parseFloat(updatedData.fiber)).toFixed(1) : current.fiber,
      date: updatedData.date || current.date,
      time: updatedData.time || current.time,
      updatedAt: new Date().toISOString()
    };

    meals[index] = updated;
    this.saveMeals(meals);
    return updated;
  },

  deleteMeal: function(mealId) {
    const meals = this.getAllMeals();
    const filtered = meals.filter(m => m.mealId !== mealId);
    this.saveMeals(filtered);
    return true;
  },

  // ----------------------------------------------------
  // NUTRITIONAL CALCULATIONS (MSJ, BMI, TARGETS)
  // ----------------------------------------------------
  /**
   * BMI Calculation: Weight (kg) / (Height (m))^2
   */
  calculateBMI: function(weightKg, heightCm) {
    if (!weightKg || !heightCm || heightCm <= 0) {
      return { value: 0, category: 'Unknown', badgeClass: 'badge-secondary', description: 'N/A' };
    }
    const heightM = heightCm / 100;
    const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

    let category = '';
    let badgeClass = '';
    let description = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      badgeClass = 'badge-warning';
      description = 'Below normal weight range. Focus on nutrient-rich foods to reach a healthy weight.';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = 'Normal range';
      badgeClass = 'badge-success';
      description = 'Healthy weight range. Maintain balanced meals and regular physical activity.';
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = 'Overweight';
      badgeClass = 'badge-warning';
      description = 'Above normal weight range. A mild caloric deficit and active lifestyle are recommended.';
    } else {
      category = 'Obesity range';
      badgeClass = 'badge-danger';
      description = 'Substantially above recommended weight range. Structured nutritional balancing is advised.';
    }

    return { value: bmi, category, badgeClass, description };
  },

  /**
   * Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation:
   * Male: BMR = 10 * weight + 6.25 * height - 5 * age + 5
   * Female: BMR = 10 * weight + 6.25 * height - 5 * age - 161
   */
  calculateBMR: function(gender, weightKg, heightCm, age) {
    const w = parseFloat(weightKg) || 70;
    const h = parseFloat(heightCm) || 170;
    const a = parseInt(age, 10) || 25;

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    if (gender && gender.toLowerCase() === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }
    return Math.round(bmr);
  },

  /**
   * Estimated Daily Calorie Requirement
   * Maintenance = BMR * Activity Factor
   * Goal Adjustment:
   *  - Weight Loss: -300 kcal
   *  - Maintenance: 0 kcal
   *  - Weight Gain: +300 kcal
   */
  calculateDailyCalorieTarget: function(user) {
    if (!user) return 2000;

    const bmr = this.calculateBMR(user.gender, user.weight, user.height, user.age);

    let activityMultiplier = 1.2; // Sedentary default
    switch (user.activityLevel) {
      case 'Sedentary':
        activityMultiplier = 1.2;
        break;
      case 'Lightly Active':
        activityMultiplier = 1.375;
        break;
      case 'Moderately Active':
        activityMultiplier = 1.55;
        break;
      case 'Very Active':
        activityMultiplier = 1.725;
        break;
      default:
        activityMultiplier = 1.375;
    }

    const maintenance = Math.round(bmr * activityMultiplier);
    let target = maintenance;

    if (user.fitnessGoal === 'Weight Loss') {
      target = maintenance - 300;
    } else if (user.fitnessGoal === 'Weight Gain') {
      target = maintenance + 300;
    }

    // Safety floor
    const minSafe = user.gender === 'Female' ? 1200 : 1500;
    return Math.max(target, minSafe);
  },

  /**
   * Macro Targets based on calorie goal & fitness goal
   */
  calculateMacroTargets: function(calories, fitnessGoal) {
    let pRatio = 0.25; // 25% protein
    let cRatio = 0.50; // 50% carbs
    let fRatio = 0.25; // 25% fat

    if (fitnessGoal === 'Weight Loss') {
      pRatio = 0.30;
      cRatio = 0.40;
      fRatio = 0.30;
    } else if (fitnessGoal === 'Weight Gain') {
      pRatio = 0.25;
      cRatio = 0.55;
      fRatio = 0.20;
    }

    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const proteinGrams = Math.round((calories * pRatio) / 4);
    const carbsGrams = Math.round((calories * cRatio) / 4);
    const fatGrams = Math.round((calories * fRatio) / 9);

    return {
      calories,
      protein: proteinGrams,
      carbohydrates: carbsGrams,
      fat: fatGrams,
      ratios: {
        protein: Math.round(pRatio * 100),
        carbs: Math.round(cRatio * 100),
        fat: Math.round(fRatio * 100)
      }
    };
  },

  /**
   * Sums nutritional totals for a list of meals
   */
  calculateDayTotals: function(meals) {
    return (meals || []).reduce(
      (acc, m) => {
        acc.calories += Number(m.calories) || 0;
        acc.protein += Number(m.protein) || 0;
        acc.carbohydrates += Number(m.carbohydrates) || 0;
        acc.fat += Number(m.fat) || 0;
        acc.fiber += Number(m.fiber) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );
  },

  /**
   * Formats a Date object to YYYY-MM-DD in local time
   */
  formatLocalDate: function(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Initialize default storage on load
StorageService.init();

// Expose globally
window.StorageService = StorageService;
window.STORAGE_KEYS = STORAGE_KEYS;


/**
 * NutriTrack - Food Database (Sample Data)
 * Academic MVP - Ready for future REST API / MySQL integration
 * Nutritional values are per 100g (edible portion).
 */

const DEFAULT_FOODS = [
  {
    foodId: 'food_1',
    foodName: 'Apple',
    category: 'Fruits',
    calories: 52,
    protein: 0.3,
    carbohydrates: 13.8,
    fat: 0.2,
    fiber: 2.4,
    prepMethod: 'Raw with skin',
    icon: 'bi-apple',
    servingHint: '1 medium apple (~180g)'
  },
  {
    foodId: 'food_2',
    foodName: 'Banana',
    category: 'Fruits',
    calories: 89,
    protein: 1.1,
    carbohydrates: 22.8,
    fat: 0.3,
    fiber: 2.6,
    prepMethod: 'Raw, peeled',
    icon: 'bi-flower2',
    servingHint: '1 medium banana (~120g)'
  },
  {
    foodId: 'food_3',
    foodName: 'Orange',
    category: 'Fruits',
    calories: 47,
    protein: 0.9,
    carbohydrates: 11.8,
    fat: 0.1,
    fiber: 2.4,
    prepMethod: 'Raw, fresh',
    icon: 'bi-brightness-high',
    servingHint: '1 medium orange (~130g)'
  },
  {
    foodId: 'food_4',
    foodName: 'Papaya',
    category: 'Fruits',
    calories: 43,
    protein: 0.5,
    carbohydrates: 10.8,
    fat: 0.3,
    fiber: 1.7,
    prepMethod: 'Fresh cubes',
    icon: 'bi-sun',
    servingHint: '1 cup cubes (~145g)'
  },
  {
    foodId: 'food_5',
    foodName: 'Avocado',
    category: 'Fruits',
    calories: 160,
    protein: 2.0,
    carbohydrates: 8.5,
    fat: 14.7,
    fiber: 6.7,
    prepMethod: 'Fresh sliced',
    icon: 'bi-egg-fill',
    servingHint: '1/2 medium avocado (~100g)'
  },
  {
    foodId: 'food_6',
    foodName: 'Spinach',
    category: 'Vegetables',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 2.2,
    prepMethod: 'Steamed or boiled',
    icon: 'bi-tree',
    servingHint: '1 cup cooked (~180g)'
  },
  {
    foodId: 'food_7',
    foodName: 'Broccoli',
    category: 'Vegetables',
    calories: 34,
    protein: 2.8,
    carbohydrates: 6.6,
    fat: 0.4,
    fiber: 2.6,
    prepMethod: 'Steamed florets',
    icon: 'bi-flower1',
    servingHint: '1 cup chopped (~91g)'
  },
  {
    foodId: 'food_8',
    foodName: 'Carrot',
    category: 'Vegetables',
    calories: 41,
    protein: 0.9,
    carbohydrates: 9.6,
    fat: 0.2,
    fiber: 2.8,
    prepMethod: 'Raw or steamed',
    icon: 'bi-cone-striped',
    servingHint: '1 medium carrot (~60g)'
  },
  {
    foodId: 'food_9',
    foodName: 'Sweet Potato',
    category: 'Vegetables',
    calories: 86,
    protein: 1.6,
    carbohydrates: 20.1,
    fat: 0.1,
    fiber: 3.0,
    prepMethod: 'Baked or boiled with skin',
    icon: 'bi-gem',
    servingHint: '1 medium (~130g)'
  },
  {
    foodId: 'food_10',
    foodName: 'Potato',
    category: 'Vegetables',
    calories: 77,
    protein: 2.0,
    carbohydrates: 17.5,
    fat: 0.1,
    fiber: 2.2,
    prepMethod: 'Boiled without skin',
    icon: 'bi-circle',
    servingHint: '1 medium potato (~150g)'
  },
  {
    foodId: 'food_11',
    foodName: 'White Rice',
    category: 'Grains',
    calories: 130,
    protein: 2.7,
    carbohydrates: 28.2,
    fat: 0.3,
    fiber: 0.4,
    prepMethod: 'Cooked, steamed',
    icon: 'bi-bowl',
    servingHint: '1 cup cooked (~158g)'
  },
  {
    foodId: 'food_12',
    foodName: 'Brown Rice',
    category: 'Grains',
    calories: 111,
    protein: 2.6,
    carbohydrates: 23.0,
    fat: 0.9,
    fiber: 1.8,
    prepMethod: 'Cooked, boiled',
    icon: 'bi-archive',
    servingHint: '1 cup cooked (~195g)'
  },
  {
    foodId: 'food_13',
    foodName: 'Oats',
    category: 'Grains',
    calories: 389,
    protein: 16.9,
    carbohydrates: 66.3,
    fat: 6.9,
    fiber: 10.6,
    prepMethod: 'Rolled dry oats',
    icon: 'bi-cup-hot',
    servingHint: '1/2 cup dry (~40g)'
  },
  {
    foodId: 'food_14',
    foodName: 'Whole Wheat Bread',
    category: 'Grains',
    calories: 247,
    protein: 13.0,
    carbohydrates: 41.0,
    fat: 3.4,
    fiber: 7.0,
    prepMethod: 'Toasted or fresh slice',
    icon: 'bi-square-half',
    servingHint: '1 slice (~38g)'
  },
  {
    foodId: 'food_15',
    foodName: 'Quinoa',
    category: 'Grains',
    calories: 120,
    protein: 4.4,
    carbohydrates: 21.3,
    fat: 1.9,
    fiber: 2.8,
    prepMethod: 'Cooked in water',
    icon: 'bi-dot',
    servingHint: '1 cup cooked (~185g)'
  },
  {
    foodId: 'food_16',
    foodName: 'Whole Milk',
    category: 'Dairy',
    calories: 61,
    protein: 3.2,
    carbohydrates: 4.8,
    fat: 3.3,
    fiber: 0.0,
    prepMethod: 'Pasteurized, 3.25% fat',
    icon: 'bi-cup-straw',
    servingHint: '1 cup (~244g)'
  },
  {
    foodId: 'food_17',
    foodName: 'Curd (Indian Yogurt)',
    category: 'Dairy',
    calories: 60,
    protein: 3.5,
    carbohydrates: 4.7,
    fat: 3.2,
    fiber: 0.0,
    prepMethod: 'Plain whole milk curd',
    icon: 'bi-bucket',
    servingHint: '1 katori / bowl (~150g)'
  },
  {
    foodId: 'food_18',
    foodName: 'Greek Yogurt',
    category: 'Dairy',
    calories: 59,
    protein: 10.0,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 0.0,
    prepMethod: 'Plain, non-fat strained',
    icon: 'bi-shield-shaded',
    servingHint: '1 container (~150g)'
  },
  {
    foodId: 'food_19',
    foodName: 'Paneer (Cottage Cheese)',
    category: 'Dairy',
    calories: 265,
    protein: 18.3,
    carbohydrates: 3.4,
    fat: 20.8,
    fiber: 0.0,
    prepMethod: 'Fresh, raw or lightly sautéed',
    icon: 'bi-square-fill',
    servingHint: 'Standard serving (~100g)'
  },
  {
    foodId: 'food_20',
    foodName: 'Whole Egg',
    category: 'Protein',
    calories: 143,
    protein: 12.6,
    carbohydrates: 0.7,
    fat: 9.5,
    fiber: 0.0,
    prepMethod: 'Boiled or poached',
    icon: 'bi-egg',
    servingHint: '1 large boiled egg (~50g)'
  },
  {
    foodId: 'food_21',
    foodName: 'Chicken Breast',
    category: 'Protein',
    calories: 165,
    protein: 31.0,
    carbohydrates: 0.0,
    fat: 3.6,
    fiber: 0.0,
    prepMethod: 'Grilled skinless, boneless',
    icon: 'bi-heart-pulse',
    servingHint: '1 fillet (~150g)'
  },
  {
    foodId: 'food_22',
    foodName: 'Fish (Salmon)',
    category: 'Protein',
    calories: 208,
    protein: 20.4,
    carbohydrates: 0.0,
    fat: 13.4,
    fiber: 0.0,
    prepMethod: 'Pan-seared or baked',
    icon: 'bi-water',
    servingHint: '1 fillet (~170g)'
  },
  {
    foodId: 'food_23',
    foodName: 'Lentils (Dal)',
    category: 'Protein',
    calories: 116,
    protein: 9.0,
    carbohydrates: 20.1,
    fat: 0.4,
    fiber: 7.9,
    prepMethod: 'Cooked yellow/red dal with spices',
    icon: 'bi-pie-chart',
    servingHint: '1 bowl cooked (~200g)'
  },
  {
    foodId: 'food_24',
    foodName: 'Chickpeas (Chana)',
    category: 'Protein',
    calories: 164,
    protein: 8.9,
    carbohydrates: 27.4,
    fat: 2.6,
    fiber: 7.6,
    prepMethod: 'Boiled / cooked curry',
    icon: 'bi-circle-half',
    servingHint: '1 cup boiled (~164g)'
  },
  {
    foodId: 'food_25',
    foodName: 'Tofu',
    category: 'Protein',
    calories: 76,
    protein: 8.1,
    carbohydrates: 1.9,
    fat: 4.8,
    fiber: 0.3,
    prepMethod: 'Firm, pan-fried lightly',
    icon: 'bi-box',
    servingHint: '1/2 block (~120g)'
  },
  {
    foodId: 'food_26',
    foodName: 'Almonds',
    category: 'Snacks',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.6,
    fat: 49.9,
    fiber: 12.5,
    prepMethod: 'Raw or roasted unsalted',
    icon: 'bi-droplet-half',
    servingHint: 'Small handful (~28g / ~23 nuts)'
  },
  {
    foodId: 'food_27',
    foodName: 'Peanuts',
    category: 'Snacks',
    calories: 567,
    protein: 25.8,
    carbohydrates: 16.1,
    fat: 49.2,
    fiber: 8.5,
    prepMethod: 'Dry roasted unsalted',
    icon: 'bi-capsule',
    servingHint: '1 handful (~30g)'
  },
  {
    foodId: 'food_28',
    foodName: 'Roasted Makhana (Fox Nuts)',
    category: 'Snacks',
    calories: 347,
    protein: 9.7,
    carbohydrates: 76.9,
    fat: 0.1,
    fiber: 14.5,
    prepMethod: 'Dry roasted with rock salt',
    icon: 'bi-cloud',
    servingHint: '1 large bowl (~30g)'
  },
  {
    foodId: 'food_29',
    foodName: 'Mixed Seeds (Chia & Flax)',
    category: 'Snacks',
    calories: 510,
    protein: 18.0,
    carbohydrates: 34.0,
    fat: 38.0,
    fiber: 30.0,
    prepMethod: 'Raw edible seeds',
    icon: 'bi-stars',
    servingHint: '1 tablespoon (~15g)'
  },
  {
    foodId: 'food_30',
    foodName: 'Orange Juice',
    category: 'Beverages',
    calories: 45,
    protein: 0.7,
    carbohydrates: 10.4,
    fat: 0.2,
    fiber: 0.2,
    prepMethod: 'Freshly squeezed, no sugar',
    icon: 'bi-cup',
    servingHint: '1 glass (~240ml)'
  },
  {
    foodId: 'food_31',
    foodName: 'Green Tea',
    category: 'Beverages',
    calories: 1,
    protein: 0.2,
    carbohydrates: 0.0,
    fat: 0.0,
    fiber: 0.0,
    prepMethod: 'Brewed unsweetened',
    icon: 'bi-cup-hot-fill',
    servingHint: '1 mug (~250ml)'
  },
  {
    foodId: 'food_32',
    foodName: 'Coconut Water',
    category: 'Beverages',
    calories: 19,
    protein: 0.7,
    carbohydrates: 3.7,
    fat: 0.2,
    fiber: 1.1,
    prepMethod: 'Natural tender coconut',
    icon: 'bi-tsunami',
    servingHint: '1 glass (~240ml)'
  }
];

// Helper functions for food catalog
const FoodService = {
  getAllFoods: function() {
    const custom = JSON.parse(localStorage.getItem('nutritrack_custom_foods') || '[]');
    return [...DEFAULT_FOODS, ...custom];
  },

  getFoodById: function(id) {
    const all = this.getAllFoods();
    return all.find(f => f.foodId === id) || null;
  },

  getCategories: function() {
    return ['All', 'Fruits', 'Vegetables', 'Grains', 'Dairy', 'Protein', 'Snacks', 'Beverages'];
  },

  searchFoods: function(query = '', category = 'All', sortBy = 'name_asc') {
    let foods = this.getAllFoods();

    if (category && category !== 'All') {
      foods = foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    if (query && query.trim() !== '') {
      const q = query.trim().toLowerCase();
      foods = foods.filter(f => 
        f.foodName.toLowerCase().includes(q) || 
        f.category.toLowerCase().includes(q) ||
        (f.prepMethod && f.prepMethod.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'cal_asc':
        foods.sort((a, b) => a.calories - b.calories);
        break;
      case 'cal_desc':
        foods.sort((a, b) => b.calories - a.calories);
        break;
      case 'protein_desc':
        foods.sort((a, b) => b.protein - a.protein);
        break;
      case 'carbs_desc':
        foods.sort((a, b) => b.carbohydrates - a.carbohydrates);
        break;
      case 'fat_desc':
        foods.sort((a, b) => b.fat - a.fat);
        break;
      case 'name_asc':
      default:
        foods.sort((a, b) => a.foodName.localeCompare(b.foodName));
        break;
    }

    return foods;
  },

  calculateNutrients: function(food, quantityGrams) {
    if (!food || !quantityGrams || quantityGrams <= 0) {
      return { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 };
    }
    const factor = quantityGrams / 100;
    return {
      calories: Math.round(food.calories * factor),
      protein: +(food.protein * factor).toFixed(1),
      carbohydrates: +(food.carbohydrates * factor).toFixed(1),
      fat: +(food.fat * factor).toFixed(1),
      fiber: +(food.fiber * factor).toFixed(1)
    };
  }
};

// Expose globally
window.DEFAULT_FOODS = DEFAULT_FOODS;
window.FoodService = FoodService;


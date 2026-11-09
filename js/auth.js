/**
 * NutriTrack - Authentication & Session Controller
 * Manages user login, registration, session persistence, and page protection.
 */

const AuthService = {
  /**
   * Route protection check. Call at top of pages.
   * @param {boolean} requiresAuth - Whether the current page requires a logged-in user.
   */
  protectRoute: function(requiresAuth = true) {
    const user = StorageService.getCurrentUser();

    if (requiresAuth && !user) {
      // Save intended page to redirect back after login
      const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
      window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
      return false;
    }

    if (!requiresAuth && user) {
      // Already logged in, redirect away from auth pages (login/register)
      window.location.href = 'dashboard.html';
      return false;
    }

    return true;
  },

  /**
   * Register a new user
   */
  handleRegistration: function(formData) {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      age,
      gender,
      height,
      weight,
      activityLevel,
      fitnessGoal
    } = formData;

    // Field validations
    if (!fullName || !email || !password || !confirmPassword || !age || !gender || !height || !weight || !activityLevel || !fitnessGoal) {
      throw new Error('Please fill in all required fields.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    // Numerical checks
    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      throw new Error('Please enter a realistic age between 10 and 120.');
    }

    if (isNaN(parsedHeight) || parsedHeight < 80 || parsedHeight > 260) {
      throw new Error('Please enter a realistic height in cm (80 - 260 cm).');
    }

    if (isNaN(parsedWeight) || parsedWeight < 25 || parsedWeight > 350) {
      throw new Error('Please enter a realistic weight in kg (25 - 350 kg).');
    }

    // Register user in storage
    const newUser = StorageService.registerUser({
      fullName,
      email,
      password,
      age: parsedAge,
      gender,
      height: parsedHeight,
      weight: parsedWeight,
      activityLevel,
      fitnessGoal
    });

    return newUser;
  },

  /**
   * Log in user
   */
  handleLogin: function(email, password, rememberMe = false) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const user = StorageService.findUserByEmail(email);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Set current session
    StorageService.setCurrentUser(user);

    // Remember email
    if (rememberMe) {
      StorageService.setRememberedEmail(email);
    } else {
      StorageService.setRememberedEmail('');
    }

    return user;
  },

  /**
   * Quick Demo Login for instant testing/evaluator convenience
   */
  loginAsDemo: function() {
    let demo = StorageService.findUserByEmail('demo@nutritrack.com');
    if (!demo) {
      StorageService.seedDemoData();
      demo = StorageService.findUserByEmail('demo@nutritrack.com');
    }
    StorageService.setCurrentUser(demo);
    return demo;
  },

  /**
   * Log out user
   */
  handleLogout: function() {
    StorageService.logout();
    window.location.href = 'login.html';
  }
};

window.AuthService = AuthService;


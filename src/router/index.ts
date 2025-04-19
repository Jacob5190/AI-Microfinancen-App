import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import LoanApplication from '../views/LoanApplication.vue';
import LoanReview from '../views/LoanReview.vue';
import Support from '../views/Support.vue';
import BusinessProfile from '../views/BusinessProfile.vue';
import LendingPreferences from '../views/LendingPreferences.vue';
import AICenter from '../views/AICenter.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import BorrowerRegistration from '../views/BorrowerRegistration.vue';
import LenderRegistration from '../views/LenderRegistration.vue';
import AcceptedLoans from '../views/AcceptedLoans.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/borrower-registration',
    name: 'BorrowerRegistration',
    component: BorrowerRegistration
  },
  {
    path: '/lender-registration',
    name: 'LenderRegistration',
    component: LenderRegistration
  },
  {
    path: '/loan-application',
    name: 'LoanApplication',
    component: LoanApplication
  },
  {
    path: '/loan-review',
    name: 'LoanReview',
    component: LoanReview
  },
  {
    path: '/accepted-loans',
    name: 'AcceptedLoans',
    component: AcceptedLoans,
    beforeEnter: (to, from, next) => {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'lender') {
        next();
      } else {
        next('/dashboard');
      }
    }
  },
  {
    path: '/support',
    name: 'Support',
    component: Support
  },
  {
    path: '/business-profile',
    name: 'BusinessProfile',
    component: BusinessProfile
  },
  {
    path: '/lending-preferences',
    name: 'LendingPreferences',
    component: LendingPreferences
  },
  {
    path: '/ai-center',
    name: 'AICenter',
    component: AICenter
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
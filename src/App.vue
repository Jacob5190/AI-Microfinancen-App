<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { logout } from './api/auth';

const route = useRoute();
const router = useRouter();
const userRole = ref('');
const userFirstName = ref('');

// Initialize userRole and userFirstName from localStorage on component mount
onMounted(() => {
  const storedRole = localStorage.getItem('userRole');
  const storedFirstName = localStorage.getItem('userFirstName');
  if (storedRole) {
    userRole.value = storedRole;
  }
  if (storedFirstName) {
    userFirstName.value = storedFirstName;
  }
});

const showNav = computed(() => {
  const publicRoutes = ['/', '/login', '/register', '/borrower-registration', '/lender-registration'];
  return !publicRoutes.includes(route.path);
});

const navigationItems = computed(() => {
  const commonItems = [
    { to: '/dashboard', label: 'Home' }
  ];

  const borrowerItems = [
    { to: '/loan-application', label: 'Apply for Loan' },
    { to: '/business-profile', label: 'Business Profile' },
    { to: '/ai-center', label: 'AI Center' },
    { to: '/support', label: 'Support' }
  ];

  const lenderItems = [
    { to: '/find-match', label: 'Match Borrower' },
    { to: '/accepted-loans', label: 'Accepted Loans' },
    { to: '/lending-preferences', label: 'Lending Preferences' },
    { to: '/support', label: 'Support' }
  ];

  return [
    ...commonItems,
    ...(userRole.value === 'borrower' ? borrowerItems : []),
    ...(userRole.value === 'lender' ? lenderItems : [])
  ];
});

const handleLogout = async () => {
  try {
    await logout();
    userRole.value = ''; // Clear the role on logout
    userFirstName.value = ''; // Clear the first name on logout
    localStorage.clear(); // Clear all stored user data
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <div>
    <nav v-if="showNav" class="bg-gray-800 p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex space-x-4">
          <router-link
            v-for="item in navigationItems"
            :key="item.to"
            :to="item.to"
            class="text-white hover:text-gray-300"
          >
            {{ item.label }}
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-white">Welcome, {{ userFirstName }}</span>
          <button
            @click="handleLogout"
            class="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
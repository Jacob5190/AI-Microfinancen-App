<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userRole = ref(localStorage.getItem('userRole') || '');
const userFirstName = ref(localStorage.getItem('userFirstName') || '');

const navigateToAction = () => {
  if (userRole.value === 'borrower') {
    router.push('/loan-application');
  } else {
    router.push('/find-match');
  }
};

const features = [
  {
    title: 'AI-Powered Matching',
    description: 'Our advanced algorithms connect borrowers with the right lenders based on multiple criteria.',
    color: 'bg-blue-500'
  },
  {
    title: 'Quick Processing',
    description: 'Fast and efficient loan processing with minimal paperwork and quick approvals.',
    color: 'bg-green-500'
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security to protect your sensitive information and transactions.',
    color: 'bg-purple-500'
  },
  {
    title: 'Smart Analytics',
    description: 'Detailed insights and analytics to help you make informed decisions.',
    color: 'bg-indigo-500'
  }
];

const quickActions = [
  {
    title: userRole.value === 'borrower' ? 'Apply for Loan' : 'Find Borrowers',
    description: userRole.value === 'borrower' 
      ? 'Start your loan application process'
      : 'Browse and connect with potential borrowers',
    action: navigateToAction
  },
  {
    title: 'View Profile',
    description: 'Update your personal and business information',
    action: () => router.push(userRole.value === 'borrower' ? '/business-profile' : '/lending-preferences')
  },
  {
    title: 'Get Support',
    description: 'Contact our support team for assistance',
    action: () => router.push('/support')
  }
];
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <main class="py-10">
      <!-- Page header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Welcome back, {{ userFirstName }}!
        </h1>
        
        <!-- Quick Actions -->
        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="action in quickActions"
            :key="action.title"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 cursor-pointer"
            @click="action.action"
          >
            <div class="flex-1 min-w-0">
              <span class="absolute inset-0" aria-hidden="true" />
              <p class="text-lg font-medium text-gray-900">
                {{ action.title }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ action.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="mt-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Platform Features</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="relative rounded-lg bg-white px-6 py-5 shadow-sm flex items-center space-x-3"
            >
              <div class="flex-shrink-0">
                <div :class="[feature.color, 'h-10 w-10 rounded-full']" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-lg font-medium text-gray-900">
                  {{ feature.title }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resources Section -->
        <div class="mt-12 bg-white rounded-lg shadow">
          <div class="px-6 py-5">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Resources & Tips</h2>
            <div class="prose prose-sm max-w-none">
              <ul class="space-y-2">
                <li>Keep your profile information up to date for better matching</li>
                <li>Review all terms and conditions carefully before accepting any loan offers</li>
                <li>Contact support if you need assistance with your application</li>
                <li>Enable two-factor authentication for enhanced security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
</style>
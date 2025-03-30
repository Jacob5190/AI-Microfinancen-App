<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoadingState } from '../utils/loading';

const router = useRouter();
const { isLoading } = useLoadingState();

const features = [
  {
    title: 'AI-Powered Risk Assessment',
    description: 'Advanced algorithms analyze business data to provide accurate risk assessments.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    title: 'Quick Loan Processing',
    description: 'Streamlined application process with fast approval times.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Smart Matching',
    description: 'Connect with the right lenders based on your business profile.',
    icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security to protect your sensitive information.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  }
];

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-y-0 h-full w-full" aria-hidden="true">
        <div class="relative h-full">
          <svg
            class="absolute right-full transform translate-y-1/3 translate-x-1/4 md:translate-y-1/2 sm:translate-x-1/2 lg:translate-x-full"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="e229dbec-10e9-49ee-8ec3-0286ca089edf"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" class="text-gray-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
          </svg>
          <svg
            class="absolute left-full transform -translate-y-3/4 -translate-x-1/4 sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="d2a68204-c383-44b1-b99f-42ccff4e5365"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" class="text-gray-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#d2a68204-c383-44b1-b99f-42ccff4e5365)" />
          </svg>
        </div>
      </div>

      <div class="relative pt-6 pb-16 sm:pb-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span class="block">AI-Powered</span>
              <span class="block text-indigo-600">Microfinance Platform</span>
            </h1>
            <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connecting small businesses with lenders through intelligent matchmaking and risk assessment.
            </p>
            <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div class="rounded-md shadow">
                <button
                  @click="navigateToRegister"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </button>
              </div>
              <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button
                  @click="navigateToLogin"
                  class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Smart Lending Solutions
          </p>
        </div>

        <div class="mt-10">
          <div class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="relative"
            >
              <div class="relative">
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="feature.icon"
                    />
                  </svg>
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ feature.title }}</p>
              </div>
              <div class="mt-2 ml-16 text-base text-gray-500">
                {{ feature.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
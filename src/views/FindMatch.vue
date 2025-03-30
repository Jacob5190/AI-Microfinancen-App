<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const userType = ref('');

// Initialize userType from localStorage on component mount
onMounted(() => {
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) {
    userType.value = storedRole;
  }
});

// Mock data for lenders
const lenderMatches = [
  {
    id: 1,
    name: "Growth Capital Fund",
    amount: "Up to $50,000",
    interestRate: "8-12%",
    matchScore: 94,
    industry: "Technology, Healthcare",
    description: "Specialized in funding early-stage startups with proven market traction",
    fundingHistory: "50+ successful loans"
  },
  {
    id: 2,
    name: "Small Business First",
    amount: "Up to $25,000",
    interestRate: "6-9%",
    matchScore: 88,
    industry: "Retail, Services",
    description: "Focus on established small businesses with steady revenue",
    fundingHistory: "100+ loans funded"
  },
  {
    id: 3,
    name: "Innovation Funders",
    amount: "Up to $75,000",
    interestRate: "10-15%",
    matchScore: 82,
    industry: "Technology, Manufacturing",
    description: "Supporting innovative businesses with high growth potential",
    fundingHistory: "25+ tech startups funded"
  }
];

// Mock data for borrowers
const borrowerMatches = [
  {
    id: 1,
    name: "Tech Startup Inc.",
    amount: 25000,
    duration: "12 months",
    matchScore: 92,
    industry: "Technology",
    description: "AI-driven software development company seeking growth capital",
    revenue: "$500K/year"
  },
  {
    id: 2,
    name: "Green Energy Solutions",
    amount: 35000,
    duration: "24 months",
    matchScore: 87,
    industry: "Energy",
    description: "Solar panel installation business looking to expand operations",
    revenue: "$750K/year"
  },
  {
    id: 3,
    name: "Local Cafe Chain",
    amount: 15000,
    duration: "6 months",
    matchScore: 85,
    industry: "Food & Beverage",
    description: "Expanding cafe chain seeking working capital",
    revenue: "$300K/year"
  }
];

const matches = computed(() => 
  userType.value === 'borrower' ? lenderMatches : borrowerMatches
);

const pageTitle = computed(() => 
  userType.value === 'lender' ? 'Find Matching Borrowers' : 'Find Matching Lenders'
);

const handleConnect = (matchId: number) => {
  // This would be handled by your backend
  console.log(`Connecting with match ID: ${matchId}`);
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">{{ pageTitle }}</h1>
      
      <!-- AI Match Score Legend -->
      <div class="mt-4 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium text-gray-900">AI Match Score</h2>
        <p class="text-sm text-gray-500">Our AI algorithm analyzes multiple factors to find your best matches:</p>
        <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span class="text-sm">90-100: Excellent Match</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span class="text-sm">70-89: Good Match</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span class="text-sm">&lt;70: Average Match</span>
          </div>
        </div>
      </div>

      <!-- Matches List -->
      <div class="mt-8 space-y-4">
        <div v-for="match in matches" :key="match.id" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">{{ match.name }}</h2>
              <span 
                class="px-4 py-2 rounded-full text-sm font-semibold"
                :class="{
                  'bg-green-100 text-green-800': match.matchScore >= 90,
                  'bg-yellow-100 text-yellow-800': match.matchScore >= 70 && match.matchScore < 90,
                  'bg-red-100 text-red-800': match.matchScore < 70
                }"
              >
                Match Score: {{ match.matchScore }}%
              </span>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Lender-specific information -->
              <template v-if="userType.value === 'borrower'">
                <div>
                  <span class="text-sm text-gray-500">Loan Range:</span>
                  <p class="text-lg font-medium text-gray-900">{{ match.amount }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Interest Rate:</span>
                  <p class="text-lg font-medium text-gray-900">{{ match.interestRate }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Track Record:</span>
                  <p class="text-lg font-medium text-gray-900">{{ match.fundingHistory }}</p>
                </div>
              </template>

              <!-- Borrower-specific information -->
              <template v-else>
                <div>
                  <span class="text-sm text-gray-500">Amount Needed:</span>
                  <p class="text-lg font-medium text-gray-900">${{ match.amount.toLocaleString() }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Duration:</span>
                  <p class="text-lg font-medium text-gray-900">{{ match.duration }}</p>
                </div>
                <div>
                  <span class="text-sm text-gray-500">Annual Revenue:</span>
                  <p class="text-lg font-medium text-gray-900">{{ match.revenue }}</p>
                </div>
              </template>
            </div>

            <div class="mt-4">
              <span class="text-sm text-gray-500">Preferred Industries:</span>
              <p class="text-lg font-medium text-gray-900">{{ match.industry }}</p>
            </div>

            <p class="mt-4 text-gray-600">{{ match.description }}</p>

            <div class="mt-6 flex justify-end">
              <button
                @click="handleConnect(match.id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();
const userRole = ref(localStorage.getItem('userRole') || '');
const userFirstName = ref(localStorage.getItem('userFirstName') || '');

interface DashboardStats {
  activeLoans: number;
  totalAmount: number;
  riskScore: number | null;
  pendingApplications?: number;
  approvedApplications?: number;
  totalInvestment?: number;
}

const stats = ref<DashboardStats>({
  activeLoans: 0,
  totalAmount: 0,
  riskScore: null
});

const { isLoading, error, startLoading, setError } = useLoadingState();

const loadDashboardStats = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get(`/api/dashboard/${userId}`);
    stats.value = response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load dashboard data');
  }
};

onMounted(loadDashboardStats);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getStatItems = () => {
  const commonStats = [
    { name: 'Active Loans', value: stats.value.activeLoans.toString() },
    { name: 'Total Amount', value: formatCurrency(stats.value.totalAmount) }
  ];

  if (userRole.value === 'borrower') {
    return [
      ...commonStats,
      { name: 'Risk Score', value: stats.value.riskScore ? `${stats.value.riskScore}%` : 'N/A' }
    ];
  } else {
    return [
      ...commonStats,
      { name: 'Pending Applications', value: stats.value.pendingApplications?.toString() || '0' },
      { name: 'Approved Applications', value: stats.value.approvedApplications?.toString() || '0' },
      { name: 'Total Investment', value: formatCurrency(stats.value.totalInvestment || 0) }
    ];
  }
};

const navigateToAction = () => {
  if (userRole.value === 'borrower') {
    router.push('/loan-application');
  } else {
    router.push('/loan-review');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <main class="py-10">
      <!-- Page header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          Welcome back, {{ userFirstName }}!
        </h1>
      </div>

      <!-- Alert for any errors -->
      <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <AlertMessage
          type="error"
          :message="error"
          dismissible
        />
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div class="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>

      <div v-else>
        <!-- Stats -->
        <div class="mt-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="item in getStatItems()"
                :key="item.name"
                class="bg-white overflow-hidden shadow rounded-lg"
              >
                <div class="px-4 py-5 sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ item.name }}</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ item.value }}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Card -->
        <div class="mt-8">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ userRole === 'borrower' ? 'Apply for a New Loan' : 'Review Loan Applications' }}
                </h3>
                <div class="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    {{ 
                      userRole === 'borrower' 
                        ? 'Get started with your loan application today.'
                        : 'Review and approve pending loan applications.'
                    }}
                  </p>
                </div>
                <div class="mt-5">
                  <button
                    @click="navigateToAction"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {{ userRole === 'borrower' ? 'Start Application' : 'View Applications' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
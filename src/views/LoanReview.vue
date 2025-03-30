<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

interface LoanApplication {
  id: string;
  businessName: string;
  amount: number;
  purpose: string;
  duration: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  businessProfile: {
    industry: string;
    yearEstablished: string;
    annualRevenue: number;
    employeeCount: number;
  };
}

const applications = ref<LoanApplication[]>([]);
const selectedApplication = ref<LoanApplication | null>(null);

const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const loadApplications = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get('/api/loan-applications/review');
    applications.value = response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load loan applications');
  }
};

onMounted(loadApplications);

const handleAction = async (applicationId: string, action: 'approve' | 'reject') => {
  try {
    startLoading();
    clearMessages();

    const response = await api.post(`/api/loan-applications/${applicationId}/${action}`);
    
    if (response.data) {
      setSuccess(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      // Reload applications to get updated status
      await loadApplications();
    }
  } catch (err: any) {
    setError(err.response?.data?.message || `Failed to ${action} application`);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Loan Review</h1>
      
      <div class="mt-8">
        <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          dismissible
          @dismiss="clearMessages"
        />
        
        <AlertMessage
          v-if="success"
          type="success"
          :message="success"
          dismissible
          @dismiss="clearMessages"
        />

        <div v-if="isLoading" class="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="applications.length === 0" class="text-center py-12 bg-white shadow sm:rounded-lg">
          <p class="text-gray-500">No loan applications to review at this time.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="application in applications" :key="application.id" class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ application.businessName }}</h3>
                  <div class="mt-2 text-sm text-gray-500">
                    <p>Industry: {{ application.businessProfile.industry }}</p>
                    <p>Established: {{ application.businessProfile.yearEstablished }}</p>
                    <p>Annual Revenue: {{ formatCurrency(application.businessProfile.annualRevenue) }}</p>
                    <p>Employees: {{ application.businessProfile.employeeCount }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(application.status)
                  ]"
                >
                  {{ application.status }}
                </span>
              </div>

              <div class="mt-4 border-t border-gray-200 pt-4">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(application.amount) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.duration }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Purpose</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.purpose }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Application Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(application.createdAt) }}</dd>
                  </div>
                </dl>
              </div>

              <div v-if="application.status === 'PENDING'" class="mt-6 flex space-x-3">
                <button
                  @click="handleAction(application.id, 'approve')"
                  :disabled="isLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                >
                  Approve
                </button>
                <button
                  @click="handleAction(application.id, 'reject')"
                  :disabled="isLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
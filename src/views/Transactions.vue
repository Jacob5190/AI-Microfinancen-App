<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

interface Transaction {
  id: string;
  type: 'DISBURSEMENT' | 'REPAYMENT';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  createdAt: string;
  loanId: string;
  loan: {
    businessName: string;
    duration: string;
  };
}

const transactions = ref<Transaction[]>([]);
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const loadTransactions = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get('/api/transactions');
    transactions.value = response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load transactions');
  }
};

onMounted(loadTransactions);

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
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getTypeColor = (type: string) => {
  return type === 'DISBURSEMENT' ? 'text-green-600' : 'text-blue-600';
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Transactions</h1>
      
      <div class="mt-8">
        <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          dismissible
          @dismiss="clearMessages"
        />

        <div v-if="isLoading" class="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="transactions.length === 0" class="text-center py-12 bg-white shadow sm:rounded-lg">
          <p class="text-gray-500">No transactions to display.</p>
        </div>

        <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transaction in transactions" :key="transaction.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(transaction.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getTypeColor(transaction.type)">
                    {{ transaction.type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(transaction.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ transaction.loan.businessName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(transaction.status)
                      ]"
                    >
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ transaction.description }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
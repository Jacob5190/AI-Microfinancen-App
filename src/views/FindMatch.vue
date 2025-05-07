<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();
const userRole = ref('');
const borrowers = ref<any[]>([]);
const showTermsModal = ref(false);
const selectedLoanId = ref<number | null>(null);
const lendingTerms = ref('');

const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const loadMatchedBorrowers = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    // Get matches from matching service
    const matchResponse = await fetch(`http://localhost:8000/match_lenders/${userId}`);
    const matchData = await matchResponse.json();

    // Get matched loan application details and borrower information
    const matchedApplications = await Promise.all(
      matchData.matched_applications.map(async (match: any) => {
        // Get loan application details
        const loanResponse = await api.get(`/api/loans/${match.loan_application_id}`);
        const loanData = loanResponse.data;

        // Get borrower details
        const borrowerResponse = await api.get(`/api/borrower/${match.borrower_id}`);
        const borrowerData = borrowerResponse.data;

        return { 
          ...loanData,
          ...borrowerData,
          isMatch: true 
        };
      })
    );

    borrowers.value = matchedApplications;
  } catch (err: any) {
    console.error('Error loading matches:', err);
    setError(err.response?.data?.message || 'Failed to load matches');
  } finally {
    isLoading.value = false;
  }
};

// Initialize userRole from localStorage and redirect if not a lender
onMounted(() => {
  const storedRole = localStorage.getItem('userRole');
  if (storedRole !== 'lender') {
    router.push('/dashboard');
    return;
  }
  userRole.value = storedRole;
  loadMatchedBorrowers();
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const handleConnect = async () => {
  if (!selectedLoanId.value || !lendingTerms.value.trim()) {
    return;
  }

  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    await api.post(`/api/loans/lender/${selectedLoanId.value}/accept`, {
      userId: Number(userId),
      terms: lendingTerms.value
    });

    setSuccess('Connection request sent successfully');
    showTermsModal.value = false;
    selectedLoanId.value = null;
    lendingTerms.value = '';
    await loadMatchedBorrowers();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to connect with borrower');
  }
};

const openTermsModal = (loanId: number) => {
  selectedLoanId.value = loanId;
  showTermsModal.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Find Matching Borrowers</h1>

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

      <div v-if="isLoading" class="mt-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Matches List -->
      <div v-else class="mt-8 space-y-4">
        <div v-if="borrowers.length === 0" class="text-center py-12 bg-white shadow sm:rounded-lg">
          <p class="text-gray-500">No matches found at this time.</p>
        </div>

        <div v-else v-for="borrower in borrowers" :key="borrower.id" 
          class="bg-white shadow rounded-lg overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">{{ borrower.businessName }}</h2>
            </div>
            
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span class="text-sm text-gray-500">Loan Amount:</span>
                <p class="text-lg font-medium text-gray-900">{{ formatCurrency(borrower.loanAmount) }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Duration:</span>
                <p class="text-lg font-medium text-gray-900">{{ borrower.loanTerm }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Industry:</span>
                <p class="text-lg font-medium text-gray-900">{{ borrower.industry }}</p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-gray-500">Business Type:</span>
                <p class="text-lg font-medium text-gray-900">{{ borrower.businessType }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Year Established:</span>
                <p class="text-lg font-medium text-gray-900">{{ borrower.yearEstablished }}</p>
              </div>
            </div>

            <p class="mt-4 text-gray-600">{{ borrower.businessDescription }}</p>

            <div class="mt-6 flex justify-end">
              <button
                @click="openTermsModal(borrower.id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms Modal -->
    <div v-if="showTermsModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Enter Lending Terms
              </h3>
              <div class="mt-4">
                <textarea
                  v-model="lendingTerms"
                  rows="4"
                  class="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Enter your lending terms and conditions..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleConnect"
              :disabled="isLoading || !lendingTerms.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-green-400"
            >
              {{ isLoading ? 'Connecting...' : 'Connect' }}
            </button>
            <button
              type="button"
              @click="showTermsModal = false; selectedLoanId = null; lendingTerms = ''"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
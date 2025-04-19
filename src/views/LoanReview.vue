<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

interface BorrowerData {
  businessName: string;
  businessType: string;
  industry: string;
  businessDescription: string;
}

interface LoanApplication {
  id: number;
  borrowerId: number;
  lenderId: number | null;
  loanAmount: number;
  description: string;
  loanTerm: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED_BY_LENDER' | 'BORROWER_CONFIRMED' | 'APPROVED' | 'INVALID';
  lenderTerms: string | null;
  borrowerConfirmedAt: string | null;
  approvedAt: string | null;
  documentId: string | null;
  approved: boolean | null;
}

// Dummy data for development - only pending loans
const dummyData: LoanApplication[] = [
  {
    id: 5,
    borrowerId: 28,
    lenderId: null,
    loanAmount: 1200.00,
    description: "1234",
    loanTerm: "24 months",
    createdAt: "2025-04-06T15:48:25.100259",
    status: "PENDING",
    lenderTerms: null,
    borrowerConfirmedAt: null,
    approvedAt: null,
    documentId: null,
    approved: null
  }
];

const applications = ref<LoanApplication[]>([]);
const borrowerData = ref<Record<number, BorrowerData>>({});
const selectedApplication = ref<LoanApplication | null>(null);
const showTermsModal = ref(false);
const lendingTerms = ref('');

const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages, stopLoading } = useLoadingState();

const fetchBorrowerData = async (borrowerId: number) => {
  try {
    const response = await api.get(`/api/borrower/${borrowerId}`);
    borrowerData.value[borrowerId] = response.data;
  } catch (err: any) {
    console.error(`Failed to fetch borrower data for ID ${borrowerId}:`, err);
  }
};

const loadApplications = async () => {
  try {
    startLoading();
    // Using dummy data instead of API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    applications.value = dummyData;

    // Fetch borrower data for each application
    await Promise.all(applications.value.map(app => fetchBorrowerData(app.borrowerId)));
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load loan applications');
  } finally {
    stopLoading();
  }
};

onMounted(loadApplications);

const handleApprove = async () => {
  if (!selectedApplication.value || !lendingTerms.value.trim()) {
    return;
  }

  try {
    startLoading();
    clearMessages();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.post(`/api/loans/lender/${selectedApplication.value.id}/accept`, {
      userId: Number(userId),
      terms: lendingTerms.value
    });

    if (response.data) {
      setSuccess('Application approved successfully');
      showTermsModal.value = false;
      lendingTerms.value = '';
      selectedApplication.value = null;
      await loadApplications();
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to approve application');
  }
};

const handleReject = async (applicationId: number) => {
  try {
    startLoading();
    clearMessages();
    
    await api.post(`/api/loans/lender/${applicationId}/reject`);
    setSuccess('Application rejected successfully');
    await loadApplications();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to reject application');
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
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Match Borrower</h1>
      
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
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ borrowerData[application.borrowerId]?.businessName || 'Loading...' }}
                </h3>
                <div class="mt-2 text-sm text-gray-500">
                  <p>Industry: {{ borrowerData[application.borrowerId]?.industry || 'Loading...' }}</p>
                  <p>Business Type: {{ borrowerData[application.borrowerId]?.businessType || 'Loading...' }}</p>
                  <p>Description: {{ borrowerData[application.borrowerId]?.businessDescription || 'No description available' }}</p>
                </div>
              </div>

              <div class="mt-4 border-t border-gray-200 pt-4">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(application.loanAmount) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.loanTerm }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Purpose</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.description }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Application Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(application.createdAt) }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mt-6 flex space-x-3">
                <button
                  @click="selectedApplication = application; showTermsModal = true"
                  :disabled="isLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                >
                  Approve
                </button>
                <button
                  @click="handleReject(application.id)"
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
              @click="handleApprove"
              :disabled="isLoading || !lendingTerms.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-green-400"
            >
              {{ isLoading ? 'Approving...' : 'Approve' }}
            </button>
            <button
              type="button"
              @click="showTermsModal = false; selectedApplication = null; lendingTerms = ''"
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
```
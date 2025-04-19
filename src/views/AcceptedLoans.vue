<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';
import DocumentManager from '../components/DocumentManager.vue';
import ContractSection from '../components/ContractSection.vue';

interface Document {
  id: number;
  loanId: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface LoanApplication {
  id: number;
  borrowerId: number;
  lenderId: number | null;
  loanAmount: number;
  description: string;
  loanTerm: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED_BY_LENDER' | 'BORROWER_CONFIRMED' | 'APPROVED' | 'REJECTED';
  lenderTerms: string | null;
  borrowerConfirmedAt: string | null;
  approvedAt: string | null;
  documentId: string | null;
  approved: boolean | null;
}

interface BorrowerData {
  businessName: string;
  businessType: string;
  industry: string;
  businessDescription: string;
}

const acceptedLoans = ref<LoanApplication[]>([]);
const borrowerData = ref<Record<number, BorrowerData>>({});
const selectedLoan = ref<LoanApplication | null>(null);
const showDetailsModal = ref(false);

const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const fetchBorrowerData = async (borrowerId: number) => {
  try {
    const response = await api.get(`/api/borrower/${borrowerId}`);
    borrowerData.value[borrowerId] = response.data;
  } catch (err: any) {
    console.error(`Failed to fetch borrower data for ID ${borrowerId}:`, err);
  }
};

const loadAcceptedLoans = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get(`/api/loans/accepted/lender/${userId}`);
    acceptedLoans.value = response.data;

    // Fetch borrower data for each loan
    await Promise.all(acceptedLoans.value.map(loan => fetchBorrowerData(loan.borrowerId)));
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load accepted loans');
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadAcceptedLoans);

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
    case 'ACCEPTED_BY_LENDER':
      return 'bg-blue-100 text-blue-800';
    case 'BORROWER_CONFIRMED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'ACCEPTED_BY_LENDER':
      return 'Accepted by Lender';
    case 'BORROWER_CONFIRMED':
      return 'Borrower Confirmed';
    default:
      return 'Pending Review';
  }
};

const viewDetails = (loan: LoanApplication) => {
  selectedLoan.value = loan;
  showDetailsModal.value = true;
};

const handleApprove = async (loanId: number) => {
  try {
    startLoading();
    await api.post(`/api/loans/lenders/${loanId}/approve`);
    setSuccess('Loan approved successfully');
    await loadAcceptedLoans();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to approve loan');
  }
};

const handleReject = async (loanId: number) => {
  try {
    startLoading();
    await api.post(`/api/loans/lenders/${loanId}/reject`);
    setSuccess('Loan rejected successfully');
    await loadAcceptedLoans();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to reject loan');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Accepted Loans</h1>
      
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

        <div v-else-if="acceptedLoans.length === 0" class="text-center py-12 bg-white shadow sm:rounded-lg">
          <p class="text-gray-500">No accepted loans to display.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="loan in acceptedLoans" :key="loan.id" class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ borrowerData[loan.borrowerId]?.businessName || 'Loading...' }}
                  </h3>
                  <div class="mt-2 text-sm text-gray-500">
                    <p>Industry: {{ borrowerData[loan.borrowerId]?.industry || 'Loading...' }}</p>
                    <p>Business Type: {{ borrowerData[loan.borrowerId]?.businessType || 'Loading...' }}</p>
                    <p>Description: {{ borrowerData[loan.borrowerId]?.businessDescription || 'No description available' }}</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(loan.status)
                  ]"
                >
                  {{ getStatusText(loan.status) }}
                </span>
              </div>

              <div class="mt-4 border-t border-gray-200 pt-4">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Loan Amount</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(loan.loanAmount) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Duration</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.loanTerm }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Purpose</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.description }}</dd>
                  </div>
                  <div class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Application Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(loan.createdAt) }}</dd>
                  </div>
                  <div v-if="loan.lenderTerms" class="sm:col-span-2">
                    <dt class="text-sm font-medium text-gray-500">Lender Terms</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ loan.lenderTerms }}</dd>
                  </div>
                </dl>
              </div>

              <div class="mt-6 flex space-x-3">
                <button
                  @click="viewDetails(loan)"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Details
                </button>
                
                <!-- Approval/Rejection buttons for ACCEPTED_BY_LENDER or BORROWER_CONFIRMED status -->
                <template v-if="loan.status === 'ACCEPTED_BY_LENDER' || loan.status === 'BORROWER_CONFIRMED'">
                  <button
                    @click="handleApprove(loan.id)"
                    :disabled="isLoading"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    @click="handleReject(loan.id)"
                    :disabled="isLoading"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div class="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              @click="showDetailsModal = false"
              class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Loan Details
              </h3>
              <div class="mt-4 space-y-4">
                <ContractSection title="Lender Terms" :defaultOpen="false">
                  <div class="prose prose-sm max-w-none">
                    {{ selectedLoan?.lenderTerms || 'No terms available.' }}
                  </div>
                </ContractSection>

                <ContractSection title="Documents" :defaultOpen="true">
                  <DocumentManager :loan-id="selectedLoan?.id.toString() || ''" :view-only="true" />
                </ContractSection>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  max-width: none;
}

.prose :where(code):not(:where([class~="not-prose"] *)) {
  @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono;
}

.prose :where(pre):not(:where([class~="not-prose"] *)) {
  @apply bg-gray-100 rounded p-4 mb-4 overflow-x-auto;
}

.prose :where(pre code):not(:where([class~="not-prose"] *)) {
  @apply bg-transparent p-0;
}
</style>
```
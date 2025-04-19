<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useFormValidation, required, positiveNumber } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';
import DocumentManager from '../components/DocumentManager.vue';
import ContractSection from '../components/ContractSection.vue';

type LoanStatus = 'PENDING' | 'ACCEPTED_BY_LENDER' | 'BORROWER_CONFIRMED' | 'APPROVED' | 'REJECTED';

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
  status: LoanStatus;
  lenderTerms: string | null;
  borrowerConfirmedAt: string | null;
  approvedAt: string | null;
  documentId: string | null;
  approved: boolean | null;
}

const router = useRouter();
const showApplicationModal = ref(false);
const showDeleteModal = ref(false);
const showDetailsModal = ref(false);
const selectedLoan = ref<LoanApplication | null>(null);
const isUpdateMode = ref(false);
const loanHistory = ref<LoanApplication[]>([]);

const formData = ref({
  amount: '',
  purpose: '',
  duration: '12'
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  amount: [required('Loan amount'), positiveNumber()],
  purpose: [required('Loan purpose')],
  duration: [required('Loan duration')]
});

// Setup loading state
const { isLoading, error, success, startLoading, stopLoading, setError, setSuccess, clearMessages } = useLoadingState();

const loadLoanHistory = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get<LoanApplication[]>(`/api/loans/borrower/${userId}`);
    loanHistory.value = response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load loan history');
  } finally {
    stopLoading();
  }
};

const handleConfirm = async (loanId: number) => {
  try {
    startLoading();
    await api.post(`/api/loans/borrowers/${loanId}/confirm`);
    setSuccess('Loan confirmed successfully');
    await loadLoanHistory();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to confirm loan');
  } finally {
    stopLoading();
  }
};

onMounted(loadLoanHistory);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  clearMessages();
  
  // Validate form
  if (!validate(formData.value)) {
    return;
  }
  
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const payload = {
      userId: Number(userId),
      loanAmount: Number(formData.value.amount),
      description: formData.value.purpose,
      loanTerm: `${formData.value.duration} months`,
      status: 'PENDING' as LoanStatus
    };

    let response;
    if (isUpdateMode.value && selectedLoan.value) {
      response = await api.put<LoanApplication>(`/api/loans/borrower/${selectedLoan.value.id}`, payload);
    } else {
      response = await api.post<LoanApplication>('/api/loans/borrower/apply', payload);
    }

    if (response.data) {
      setSuccess(`Loan application ${isUpdateMode.value ? 'updated' : 'submitted'} successfully!`);
      showApplicationModal.value = false;
      // Reset form
      formData.value = {
        amount: '',
        purpose: '',
        duration: '12'
      };
      isUpdateMode.value = false;
      selectedLoan.value = null;
      // Reload loan history
      await loadLoanHistory();
    }
  } catch (err: any) {
    setError(err.response?.data?.message || `Failed to ${isUpdateMode.value ? 'update' : 'submit'} loan application`);
  }
};

const handleUpdate = (loan: LoanApplication) => {
  selectedLoan.value = loan;
  isUpdateMode.value = true;
  formData.value = {
    amount: loan.loanAmount.toString(),
    purpose: loan.description,
    duration: loan.loanTerm.split(' ')[0]
  };
  showApplicationModal.value = true;
};

const handleDelete = async () => {
  if (!selectedLoan.value) return;
  
  try {
    startLoading();
    await api.delete(`/api/loans/borrower/${selectedLoan.value.id}`);
    setSuccess('Loan application deleted successfully!');
    showDeleteModal.value = false;
    selectedLoan.value = null;
    await loadLoanHistory();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to delete loan application');
  }
};

const confirmDelete = (loan: LoanApplication) => {
  selectedLoan.value = loan;
  showDeleteModal.value = true;
};

const viewDetails = (loan: LoanApplication) => {
  selectedLoan.value = loan;
  showDetailsModal.value = true;
};

const durations = [
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' }
];

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

const getStatusColor = (status: LoanStatus) => {
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

const getStatusText = (status: LoanStatus) => {
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

const resetForm = () => {
  formData.value = {
    amount: '',
    purpose: '',
    duration: '12'
  };
  isUpdateMode.value = false;
  selectedLoan.value = null;
  showApplicationModal.value = false;
  showDeleteModal.value = false;
  showDetailsModal.value = false;
  clearErrors();
  clearMessages();
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">Loan Status</h1>
        <button
          @click="showApplicationModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply for Loan
        </button>
      </div>
      
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

        <div v-else-if="loanHistory.length === 0" class="text-center py-12 bg-white shadow sm:rounded-lg">
          <p class="text-gray-500">You haven't applied for any loans yet.</p>
          <button
            @click="showApplicationModal = true"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply for Loan
          </button>
        </div>

        <div v-else>
          <!-- Loan History -->
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-6">Loan History</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="loan in loanHistory" :key="loan.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatDate(loan.createdAt) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatCurrency(loan.loanAmount) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ loan.loanTerm }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          :class="[
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getStatusColor(loan.status)
                          ]"
                        >
                          {{ getStatusText(loan.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-500">
                        {{ loan.description }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <!-- Actions for PENDING state -->
                        <template v-if="loan.status === 'PENDING'">
                          <button
                            @click="handleUpdate(loan)"
                            class="text-indigo-600 hover:text-indigo-900"
                          >
                            Update
                          </button>
                          <button
                            @click="confirmDelete(loan)"
                            class="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </template>
                        
                        <!-- Actions for ACCEPTED_BY_LENDER state -->
                        <template v-if="loan.status === 'ACCEPTED_BY_LENDER'">
                          <button
                            @click="viewDetails(loan)"
                            class="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                          <button
                            @click="handleConfirm(loan.id)"
                            :disabled="isLoading"
                            class="text-green-600 hover:text-green-900"
                          >
                            Confirm
                          </button>
                        </template>

                        <!-- Actions for REJECTED state -->
                        <template v-if="loan.status === 'REJECTED'">
                          <button
                            @click="confirmDelete(loan)"
                            class="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Modal -->
    <div v-if="showApplicationModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              @click="resetForm"
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
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ isUpdateMode ? 'Update Loan Application' : 'New Loan Application' }}
              </h3>
              <div class="mt-4">
                <form @submit="handleSubmit" class="space-y-6">
                  <FormField
                    label="Loan Amount ($)"
                    :error="errors.amount"
                    required
                  >
                    <template #default="{ inputClasses }">
                      <input
                        id="amount"
                        v-model="formData.amount"
                        type="number"
                        min="0"
                        :class="inputClasses"
                      />
                    </template>
                  </FormField>

                  <FormField
                    label="Loan Purpose"
                    :error="errors.purpose"
                    required
                  >
                    <template #default="{ inputClasses }">
                      <textarea
                        id="purpose"
                        v-model="formData.purpose"
                        rows="3"
                        :class="inputClasses"
                        placeholder="Explain how you plan to use the loan"
                      ></textarea>
                    </template>
                  </FormField>

                  <FormField
                    label="Loan Duration"
                    :error="errors.duration"
                    required
                  >
                    <template #default="{ inputClasses }">
                      <select
                        id="duration"
                        v-model="formData.duration"
                        :class="inputClasses"
                      >
                        <option v-for="duration in durations" :key="duration.value" :value="duration.value">
                          {{ duration.label }}
                        </option>
                      </select>
                    </template>
                  </FormField>

                  <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-400"
                    >
                      <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
                      {{ isLoading ? 'Saving...' : (isUpdateMode ? 'Update Application' : 'Submit Application') }}
                    </button>
                    <button
                      type="button"
                      @click="resetForm"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Delete Loan Application
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete this loan application? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleDelete"
              :disabled="isLoading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-400"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              {{ isLoading ? 'Deleting...' : 'Delete' }}
            </button>
            <button
              type="button"
              @click="showDeleteModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
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
                  <DocumentManager :loan-id="selectedLoan?.id.toString() || ''" />
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
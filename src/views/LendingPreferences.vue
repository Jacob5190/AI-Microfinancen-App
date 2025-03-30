<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';

const preferences = ref({
  companyName: '',
  preferredIndustries: [] as string[],
  maxLoanAmount: 50000,
  riskTolerance: 'MODERATE',
  preferredLoanTerms: [] as string[]
});

const isLoading = ref(false);
const isEditing = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const validationErrors = ref<Record<string, string>>({});

const industries = [
  'Technology',
  'Retail',
  'Manufacturing',
  'Healthcare',
  'Agriculture',
  'Services'
];

const loanTerms = [
  '6 months',
  '12 months',
  '24 months',
  '36 months'
];

const riskToleranceLevels = [
  { value: 'CONSERVATIVE', label: 'Conservative' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'AGGRESSIVE', label: 'Aggressive' }
];

// Validation rules
const validateForm = () => {
  const errors: Record<string, string> = {};

  if (!preferences.value.companyName.trim()) {
    errors.companyName = 'Company name is required';
  }

  if (preferences.value.preferredIndustries.length === 0) {
    errors.preferredIndustries = 'Please select at least one industry';
  }

  if (!preferences.value.maxLoanAmount) {
    errors.maxLoanAmount = 'Maximum loan amount is required';
  } else if (preferences.value.maxLoanAmount <= 0) {
    errors.maxLoanAmount = 'Maximum loan amount must be greater than 0';
  } else if (preferences.value.maxLoanAmount > 1000000) {
    errors.maxLoanAmount = 'Maximum loan amount cannot exceed $1,000,000';
  }

  if (preferences.value.preferredLoanTerms.length === 0) {
    errors.preferredLoanTerms = 'Please select at least one loan term';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Fetch existing preferences on component mount
onMounted(async () => {
  try {
    isLoading.value = true;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get(`/api/lender/${userId}`);
    if (response.data) {
      preferences.value = {
        companyName: response.data.companyName || '',
        preferredIndustries: response.data.preferredIndustries || [],
        maxLoanAmount: response.data.maxLoanAmount || 50000,
        riskTolerance: response.data.riskTolerance || 'MODERATE',
        preferredLoanTerms: response.data.preferredLoanTerms || []
      };
    }
  } catch (error: any) {
    console.error('Failed to fetch preferences:', error);
    errorMessage.value = error.message || 'Failed to load preferences';
  } finally {
    isLoading.value = false;
  }
});

const savePreferences = async (e: Event) => {
  e.preventDefault();
  
  // Clear previous messages
  errorMessage.value = '';
  successMessage.value = '';
  validationErrors.value = {};

  // Validate form
  if (!validateForm()) {
    return;
  }
  
  try {
    isLoading.value = true;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    const response = await api.put(`/api/lender/${userId}`, preferences.value);

    if (response.data) {
      successMessage.value = 'Preferences saved successfully!';
      isEditing.value = false;
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to save preferences';
  } finally {
    isLoading.value = false;
  }
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    // Reset form if canceling edit
    onMounted();
    // Clear any validation errors
    validationErrors.value = {};
  }
};

const hasError = (field: string) => {
  return validationErrors.value[field] ? 'border-red-300' : 'border-gray-300';
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">Lending Preferences</h1>
        <div class="flex items-center gap-4">
          <div v-if="successMessage" class="text-green-600">{{ successMessage }}</div>
          <div v-if="errorMessage" class="text-red-600">{{ errorMessage }}</div>
          <button
            v-if="!isEditing"
            @click="toggleEdit"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </button>
          <button
            v-else
            @click="toggleEdit"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <form v-else @submit="savePreferences" class="space-y-6">
            <div>
              <label for="companyName" class="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                id="companyName"
                v-model="preferences.companyName"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('companyName')
                ]"
              />
              <p v-if="validationErrors.companyName" class="mt-1 text-sm text-red-600">
                {{ validationErrors.companyName }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Preferred Industries</label>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div v-for="industry in industries" :key="industry" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="industry"
                    v-model="preferences.preferredIndustries"
                    :value="industry"
                    :disabled="!isEditing"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <label :for="industry" class="ml-2 text-sm text-gray-700">{{ industry }}</label>
                </div>
              </div>
              <p v-if="validationErrors.preferredIndustries" class="mt-1 text-sm text-red-600">
                {{ validationErrors.preferredIndustries }}
              </p>
            </div>

            <div>
              <label for="maxLoanAmount" class="block text-sm font-medium text-gray-700">
                Maximum Loan Amount
              </label>
              <input
                type="number"
                id="maxLoanAmount"
                v-model="preferences.maxLoanAmount"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('maxLoanAmount')
                ]"
              />
              <p v-if="validationErrors.maxLoanAmount" class="mt-1 text-sm text-red-600">
                {{ validationErrors.maxLoanAmount }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Risk Tolerance</label>
              <select
                v-model="preferences.riskTolerance"
                :disabled="!isEditing"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option v-for="level in riskToleranceLevels" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Preferred Loan Terms</label>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div v-for="term in loanTerms" :key="term" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="term"
                    v-model="preferences.preferredLoanTerms"
                    :value="term"
                    :disabled="!isEditing"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <label :for="term" class="ml-2 text-sm text-gray-700">{{ term }}</label>
                </div>
              </div>
              <p v-if="validationErrors.preferredLoanTerms" class="mt-1 text-sm text-red-600">
                {{ validationErrors.preferredLoanTerms }}
              </p>
            </div>

            <div v-if="isEditing">
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {{ isLoading ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
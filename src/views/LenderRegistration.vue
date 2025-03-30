<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useFormValidation, required, positiveNumber } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();

const formData = ref({
  organizationType: '',
  companyName: '',
  preferredIndustries: [] as string[],
  maxLoanAmount: 50000,
  riskTolerance: 'moderate',
  preferredLoanTerms: [] as string[]
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  organizationType: [required('Organization type')],
  companyName: [required('Company name')],
  preferredIndustries: [required('Preferred industries')],
  maxLoanAmount: [required('Maximum loan amount'), positiveNumber()],
  riskTolerance: [required('Risk tolerance')],
  preferredLoanTerms: [required('Preferred loan terms')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const industries = [
  'Technology',
  'Retail',
  'Manufacturing',
  'Healthcare',
  'Agriculture',
  'Services'
];

const organizationTypes = [
  { value: 'individual', label: 'Individual Investor' },
  { value: 'institution', label: 'Financial Institution' },
  { value: 'fund', label: 'Investment Fund' }
];

const loanTerms = [
  '6 months',
  '12 months',
  '24 months',
  '36 months'
];

onMounted(() => {
  // Check if registration data exists
  const registrationData = sessionStorage.getItem('registrationData');
  if (!registrationData) {
    router.push('/register');
  }
});

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
    const registrationData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    
    // Combine registration data with lender details
    const completeRegistration = {
      ...registrationData,
      lenderDetails: formData.value
    };

    // Send complete registration data
    const response = await api.post('/auth/register', completeRegistration);

    if (response.data) {
      setSuccess('Registration successful!');
      
      // Store user data and clean up
      localStorage.setItem('userRole', response.data.role.toLowerCase());
      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userEmail', response.data.email);
      localStorage.setItem('userFirstName', response.data.firstName);
      localStorage.setItem('userLastName', response.data.lastName);
      localStorage.setItem('userPhoneNumber', response.data.phoneNumber);
      localStorage.setItem('companyName', formData.value.companyName);
      
      sessionStorage.removeItem('registrationData');
      
      // Force a page reload to ensure all components pick up the new role
      window.location.href = '/dashboard';
      return;
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Registration failed');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">Lender Details</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Please provide your lending preferences
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

        <form @submit="handleSubmit" class="space-y-6">
          <FormField
            label="Organization Type"
            :error="errors.organizationType"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="organizationType"
                v-model="formData.organizationType"
                :class="inputClasses"
              >
                <option value="">Select organization type</option>
                <option v-for="type in organizationTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </template>
          </FormField>

          <FormField
            label="Company Name"
            :error="errors.companyName"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="companyName"
                v-model="formData.companyName"
                type="text"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Preferred Industries"
            :error="errors.preferredIndustries"
            required
          >
            <template #default="{ inputClasses }">
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div v-for="industry in industries" :key="industry" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="industry"
                    v-model="formData.preferredIndustries"
                    :value="industry"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label :for="industry" class="ml-2 text-sm text-gray-700">{{ industry }}</label>
                </div>
              </div>
            </template>
          </FormField>

          <FormField
            label="Maximum Loan Amount ($)"
            :error="errors.maxLoanAmount"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="maxLoanAmount"
                v-model="formData.maxLoanAmount"
                type="number"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Risk Tolerance"
            :error="errors.riskTolerance"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="riskTolerance"
                v-model="formData.riskTolerance"
                :class="inputClasses"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </template>
          </FormField>

          <FormField
            label="Preferred Loan Terms"
            :error="errors.preferredLoanTerms"
            required
          >
            <template #default="{ inputClasses }">
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div v-for="term in loanTerms" :key="term" class="flex items-center">
                  <input
                    type="checkbox"
                    :id="term"
                    v-model="formData.preferredLoanTerms"
                    :value="term"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label :for="term" class="ml-2 text-sm text-gray-700">{{ term }}</label>
                </div>
              </div>
            </template>
          </FormField>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              {{ isLoading ? 'Saving...' : 'Complete Registration' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
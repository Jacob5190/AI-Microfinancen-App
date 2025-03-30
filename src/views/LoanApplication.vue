<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useFormValidation, required, positiveNumber } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();

const formData = ref({
  businessName: '',
  amount: '',
  purpose: '',
  duration: '12'
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  businessName: [required('Business name')],
  amount: [required('Loan amount'), positiveNumber()],
  purpose: [required('Loan purpose')],
  duration: [required('Loan duration')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

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

    const response = await api.post('/api/loan-applications', {
      ...formData.value,
      userId,
      status: 'PENDING'
    });

    if (response.data) {
      setSuccess('Loan application submitted successfully!');
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to submit loan application');
  }
};

const durations = [
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' }
];
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Loan Application</h1>
      
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
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
              label="Business Name"
              :error="errors.businessName"
              required
            >
              <template #default="{ inputClasses }">
                <input
                  id="businessName"
                  v-model="formData.businessName"
                  type="text"
                  :class="inputClasses"
                />
              </template>
            </FormField>

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

            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
                {{ isLoading ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
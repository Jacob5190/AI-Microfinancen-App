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
  businessName: '',
  businessType: '',
  industry: '',
  annualRevenue: '',
  yearEstablished: '',
  employeeCount: '',
  description: ''
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  businessName: [required('Business name')],
  businessType: [required('Business type')],
  industry: [required('Industry')],
  annualRevenue: [required('Annual revenue'), positiveNumber()],
  yearEstablished: [required('Year established')],
  employeeCount: [required('Number of employees'), positiveNumber()]
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

// Calculate reasonable year range
const currentYear = new Date().getFullYear();
const startYear = 1900;
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

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
    
    // Combine registration data with borrower details
    const completeRegistration = {
      ...registrationData,
      borrowerDetails: formData.value
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
      localStorage.setItem('businessName', formData.value.businessName);
      
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
      <h2 class="text-center text-3xl font-extrabold text-gray-900">Business Details</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Please provide information about your business
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
            label="Business Type"
            :error="errors.businessType"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="businessType"
                v-model="formData.businessType"
                :class="inputClasses"
              >
                <option value="">Select business type</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
              </select>
            </template>
          </FormField>

          <FormField
            label="Industry"
            :error="errors.industry"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="industry"
                v-model="formData.industry"
                :class="inputClasses"
              >
                <option value="">Select industry</option>
                <option v-for="industry in industries" :key="industry" :value="industry">
                  {{ industry }}
                </option>
              </select>
            </template>
          </FormField>

          <FormField
            label="Annual Revenue"
            :error="errors.annualRevenue"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="annualRevenue"
                v-model="formData.annualRevenue"
                type="number"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Year Established"
            :error="errors.yearEstablished"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="yearEstablished"
                v-model="formData.yearEstablished"
                :class="inputClasses"
              >
                <option value="">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </template>
          </FormField>

          <FormField
            label="Number of Employees"
            :error="errors.employeeCount"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="employeeCount"
                v-model="formData.employeeCount"
                type="number"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Business Description"
            :error="errors.description"
          >
            <template #default="{ inputClasses }">
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                :class="inputClasses"
                placeholder="Tell us about your business (optional)"
              ></textarea>
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
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const businessProfile = ref({
  businessName: '',
  industry: '',
  yearEstablished: '',
  annualRevenue: '',
  employeeCount: '',
  businessType: '',
  businessDescription: ''
});

const isLoading = ref(true);
const isEditing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const validationErrors = ref<Record<string, string>>({});

const industries = [
  'Technology',
  'Retail',
  'Manufacturing',
  'Healthcare',
  'Agriculture',
  'Services'
];

const businessTypes = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' }
];

// Calculate reasonable year range
const currentYear = new Date().getFullYear();
const startYear = 1900;
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

const validateForm = () => {
  const errors: Record<string, string> = {};

  if (!businessProfile.value.businessName.trim()) {
    errors.businessName = 'Business name is required';
  }

  if (!businessProfile.value.industry) {
    errors.industry = 'Industry is required';
  }

  if (!businessProfile.value.yearEstablished) {
    errors.yearEstablished = 'Year established is required';
  }

  if (!businessProfile.value.annualRevenue) {
    errors.annualRevenue = 'Annual revenue is required';
  } else if (Number(businessProfile.value.annualRevenue) <= 0) {
    errors.annualRevenue = 'Annual revenue must be greater than 0';
  }

  if (!businessProfile.value.employeeCount) {
    errors.employeeCount = 'Number of employees is required';
  } else if (Number(businessProfile.value.employeeCount) <= 0) {
    errors.employeeCount = 'Number of employees must be greater than 0';
  }

  if (!businessProfile.value.businessType) {
    errors.businessType = 'Business type is required';
  }

  // Description is optional, so no validation needed

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const loadProfile = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get(`/api/borrower/${userId}`);
    if (response.data) {
      businessProfile.value = {
        businessName: response.data.businessName || '',
        industry: response.data.industry || '',
        yearEstablished: response.data.yearEstablished || '',
        annualRevenue: response.data.annualRevenue || '',
        employeeCount: response.data.employeeCount || '',
        businessType: response.data.businessType || '',
        businessDescription: response.data.businessDescription || ''
      };
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to load business profile';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadProfile);

const handleSave = async () => {
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

    const response = await api.put(`/api/borrower/${userId}`, {
      ...businessProfile.value,
      businessDescription: businessProfile.value.businessDescription?.trim() || null // Ensure empty string is sent as null
    });
    
    if (response.data) {
      successMessage.value = 'Profile updated successfully!';
      isEditing.value = false;
      
      // Reload the profile to ensure we have the latest data
      await loadProfile();
      
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to update profile';
  } finally {
    isLoading.value = false;
  }
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    // Reset form if canceling edit
    loadProfile();
    // Clear any validation errors
    validationErrors.value = {};
  }
};

const hasError = (field: string) => {
  return validationErrors.value[field] ? 'border-red-300' : 'border-gray-300';
};

const formatBusinessType = (type: string) => {
  return type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">Business Profile</h1>
        <div class="flex items-center gap-4">
          <div v-if="successMessage" class="text-green-600">{{ successMessage }}</div>
          <div v-if="errorMessage" class="text-red-600">{{ errorMessage }}</div>
          <button
            v-if="!isEditing"
            @click="toggleEdit"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
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
          <div v-if="isLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <form v-else @submit.prevent="handleSave" class="space-y-6">
            <div>
              <label for="businessName" class="block text-sm font-medium text-gray-700">
                Business Name <span class="text-red-500">*</span>
              </label>
              <input
                id="businessName"
                v-model="businessProfile.businessName"
                type="text"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('businessName')
                ]"
              />
              <p v-if="validationErrors.businessName" class="mt-1 text-sm text-red-600">
                {{ validationErrors.businessName }}
              </p>
            </div>

            <div>
              <label for="industry" class="block text-sm font-medium text-gray-700">
                Industry <span class="text-red-500">*</span>
              </label>
              <select
                id="industry"
                v-model="businessProfile.industry"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('industry')
                ]"
              >
                <option value="">Select industry</option>
                <option v-for="industry in industries" :key="industry" :value="industry">
                  {{ industry }}
                </option>
              </select>
              <p v-if="validationErrors.industry" class="mt-1 text-sm text-red-600">
                {{ validationErrors.industry }}
              </p>
            </div>

            <div>
              <label for="businessType" class="block text-sm font-medium text-gray-700">
                Business Type <span class="text-red-500">*</span>
              </label>
              <select
                id="businessType"
                v-model="businessProfile.businessType"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('businessType')
                ]"
              >
                <option value="">Select business type</option>
                <option v-for="type in businessTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <p v-if="validationErrors.businessType" class="mt-1 text-sm text-red-600">
                {{ validationErrors.businessType }}
              </p>
            </div>

            <div>
              <label for="yearEstablished" class="block text-sm font-medium text-gray-700">
                Year Established <span class="text-red-500">*</span>
              </label>
              <select
                id="yearEstablished"
                v-model="businessProfile.yearEstablished"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('yearEstablished')
                ]"
              >
                <option value="">Select year</option>
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
              <p v-if="validationErrors.yearEstablished" class="mt-1 text-sm text-red-600">
                {{ validationErrors.yearEstablished }}
              </p>
            </div>

            <div>
              <label for="annualRevenue" class="block text-sm font-medium text-gray-700">
                Annual Revenue <span class="text-red-500">*</span>
              </label>
              <input
                id="annualRevenue"
                v-model="businessProfile.annualRevenue"
                type="number"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('annualRevenue')
                ]"
              />
              <p v-if="validationErrors.annualRevenue" class="mt-1 text-sm text-red-600">
                {{ validationErrors.annualRevenue }}
              </p>
            </div>

            <div>
              <label for="employeeCount" class="block text-sm font-medium text-gray-700">
                Number of Employees <span class="text-red-500">*</span>
              </label>
              <input
                id="employeeCount"
                v-model="businessProfile.employeeCount"
                type="number"
                :disabled="!isEditing"
                :class="[
                  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed',
                  hasError('employeeCount')
                ]"
              />
              <p v-if="validationErrors.employeeCount" class="mt-1 text-sm text-red-600">
                {{ validationErrors.employeeCount }}
              </p>
            </div>

            <div>
              <label for="businessDescription" class="block text-sm font-medium text-gray-700">Business Description</label>
              <textarea
                id="businessDescription"
                v-model="businessProfile.businessDescription"
                rows="4"
                :disabled="!isEditing"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Tell us about your business (optional)"
              ></textarea>
            </div>

            <div v-if="isEditing">
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useFormValidation, required, email } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  firstName: [required('First name')],
  lastName: [required('Last name')],
  email: [required('Email'), email()],
  phoneNumber: [required('Phone number')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const isEditing = ref(false);

const loadProfile = async () => {
  try {
    startLoading();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await api.get(`/api/users/${userId}`);
    if (response.data) {
      formData.value = {
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || ''
      };
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load profile');
  }
};

onMounted(loadProfile);

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

    const response = await api.put(`/api/users/${userId}`, formData.value);

    if (response.data) {
      setSuccess('Profile updated successfully!');
      isEditing.value = false;
      
      // Update localStorage with new values
      localStorage.setItem('userFirstName', formData.value.firstName);
      localStorage.setItem('userLastName', formData.value.lastName);
      localStorage.setItem('userEmail', formData.value.email);
      localStorage.setItem('userPhoneNumber', formData.value.phoneNumber);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to update profile');
  }
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    // Reset form if canceling edit
    loadProfile();
    // Clear any validation errors
    clearErrors();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">Profile</h1>
        <div class="flex items-center gap-4">
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
          <div v-if="isLoading && !isEditing" class="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>

          <div v-else>
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
                label="First Name"
                :error="errors.firstName"
                :disabled="!isEditing"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="firstName"
                    v-model="formData.firstName"
                    type="text"
                    :disabled="!isEditing"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Last Name"
                :error="errors.lastName"
                :disabled="!isEditing"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="lastName"
                    v-model="formData.lastName"
                    type="text"
                    :disabled="!isEditing"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Email"
                :error="errors.email"
                :disabled="!isEditing"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    :disabled="!isEditing"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Phone Number"
                :error="errors.phoneNumber"
                :disabled="!isEditing"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="phoneNumber"
                    v-model="formData.phoneNumber"
                    type="tel"
                    :disabled="!isEditing"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <div v-if="isEditing">
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
                  {{ isLoading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
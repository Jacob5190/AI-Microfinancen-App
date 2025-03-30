<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useFormValidation, required, email } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();

const formData = ref({
  email: '',
  password: ''
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  email: [required('Email'), email()],
  password: [required('Password')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const handleLogin = async (e: Event) => {
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
    const response = await api.post('/auth/login', formData.value);

    if (response.data) {
      setSuccess('Login successful!');
      
      // Store user data in localStorage
      if (response.data.role) {
        const role = response.data.role.toLowerCase();
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userFirstName', response.data.firstName);
        localStorage.setItem('userLastName', response.data.lastName);
        localStorage.setItem('userPhoneNumber', response.data.phoneNumber);
        
        // Force a page reload to ensure all components pick up the new role
        window.location.href = '/dashboard';
        return;
      }
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Login failed');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          create a new account
        </router-link>
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

        <form class="space-y-6" @submit="handleLogin">
          <FormField
            label="Email address"
            :error="errors.email"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                autocomplete="email"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Password"
            :error="errors.password"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="password"
                v-model="formData.password"
                type="password"
                autocomplete="current-password"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
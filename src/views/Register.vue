<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFormValidation, required, email, minLength } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const router = useRouter();

const formData = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  role: 'borrower'
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  email: [required('Email'), email()],
  password: [required('Password'), minLength(8)],
  confirmPassword: [required('Confirm Password')],
  firstName: [required('First Name')],
  lastName: [required('Last Name')],
  phoneNumber: [required('Phone Number')],
  role: [required('Role')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const handleRegister = async (e: Event) => {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  clearMessages();
  
  // Validate form
  if (!validate(formData.value)) {
    return;
  }

  // Additional password match validation
  if (formData.value.password !== formData.value.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    startLoading();

    // Store registration data in sessionStorage
    const registrationData = {
      email: formData.value.email,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      phoneNumber: formData.value.phoneNumber,
      role: formData.value.role.toUpperCase()
    };
    
    sessionStorage.setItem('registrationData', JSON.stringify(registrationData));
    
    // Redirect to role-specific registration
    if (formData.value.role === 'borrower') {
      router.push('/borrower-registration');
    } else {
      router.push('/lender-registration');
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    setError(err.message || 'Registration failed. Please try again.');
  }
};

// Clear registration data if user navigates back to this page
onMounted(() => {
  sessionStorage.removeItem('registrationData');
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          sign in to your existing account
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

        <form class="space-y-6" @submit="handleRegister">
          <FormField
            label="First Name"
            :error="errors.firstName"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Last Name"
            :error="errors.lastName"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                :class="inputClasses"
              />
            </template>
          </FormField>

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
            label="Phone Number"
            :error="errors.phoneNumber"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="phoneNumber"
                v-model="formData.phoneNumber"
                type="tel"
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
                autocomplete="new-password"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="Confirm Password"
            :error="errors.confirmPassword"
            required
          >
            <template #default="{ inputClasses }">
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                type="password"
                autocomplete="new-password"
                :class="inputClasses"
              />
            </template>
          </FormField>

          <FormField
            label="I am a"
            :error="errors.role"
            required
          >
            <template #default="{ inputClasses }">
              <select
                id="role"
                v-model="formData.role"
                :class="inputClasses"
              >
                <option value="borrower">Borrower</option>
                <option value="lender">Lender</option>
              </select>
            </template>
          </FormField>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              {{ isLoading ? 'Processing...' : 'Next' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
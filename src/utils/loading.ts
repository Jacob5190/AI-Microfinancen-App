import { ref } from 'vue';

export interface LoadingState {
  isLoading: boolean;
  error: string;
  success: string;
}

export const useLoadingState = () => {
  const isLoading = ref(false);
  const error = ref('');
  const success = ref('');

  const startLoading = () => {
    isLoading.value = true;
    error.value = '';
    success.value = '';
  };

  const stopLoading = () => {
    isLoading.value = false;
  };

  const setError = (message: string) => {
    error.value = message;
    success.value = '';
    isLoading.value = false;
  };

  const setSuccess = (message: string) => {
    success.value = message;
    error.value = '';
    isLoading.value = false;

    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      success.value = '';
    }, 3000);
  };

  const clearMessages = () => {
    error.value = '';
    success.value = '';
  };

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setError,
    setSuccess,
    clearMessages
  };
};
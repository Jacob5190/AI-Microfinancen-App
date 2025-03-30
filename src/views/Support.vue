<script setup lang="ts">
import { ref } from 'vue';
import { useFormValidation, required, email } from '../utils/validation';
import { useLoadingState } from '../utils/loading';
import FormField from '../components/FormField.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import AlertMessage from '../components/AlertMessage.vue';

const faqs = [
  {
    question: 'How do I apply for a loan?',
    answer: 'You can apply for a loan by navigating to the Loan Application page after signing in. Fill out the required information about your business and loan requirements.'
  },
  {
    question: 'What documents do I need?',
    answer: 'Generally, you will need business registration documents, financial statements, and bank statements. Specific requirements will be listed during the application process.'
  },
  {
    question: 'How long does the approval process take?',
    answer: 'The approval process typically takes 2-3 business days. Our AI-powered system helps expedite the review process while ensuring thorough evaluation.'
  },
  {
    question: 'What are the interest rates?',
    answer: 'Interest rates vary based on multiple factors including business history, credit score, and loan amount. You can see personalized rates after matching with lenders.'
  }
];

const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Setup validation
const { validate, errors, clearErrors } = useFormValidation({
  name: [required('Name')],
  email: [required('Email'), email()],
  subject: [required('Subject')],
  message: [required('Message')]
});

// Setup loading state
const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  clearMessages();
  
  // Validate form
  if (!validate(contactForm.value)) {
    return;
  }
  
  try {
    startLoading();
    const response = await api.post('/api/support/contact', contactForm.value);

    if (response.data) {
      setSuccess('Message sent successfully! We will get back to you soon.');
      // Reset form
      contactForm.value = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to send message');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">Support & Help Center</h1>
      
      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- FAQs Section -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div class="space-y-6">
              <div v-for="(faq, index) in faqs" :key="index" class="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 class="text-lg font-medium text-gray-900">{{ faq.question }}</h3>
                <p class="mt-2 text-gray-500">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form Section -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-xl font-semibold mb-6">Contact Support</h2>
            
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
                label="Name"
                :error="errors.name"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="name"
                    v-model="contactForm.name"
                    type="text"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Email"
                :error="errors.email"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="email"
                    v-model="contactForm.email"
                    type="email"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Subject"
                :error="errors.subject"
                required
              >
                <template #default="{ inputClasses }">
                  <input
                    id="subject"
                    v-model="contactForm.subject"
                    type="text"
                    :class="inputClasses"
                  />
                </template>
              </FormField>

              <FormField
                label="Message"
                :error="errors.message"
                required
              >
                <template #default="{ inputClasses }">
                  <textarea
                    id="message"
                    v-model="contactForm.message"
                    rows="4"
                    :class="inputClasses"
                  ></textarea>
                </template>
              </FormField>

              <div>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
                  {{ isLoading ? 'Sending...' : 'Send Message' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
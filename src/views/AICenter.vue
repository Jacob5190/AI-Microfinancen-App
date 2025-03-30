<script setup lang="ts">
import { ref } from 'vue';
import { marked } from 'marked';
import api from '../api/axios';
import ContractAnalysisDisplay from '../components/ContractAnalysisDisplay.vue';

const contractText = ref('');
const rawAnalysis = ref<any>(null);
const isAnalyzing = ref(false);
const error = ref('');

// Progress bar state
const progress = ref(0);
const currentStage = ref('');
const stages = [
  { name: 'Preprocessing text', duration: 1000 },
  { name: 'Analyzing structure', duration: 1500 },
  { name: 'Identifying key terms', duration: 2000 },
  { name: 'Evaluating risks', duration: 1500 },
  { name: 'Generating recommendations', duration: 1000 }
];

// Explanation modal state
const showExplanationModal = ref(false);
const explanationLoading = ref(false);
const explanation = ref('');
const selectedTerm = ref('');
const explanationError = ref('');

const simulateProgress = async () => {
  progress.value = 0;
  let totalTime = 0;
  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

  for (const stage of stages) {
    currentStage.value = stage.name;
    const startProgress = (totalTime / totalDuration) * 100;
    const endProgress = ((totalTime + stage.duration) / totalDuration) * 100;
    totalTime += stage.duration;

    const startTime = Date.now();
    const duration = stage.duration;

    while (Date.now() - startTime < duration && isAnalyzing.value) {
      const elapsed = Date.now() - startTime;
      const stageProgress = elapsed / duration;
      progress.value = startProgress + (endProgress - startProgress) * stageProgress;
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    // If analysis is complete, break the loop
    if (!isAnalyzing.value) {
      progress.value = 100;
      break;
    }
  }

  // Ensure we reach 100% even if we break early
  progress.value = 100;
};

const analyzeContract = async () => {
  if (!contractText.value.trim()) return;
  
  isAnalyzing.value = true;
  error.value = '';
  rawAnalysis.value = null;
  
  try {
    // Start progress simulation
    const progressPromise = simulateProgress();
    
    // Make the API call
    const response = await api.post('/ai/contract', {
      text: contractText.value
    });
    
    // Check for error response
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    rawAnalysis.value = response.data;

    // Wait for progress animation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    isAnalyzing.value = false;
    await progressPromise;

  } catch (err: any) {
    console.error('Failed to analyze contract:', err);
    error.value = err.message || err.response?.data?.message || 'Failed to analyze contract. Please try again.';
    isAnalyzing.value = false;
  } finally {
    // Ensure progress reaches 100% before resetting
    await new Promise(resolve => {
      const checkProgress = () => {
        if (progress.value >= 100) {
          resolve(true);
        } else {
          requestAnimationFrame(checkProgress);
        }
      };
      checkProgress();
    });

    // Small delay before resetting
    await new Promise(resolve => setTimeout(resolve, 500));
    progress.value = 0;
    currentStage.value = '';
  }
};

const resetAnalysis = () => {
  contractText.value = '';
  rawAnalysis.value = null;
  error.value = '';
};

let explanationTimeout: NodeJS.Timeout;

const handleLeafClick = async (data: { key: string; value: any }) => {
  // Clear any pending requests
  if (explanationTimeout) {
    clearTimeout(explanationTimeout);
  }

  // Don't do anything if we're already loading
  if (explanationLoading.value) return;

  selectedTerm.value = data.key;
  showExplanationModal.value = true;
  explanationLoading.value = true;
  explanation.value = '';
  explanationError.value = '';

  try {
    // Add a small delay to prevent spamming
    await new Promise(resolve => {
      explanationTimeout = setTimeout(resolve, 500);
    });

    const response = await api.post('/ai/explain', {
      key: data.key,
      value: data.value,
      fullJsonString: JSON.stringify(rawAnalysis.value)
    });
    
    // Check for error response
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Parse markdown response
    explanation.value = marked(response.data);
  } catch (err: any) {
    explanationError.value = err.message || err.response?.data?.message || 'Failed to get explanation. Please try again.';
  } finally {
    explanationLoading.value = false;
  }
};

const closeExplanationModal = () => {
  if (explanationLoading.value) return;
  showExplanationModal.value = false;
  explanation.value = '';
  selectedTerm.value = '';
  explanationError.value = '';
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold leading-tight text-gray-900">AI Contract Analysis Center</h1>
      
      <div class="mt-8 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div v-if="!rawAnalysis">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Paste Your Contract</h2>
            <textarea
              v-model="contractText"
              rows="10"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Paste your contract text here..."
            ></textarea>
            <div class="mt-4">
              <button
                @click="analyzeContract"
                :disabled="!contractText.trim() || isAnalyzing"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                <span v-if="isAnalyzing">Analyzing...</span>
                <span v-else>Analyze Contract</span>
              </button>
            </div>

            <!-- Analysis Progress -->
            <div v-if="isAnalyzing || progress > 0" class="mt-6 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">{{ currentStage || 'Completing analysis...' }}</span>
                <span class="text-sm font-medium text-gray-700">{{ Math.round(progress) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
            </div>

            <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Analysis Failed</h3>
                  <p class="mt-2 text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="space-y-6">
            <ContractAnalysisDisplay 
              :analysis="rawAnalysis"
              @leaf-click="handleLeafClick"
            />

            <div class="mt-6">
              <button
                @click="resetAnalysis"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Analyze Another Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Explanation Modal -->
    <div
      v-if="showExplanationModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      @click="!explanationLoading && closeExplanationModal"
    >
      <div
        class="fixed inset-0 z-10 overflow-y-auto"
        @click.stop
      >
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                :disabled="explanationLoading"
                class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="closeExplanationModal"
              >
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg font-semibold leading-6 text-gray-900">
                  {{ selectedTerm }}
                </h3>
                <div class="mt-4">
                  <div v-if="explanationLoading" class="flex justify-center items-center py-8">
                    <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div v-else-if="explanationError" class="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-red-700">{{ explanationError }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="prose prose-sm max-w-none" v-html="explanation"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  max-width: none;
}

.prose :where(code):not(:where([class~="not-prose"] *)) {
  @apply bg-gray-100 rounded px-1 py-0.5 text-sm font-mono;
}

.prose :where(pre):not(:where([class~="not-prose"] *)) {
  @apply bg-gray-100 rounded p-4 mb-4 overflow-x-auto;
}

.prose :where(pre code):not(:where([class~="not-prose"] *)) {
  @apply bg-transparent p-0;
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useLoadingState } from '../utils/loading';
import LoadingSpinner from './LoadingSpinner.vue';
import AlertMessage from './AlertMessage.vue';

interface Document {
  id: number;
  loanId: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

const props = defineProps<{
  loanId: string;
  viewOnly?: boolean;
}>();

const documents = ref<Document[]>([]);
const uploadedFiles = ref<File[]>([]);
const showDeleteModal = ref(false);
const selectedDocument = ref<Document | null>(null);

const { isLoading, error, success, startLoading, setError, setSuccess, clearMessages } = useLoadingState();

const loadDocuments = async () => {
  try {
    startLoading();
    const response = await api.get(`/api/loans/${props.loanId}/documents`);
    documents.value = response.data;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load documents');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (props.loanId) {
    loadDocuments();
  }
});

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    uploadedFiles.value = Array.from(input.files);
  }
};

const uploadFiles = async () => {
  if (!uploadedFiles.value.length) return;

  try {
    startLoading();
    const formData = new FormData();
    formData.append('file', uploadedFiles.value[0]);

    await api.post(`/api/loans/${props.loanId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    setSuccess('Document uploaded successfully!');
    uploadedFiles.value = [];
    await loadDocuments();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to upload document');
  }
};

const downloadDocument = async (document: Document) => {
  try {
    startLoading();
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/loans/documents/${document.id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = document.fileName; // Default to document filename
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    setSuccess('Document downloaded successfully');
  } catch (err: any) {
    console.error('Download error:', err);
    setError('Failed to download document');
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (document: Document) => {
  selectedDocument.value = document;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!selectedDocument.value) return;

  try {
    startLoading();
    await api.delete(`/api/loans/documents/${selectedDocument.value.id}`);
    setSuccess('Document deleted successfully');
    showDeleteModal.value = false;
    selectedDocument.value = null;
    await loadDocuments();
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to delete document');
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="space-y-6">
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

    <!-- Upload Section - Only shown in edit mode -->
    <div v-if="!viewOnly" class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900">Upload Document</h3>
        <div class="mt-4">
          <input
            type="file"
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div v-if="uploadedFiles.length" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700">Selected File:</h4>
            <div class="mt-2 text-sm text-gray-500">
              {{ uploadedFiles[0].name }}
            </div>
            <button
              @click="uploadFiles"
              :disabled="isLoading"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
              {{ isLoading ? 'Uploading...' : 'Upload File' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Documents List -->
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900">Documents</h3>
        <div class="mt-4">
          <div v-if="isLoading" class="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>

          <div v-else-if="documents.length === 0" class="text-center py-8 text-gray-500">
            No documents available.
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li v-for="doc in documents" :key="doc.id" class="py-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900">{{ doc.fileName }}</span>
                  </div>
                  <div class="mt-1 text-sm text-gray-500">
                    <p>Uploaded: {{ formatDate(doc.uploadedAt) }}</p>
                  </div>
                </div>
                <div class="flex space-x-3">
                  <button
                    @click="downloadDocument(doc)"
                    class="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    title="Download"
                  >
                    Download
                  </button>
                  <button
                    v-if="!viewOnly"
                    @click="confirmDelete(doc)"
                    class="text-red-600 hover:text-red-900 focus:outline-none"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
      <div class="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Delete Document
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleDelete"
            :disabled="isLoading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-400"
          >
            <LoadingSpinner v-if="isLoading" size="sm" class="mr-2" />
            {{ isLoading ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            type="button"
            @click="showDeleteModal = false"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
import { ref } from 'vue';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
}

export const useFormValidation = (rules: ValidationRules) => {
  const errors = ref<Record<string, string>>({});
  
  const validate = (formData: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      // Get the first failing rule's message
      const failingRule = fieldRules.find(rule => !rule.validate(formData[field]));
      if (failingRule) {
        newErrors[field] = failingRule.message;
      }
    });
    
    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    errors.value = {};
  };

  const hasError = (field: string): boolean => {
    return !!errors.value[field];
  };

  const getError = (field: string): string => {
    return errors.value[field] || '';
  };

  return {
    errors,
    validate,
    clearErrors,
    hasError,
    getError
  };
};

// Common validation rules
export const required = (fieldName: string): ValidationRule => ({
  validate: (value: any) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  },
  message: `${fieldName} is required`
});

export const email = (): ValidationRule => ({
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  message: 'Please enter a valid email address'
});

export const minLength = (length: number): ValidationRule => ({
  validate: (value: string) => value.length >= length,
  message: `Must be at least ${length} characters`
});

export const maxLength = (length: number): ValidationRule => ({
  validate: (value: string) => value.length <= length,
  message: `Must not exceed ${length} characters`
});

export const numeric = (): ValidationRule => ({
  validate: (value: any) => !isNaN(value) && value !== '',
  message: 'Must be a number'
});

export const positiveNumber = (): ValidationRule => ({
  validate: (value: any) => !isNaN(value) && Number(value) > 0,
  message: 'Must be a positive number'
});

export const maxValue = (max: number): ValidationRule => ({
  validate: (value: any) => !isNaN(value) && Number(value) <= max,
  message: `Must not exceed ${max}`
});

export const minValue = (min: number): ValidationRule => ({
  validate: (value: any) => !isNaN(value) && Number(value) >= min,
  message: `Must be at least ${min}`
});
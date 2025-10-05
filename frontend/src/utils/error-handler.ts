import { AxiosError } from 'axios';

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again later.';

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return extractAxiosErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
}

function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

function extractAxiosErrorMessage(error: AxiosError): string {
  const backendMessage = extractBackendErrorMessage(error);
  if (backendMessage) {
    return backendMessage;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request is taking too long. Please try again later.';
  }

  if (!error.response && error.request) {
    return 'Unable to connect to the server. Please try again later.';
  }

  return DEFAULT_ERROR_MESSAGE;
}

function extractBackendErrorMessage(error: AxiosError): string | null {
  const responseData = error.response?.data as ErrorResponse;

  if (responseData?.errors) {
    return formatValidationErrors(responseData.errors);
  }

  return responseData?.message || null;
}

function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .flatMap(([key, errorArray]) => errorArray.map((errorMessage) => `- ${key} ${errorMessage}`))
    .join('\n');
}

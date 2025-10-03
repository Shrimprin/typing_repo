import { AxiosError } from 'axios';

type ErrorResponse = {
  message?: string;
};

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return extractAxiosErrorMessage(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
}

function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

function extractAxiosErrorMessage(error: AxiosError): string {
  const backendMessage = extractBackendErrorMessage(error);
  if (backendMessage) {
    return backendMessage;
  }

  if (!error.response && error.request) {
    return 'Unable to connect to the server. Please try again later.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request is taking too long. Please try again later.';
  }

  return 'An error occurred. Please try again later.';
}

function extractBackendErrorMessage(error: AxiosError): string | null {
  const responseData = error.response?.data as ErrorResponse;

  if (!responseData.message) {
    return null;
  }

  return responseData.message;
}

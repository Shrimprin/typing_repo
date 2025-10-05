import { AxiosError } from 'axios';

import { extractErrorMessage } from '@/utils/error-handler';

function createAxiosError(overrides: Record<string, unknown> = {}): AxiosError {
  const error = new AxiosError('Test error');
  return Object.assign(error, overrides);
}

describe('errorHandler', () => {
  describe('extractErrorMessage', () => {
    it('returns backend error message when error has response data', () => {
      const error = createAxiosError({
        response: {
          data: {
            message: 'Backend error message',
          },
        },
      });

      expect(extractErrorMessage(error)).toBe('Backend error message');
    });

    it('returns network error message for network errors', () => {
      const error = createAxiosError({
        request: {},
        response: undefined,
      });

      expect(extractErrorMessage(error)).toBe('Unable to connect to the server. Please try again later.');
    });

    it('returns timeout error message when timeout occurs', () => {
      const error = createAxiosError({
        code: 'ECONNABORTED',
      });

      expect(extractErrorMessage(error)).toBe('The request is taking too long. Please try again later.');
    });

    it('returns default message when unexpected axios error occurs', () => {
      const error = createAxiosError();

      expect(extractErrorMessage(error)).toBe('An unexpected error occurred. Please try again later.');
    });

    it('returns standard Error message when standard Error occurs', () => {
      const error = new Error('Standard error message');

      expect(extractErrorMessage(error)).toBe('Standard error message');
    });

    it('returns default message when unexpected error occurs', () => {
      const error = { someProperty: 'Unexpected error' };

      expect(extractErrorMessage(error)).toBe('An unexpected error occurred. Please try again later.');
    });

    it('returns all  errors when multiple errors exist', () => {
      const error = createAxiosError({
        response: {
          data: {
            errors: {
              name: ['is required', 'is too short'],
              url: ['is invalid'],
              commit_hash: ['is required'],
            },
          },
        },
      });

      expect(extractErrorMessage(error)).toBe(
        '- name is required\n- name is too short\n- url is invalid\n- commit_hash is required',
      );
    });
  });
});

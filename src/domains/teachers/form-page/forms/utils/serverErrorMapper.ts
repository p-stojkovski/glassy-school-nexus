import { UseFormReturn } from 'react-hook-form';
import { TeacherFormData, ProblemDetails, TeacherHttpStatus } from '@/types/api/teacher';

/**
 * Shape of API errors thrown by the teacher form submission
 */
interface ApiError {
  status?: number;
  message?: string;
  details?: ProblemDetails;
}

/**
 * Type guard to check if an error is an API error with expected shape
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'message' in error || 'details' in error)
  );
}

/**
 * Maps server field names (PascalCase or camelCase) to form field names
 */
const FIELD_MAP: Record<string, keyof TeacherFormData> = {
  Name: 'name',
  Email: 'email',
  Phone: 'phone',
  SubjectId: 'subjectId',
  Notes: 'notes',
  name: 'name',
  email: 'email',
  phone: 'phone',
  subjectId: 'subjectId',
  notes: 'notes',
};

/**
 * Maps form field names to the tab they belong to
 */
const FIELD_TO_TAB: Record<keyof TeacherFormData, string> = {
  name: 'personal-info',
  email: 'personal-info',
  phone: 'personal-info',
  subjectId: 'personal-info',
  notes: 'professional-info',
};

/**
 * Attempts to find a form field from a server field key using various matching strategies
 */
function resolveFieldFromKey(key: string): keyof TeacherFormData | null {
  // Direct match from field map
  const direct = FIELD_MAP[key];
  if (direct) return direct;

  // Try PascalCase conversion
  const pascalCase = key.charAt(0).toUpperCase() + key.slice(1);
  const byCase = FIELD_MAP[pascalCase];
  if (byCase) return byCase;

  // Fuzzy match by field name inclusion
  const keyLower = key.toLowerCase();
  if (keyLower.includes('email')) return 'email';
  if (keyLower.includes('name')) return 'name';
  if (keyLower.includes('phone')) return 'phone';
  if (keyLower.includes('subject')) return 'subjectId';
  if (keyLower.includes('note')) return 'notes';

  return null;
}

/**
 * Result of server error mapping operation
 */
export interface ServerErrorMappingResult {
  /** Whether any errors were mapped to form fields */
  handled: boolean;
  /** The first field that had an error (for focusing) */
  firstErrorField: keyof TeacherFormData | null;
  /** The tab containing the first error (for navigation) */
  firstErrorTab: string | null;
}

/**
 * Maps server-side validation errors to form fields and returns information
 * about which tab to navigate to and which field to focus.
 *
 * Handles three error scenarios:
 * 1. Duplicate email conflict (HTTP 409)
 * 2. ASP.NET Core ProblemDetails validation errors (HTTP 400 with errors object)
 * 3. Generic email-related bad request (HTTP 400 with "email" in message)
 *
 * @param error - The error thrown by the form submission
 * @param form - The react-hook-form instance
 * @returns Information about the mapping result for navigation/focus handling
 */
export function mapServerErrorsToForm(
  error: unknown,
  form: UseFormReturn<TeacherFormData>
): ServerErrorMappingResult {
  const result: ServerErrorMappingResult = {
    handled: false,
    firstErrorField: null,
    firstErrorTab: null,
  };

  if (!isApiError(error)) {
    return result;
  }

  const { status, message = '', details } = error;

  // Case 1: Duplicate email conflict (HTTP 409)
  if (status === TeacherHttpStatus.CONFLICT && /email/i.test(message)) {
    form.setError('email', {
      type: 'server',
      message: 'A teacher with this email address already exists. Please use a different email.',
    });
    return {
      handled: true,
      firstErrorField: 'email',
      firstErrorTab: FIELD_TO_TAB.email,
    };
  }

  // Case 2: ASP.NET Core ProblemDetails validation errors (HTTP 400 with errors object)
  if (
    status === TeacherHttpStatus.BAD_REQUEST &&
    details &&
    typeof details.errors === 'object'
  ) {
    let firstField: keyof TeacherFormData | null = null;

    for (const [key, msgs] of Object.entries(details.errors)) {
      const field = resolveFieldFromKey(key);
      if (field) {
        const msgText = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
        form.setError(field, { type: 'server', message: msgText });
        if (!firstField) {
          firstField = field;
        }
      }
    }

    if (firstField) {
      return {
        handled: true,
        firstErrorField: firstField,
        firstErrorTab: FIELD_TO_TAB[firstField],
      };
    }
  }

  // Case 3: Generic email-related bad request (HTTP 400 with "email" in message)
  if (status === TeacherHttpStatus.BAD_REQUEST && /email/i.test(message)) {
    form.setError('email', {
      type: 'server',
      message,
    });
    return {
      handled: true,
      firstErrorField: 'email',
      firstErrorTab: FIELD_TO_TAB.email,
    };
  }

  return result;
}

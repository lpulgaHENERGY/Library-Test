/**
 * useCreateWebMessage — React hook for submitting a contact form message.
 *
 * Returns { submit, status, error }:
 *   submit(input)  — sends the web message; no-ops when a submission is
 *                    already in flight (prevents double-submit on fast clicks).
 *   status         — 'idle' | 'sending' | 'sent' | 'error'
 *   error          — human-readable API error string, or null when none.
 *
 * Compatible with React 16 (useState only — no concurrent-mode APIs).
 */

import { useState } from 'react';
import { WebMessageCreateInput } from '../../types/webMessage';
import { createWebMessage } from '../services/webMessageService';

export type SubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface UseCreateWebMessageResult {
  /**
   * Initiate a form submission.  Pass the raw form field values; the hook
   * maps them directly to the Dataverse column names in the POST body.
   * Calling this while status === 'sending' is a safe no-op.
   */
  submit: (input: WebMessageCreateInput) => void;
  /** Current submission lifecycle state. */
  status: SubmitStatus;
  /** Human-readable API error message, or null when there is no error. */
  error: string | null;
}

/**
 * Wraps the createWebMessage service call in React state management.
 *
 * Usage:
 *   const { submit, status, error } = useCreateWebMessage();
 *
 *   // In the form's onSubmit handler (after client-side validation passes):
 *   submit({ lpulga_name: name, lpulga_email: email, lpulga_message: message });
 */
export function useCreateWebMessage(): UseCreateWebMessageResult {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError]   = useState<string | null>(null);

  function submit(input: WebMessageCreateInput): void {
    // Prevent double-submission while a request is already in flight.
    if (status === 'sending') return;

    setStatus('sending');
    setError(null);

    // void suppresses the "floating promise" TypeScript warning;
    // state updates are handled entirely inside the .then() / rejection handler.
    void createWebMessage(input).then(
      () => {
        setStatus('sent');
      },
      (err: unknown) => {
        setStatus('error');
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to send message. Please try again.',
        );
      },
    );
  }

  return { submit, status, error };
}

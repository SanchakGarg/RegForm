export interface User {
  name: string;
  universityName: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  VerificationId?: string;
  vid?: string;
}

export interface ErrorMessage {
  code: number;
  message: string;
  details?: string;
}

export function createErrorResponse(code: number, message: string, details?: string): Response {
    const errorMessage: ErrorMessage = { code, message, details };
    return new Response(JSON.stringify(errorMessage), {
      status: code,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
export interface User {
  _id:Object;
  name: string;
  universityName: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  VerificationId?: string;
  vid?: string;
}

export interface ErrorMessage {
  success : false,
  code: number;
  message: string;
  details?: string;
}

export function createErrorResponse(code: number, message: string, details?: string): Response {
    const errorMessage: ErrorMessage = {success:false, code, message, details };
    return new Response(JSON.stringify(errorMessage), {
      status: code,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
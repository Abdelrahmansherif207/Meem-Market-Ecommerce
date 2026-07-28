export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ActionState {
  success: boolean;
  fieldErrors?: Record<string, string>;
  message?: string;
  payload?: Record<string, string>;
}

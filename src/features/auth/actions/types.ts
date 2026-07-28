import type { AuthLoginData } from "../types";

export interface ActionState {
  success: boolean;
  fieldErrors?: Record<string, string>;
  message?: string;
  payload?: Record<string, string>;
  data?: AuthLoginData;
}

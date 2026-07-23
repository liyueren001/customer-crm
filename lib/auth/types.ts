export type AuthFormState = {
  error: string | null;
  status?: "check-email";
};

export const initialAuthFormState: AuthFormState = { error: null };

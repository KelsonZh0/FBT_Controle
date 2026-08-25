import { useMutation } from '@tanstack/react-query';
import {
  login as loginRequest,
  register as registerRequest,
  resetPassword as resetPasswordRequest,
  validateRecoveryEmail as validateRecoveryEmailRequest,
} from '@/services/auth';
import { useSession } from '@/session/session';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  document?: string;
}

interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

export function useLogin() {
  const { login } = useSession();

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => loginRequest(email, password),
    onSuccess: (auth) => login(auth),
  });
}

export function useRegister() {
  const { login } = useSession();

  return useMutation({
    mutationFn: ({ name, email, password, document }: RegisterInput) =>
      registerRequest(name, email, password, document),
    onSuccess: (auth) => login(auth),
  });
}

export function useValidateRecoveryEmail() {
  return useMutation({
    mutationFn: (email: string) => validateRecoveryEmailRequest(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, newPassword }: ResetPasswordInput) =>
      resetPasswordRequest(email, newPassword),
  });
}

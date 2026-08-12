import { useMutation } from '@tanstack/react-query';
import { login as loginRequest, register as registerRequest } from '@/services/auth';
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

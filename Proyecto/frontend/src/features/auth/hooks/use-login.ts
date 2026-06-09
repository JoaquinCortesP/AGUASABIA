import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth-store";
import { authApi } from "@/features/auth/api/auth-api";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: (result) => {
      setCredentials(result.accessToken, result.user);
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? "/app/dashboard", { replace: true });
    },
  });
}

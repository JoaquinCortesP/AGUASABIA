import { useQuery } from "@tanstack/react-query";
import { parcelasApi } from "@/features/parcelas/api/parcelas-api";

export const parcelasQueryKey = ["parcelas"] as const;

export function useParcelas() {
  return useQuery({
    queryKey: parcelasQueryKey,
    queryFn: parcelasApi.list,
  });
}

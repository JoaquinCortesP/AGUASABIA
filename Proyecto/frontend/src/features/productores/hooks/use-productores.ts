import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productoresApi } from "@/features/productores/api/productores-api";
import type {
  ProducerCreatePayload,
  ProducerRecord,
} from "@/features/productores/types/productor.types";

export const productoresQueryKey = ["productores"] as const;

export function useProductores() {
  return useQuery({
    queryKey: productoresQueryKey,
    queryFn: productoresApi.list,
  });
}

export function useCreateProductor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProducerCreatePayload) => productoresApi.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<ProducerRecord[]>(productoresQueryKey, (current) => [
        created,
        ...(current ?? []),
      ]);
    },
  });
}

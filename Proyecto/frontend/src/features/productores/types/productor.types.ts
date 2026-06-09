import type { Coordinates, ProducerSummary } from "@/types/domain";
import type { ProducerFormValues } from "@/features/productores/schemas/productor.schema";

export interface ProducerCreatePayload extends ProducerFormValues {
  poligono_vertices: Coordinates[];
}

export type ProducerRecord = ProducerSummary;

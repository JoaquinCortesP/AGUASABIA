import { z } from "zod";

export const productorSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  telefono: z.string().min(8, "Ingresa un telefono valido."),
  comuna: z.string().min(2, "Selecciona una comuna."),
  cultivo: z.string().min(2, "Indica el cultivo principal."),
  hectareas: z.coerce.number().positive("Debe ser mayor a 0."),
});

export type ProducerFormValues = z.infer<typeof productorSchema>;

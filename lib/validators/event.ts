import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().trim().optional(),
  tags: z.array(z.string()),
  status: z.enum(["interested", "going", "attended"]),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

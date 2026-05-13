import { z } from "zod";

export const personFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.string().trim().optional(),
  company: z.string().trim().optional(),
  note: z.string().trim().optional(),
  tags: z.array(z.string()),
  eventMetId: z.string().optional(),
  closeness: z.enum(["close", "warm", "cooling"]),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

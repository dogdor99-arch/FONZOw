import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { createEnquiry, listEnquiries, updateEnquiryStatus } from "../fonzoDb";
import { notifyOwner } from "../_core/notification";

export const enquiryRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(160),
        email: z.string().email().max(320),
        phone: z.string().max(40).optional(),
        subject: z.string().max(240).optional(),
        message: z.string().min(1).max(4000),
        productCode: z.string().max(32).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await createEnquiry({
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        subject: input.subject || null,
        message: input.message,
        productCode: input.productCode || null,
      });

      // Best-effort push so the showroom team sees new enquiries quickly.
      void notifyOwner({
        title: `Fonzo enquiry — ${input.name}`,
        content: `${input.subject ? `${input.subject}\n\n` : ""}${input.message}\n\n${input.email}${
          input.phone ? ` · ${input.phone}` : ""
        }`,
      }).catch(() => undefined);

      return { success: true, id: result.id } as const;
    }),

  list: adminProcedure.query(() => listEnquiries()),

  setStatus: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "in_progress", "closed"]) }))
    .mutation(async ({ input }) => {
      await updateEnquiryStatus(input.id, input.status);
      return { success: true } as const;
    }),
});

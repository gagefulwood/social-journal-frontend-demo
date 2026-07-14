import { z } from "zod";

const optionalDate = z.string().optional();
const phonePattern = /^\+?[0-9().\- xX]{7,32}$/;

export const contactMethodSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    kind: z.enum(["email", "phone"]),
    label: z.string().optional(),
    value: z.string().min(1, "Enter a value"),
    is_primary: z.boolean(),
  })
  .superRefine((method, context) => {
    if (method.kind === "email" && !z.email().safeParse(method.value).success) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "Enter a valid email",
      });
    }
    if (
      method.kind === "phone" &&
      (!phonePattern.test(method.value) ||
        method.value.replace(/\D/g, "").length < 7)
    ) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "Enter a valid phone number",
      });
    }
  });

export const addressSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  label: z.string().optional(),
  line_1: z.string().min(1, "Street is required"),
  line_2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  country_code: z
    .string()
    .refine(
      (value) => !value || /^[A-Za-z]{2}$/.test(value),
      "Use a two-letter country code",
    )
    .optional(),
  is_primary: z.boolean(),
});

function validateDateRange(
  entry: { start_date?: string; end_date?: string; is_current: boolean },
  context: z.RefinementCtx,
) {
  if (entry.start_date && entry.end_date && entry.end_date < entry.start_date) {
    context.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "End date must be on or after start date",
    });
  }
  if (entry.is_current && entry.end_date) {
    context.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "Current entries cannot have an end date",
    });
  }
}

export const employmentSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().min(1, "Title is required"),
    organization: z.string().optional(),
    start_date: optionalDate,
    end_date: optionalDate,
    is_current: z.boolean(),
  })
  .superRefine(validateDateRange);

export const educationSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    credential: z.string().optional(),
    field_of_study: z.string().optional(),
    institution: z.string().min(1, "Institution is required"),
    start_date: optionalDate,
    end_date: optionalDate,
    is_current: z.boolean(),
  })
  .superRefine(validateDateRange);

const contactProfileShape = {
  preferred_name: z.string().optional(),
  gender_identity: z.string().optional(),
  pronouns: z.string().optional(),
  birth_date: optionalDate,
  timezone: z.string().optional(),
  first_met_on: optionalDate,
  met_through: z.string().optional(),
  met_location: z.string().optional(),
  contact_methods: z.array(contactMethodSchema),
  addresses: z.array(addressSchema),
  employment: z.array(employmentSchema),
  education: z.array(educationSchema),
};

export function validateContactProfileCollections(
  profile: z.infer<z.ZodObject<typeof contactProfileShape>>,
  context: z.RefinementCtx,
) {
  for (const kind of ["email", "phone"] as const) {
    if (
      profile.contact_methods.filter(
        (method) => method.kind === kind && method.is_primary,
      ).length > 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["contact_methods"],
        message: `Only one primary ${kind} is allowed`,
      });
    }
  }
  if (profile.addresses.filter((address) => address.is_primary).length > 1) {
    context.addIssue({
      code: "custom",
      path: ["addresses"],
      message: "Only one primary address is allowed",
    });
  }
}

export const contactProfileSchema = z
  .object(contactProfileShape)
  .superRefine(validateContactProfileCollections);

export type ContactProfileFormValues = z.infer<typeof contactProfileSchema>;

import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Non-negative currency amount submitted as a string from a number input.
// Matches LeadCreate.estimated_value (float | None) in backend/app/schemas/crm.py —
// optional, but must be a real non-negative number when provided.
const optionalAmountSchema = z
 .string()
 .trim()
 .optional()
 .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid non-negative amount.');

// ConvertToLeadModal only lets the admin edit estimated_value and notes —
// the rest of the LeadCreate payload (contact_name, email, phone, company)
// is read-only, pre-filled from the contact submission.
export const convertToLeadSchema = z.object({
 estimatedValue: optionalAmountSchema,
 notes: z.string().trim().optional(),
});

export function validateConvertToLead(data) {
 return parseWithSchema(convertToLeadSchema, data).errors;
}

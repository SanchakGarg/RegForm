import { z, ZodObject, ZodRawShape, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodDate, ZodEnum, ZodEffects } from "zod";

// Generate default values function
export const generateDefaultValues = (schema: ZodObject<ZodRawShape>): Record<string, any> => {
  const defaultValues: Record<string, any> = {};

  // Iterate through each field in the schema
  for (const [key, value] of Object.entries(schema.shape)) {
    if (value instanceof ZodObject) {
      // If the field is a nested Zod object, recursively generate default values for it
      defaultValues[key] = generateDefaultValues(value);
    } else if (value instanceof ZodString) {
      // If the field is a string, set an empty string as the default
      defaultValues[key] = '';
    } else if (value instanceof ZodNumber) {
      // If the field is a number, set 0 as the default
      defaultValues[key] = 0;
    } else if (value instanceof ZodBoolean) {
      // If the field is a boolean, set false as the default
      defaultValues[key] = false;
    } else if (value instanceof ZodArray) {
      // Handle arrays, especially with `.min` and `.max` validations
      const elementSchema = value._def.type;
      const maxCount = value._def.maxLength?.value || 0; // Use `max` if available, otherwise default to 0

      if (elementSchema instanceof ZodObject && maxCount > 0) {
        // Generate default values for each element based on `max`
        Array.from({ length: maxCount }, (_, index) => {
          return generateDefaultValues(elementSchema);
        }).forEach((val, idx) => {
          // Remove or replace hyphen with an underscore for the new key
          const newKey = `playerFields${idx + 1}`;  // Example: `playerFields1`, `playerFields2`, ...
          defaultValues[newKey] = val; // Set the value directly in the defaultValues object
        });
      } else {
        // If no max or not a ZodObject, set an empty array
        defaultValues[key] = [];
      }
    } else {
      // For other types, set null as the default
      defaultValues[key] = null;
    }
  }

  return defaultValues;
};

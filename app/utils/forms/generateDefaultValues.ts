import { z, ZodObject, ZodRawShape, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodDate, ZodEnum, ZodEffects } from "zod";

export const generateDefaultValues = (schema: ZodObject<ZodRawShape>): Record<string, any> => {
  const defaultValues: Record<string, any> = {};

  // Iterate over the schema's shape to generate default values
  for (const [key, value] of Object.entries(schema.shape)) {
    if (value instanceof ZodEffects) {
      // Handle ZodEffects schema by recursively calling generateDefaultValues on its inner schema
      defaultValues[key] = generateDefaultForType(value._def.schema);
    } else {
      // For non-ZodEffects schemas
      defaultValues[key] = generateDefaultForType(value);
    }
  }

  return defaultValues;
};

const generateDefaultForType = (schema: any): any => {
  if (schema instanceof ZodObject) {
    // If schema is an object, generate default values for all fields within that object
    return generateDefaultValues(schema);
  }
  
  if (schema instanceof ZodString || schema instanceof ZodEnum) {
    // Default value for string or enum is an empty string
    return undefined;
  }
  
  if (schema instanceof ZodNumber) {
    // Default value for number is 0
    return undefined;
  }
  
  if (schema instanceof ZodBoolean) {
    // Default value for boolean is false
    return undefined;
  }
  
  if (schema instanceof ZodDate) {
    // Default value for date is null
    return undefined;
  }
  
  if (schema instanceof ZodArray) {
    // For arrays, generate defaults for the elements
    const elementSchema = schema._def.type;
    
    // Handle array length constraints
    const minCount = schema._def.minLength?.value || 0;

    if (elementSchema instanceof ZodObject) {
      // If the array elements are objects, create an array of objects with default values
      return Array.from({ length: minCount > 0 ? minCount : 1 }, (_, idx) => {
        const values = generateDefaultValues(elementSchema);
        return { ...values, fieldIndex: idx + 1 }; // Optionally include fieldIndex if needed
      });
    }

    // If array element is not an object, return an empty array
    return Array.from({ length: minCount > 0 ? minCount : 0 }, () => generateDefaultForType(elementSchema));
  }

  return undefined;
};

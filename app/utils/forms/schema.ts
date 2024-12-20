// ---------- Interfaces ----------
/*
Defines the core structure of form fields, containers, pages, sub-events, and the overall event schema.
*/
interface FormField {
    name: string; // Field identifier
    label: string; // Display label for the field
    type: "text" | "email" | "number" | "date" | "select"; // Input type
    required: boolean; // Whether the field is mandatory
    options?: string[]; // For select fields, options to display
    validator?: (value: any) => string | null; // Custom validator (returns error message or null if valid)
}

interface FormFieldContainer {
    title?: string; // Title of the container (e.g., "Coach Details" or "Player Details")
    repeatable?: boolean; // Whether the container is repeatable
    minRepeats?: number; // Minimum number of repeats
    maxRepeats?: number; // Maximum number of repeats
    fields: FormField[]; // List of fields in the container
}

interface Page {
    fields?: (FormField | FormFieldContainer)[]; // Fields or containers for the page
}

interface SubEventSchema {
    eventName: string; // Name of the event
    specificPages: Page[]; // List of specific pages for the event
}

interface EventSchema {
    commonPages: Page[]; // Common pages shared across all sub-events
    subEvents: SubEventSchema[]; // Sub-events with specific pages
}

// ---------- Validators ----------
/*
Custom validation functions for email, number, and date fields.
*/
const emailValidator = (value: any): string | null => {
    if (typeof value !== "string" || value.trim() === "") {
        return "This field must be a valid email address";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return "Invalid email address";
    }
    return null;
};

const numberValidator = (value: any): string | null => {
    if (typeof value !== "number") {
        return "This field must be a number";
    }
    if (value.toString().length > value) {
        return `This field must not exceed ${value} digits`;
    }
    return null;
};

const dateValidator = (value: any): string | null => {
    const minDate = new Date("1995-01-01");
    const maxDate = new Date("2005-12-31");

    if (typeof value !== "string" && !(value instanceof Date)) {
        return "This field must be a valid date";
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return "Invalid date format";
    }

    if (date < minDate) {
        return `Date must not be earlier than ${minDate.toDateString()}`;
    }
    if (date > maxDate) {
        return `Date must not be later than ${maxDate.toDateString()}`;
    }

    return null;
};

// ---------- Sports List ----------
/*
List of available sports for the event schema.
*/
export const sports = [
    "Badminton (Men)",
    "Badminton (Women)",
    "Basketball (Men)",
    "Basketball (Women)",
    "Chess (Mixed)",
    "Cricket (Men)",
    "Football (Men)",
    "Futsal (Women)",
    "Tennis (Mixed)",
    "Volleyball (Men)",
    "Volleyball (Women)",
    "Table Tennis (Men)",
    "Table Tennis (Women)",
    "Squash (Men)",
    "Squash (Women)",
    "Swimming (Men)",
    "Swimming (Women)",
    "8 Ball Pool (Men)",
    "Snooker (Men)",
    "Shooting",
];

// ---------- Generic Fields ----------
/*
Common fields used across various containers in the schema.
*/
const genericFields: FormField[] = [
    { name: "name", label: "Player Name", type: "text", required: true },
    {
        name: "DOB",
        label: "Player Date of Birth",
        type: "date",
        required: true,
        validator: dateValidator,
    },
    { name: "email", label: "Player Email", type: "email", required: true, validator: emailValidator },
    {
        name: "phoneNumber",
        label: "Player Phone Number",
        type: "number",
        required: true,
        validator: numberValidator,
    },
];

// ---------- Coach Fields ----------
/*
Specific fields for the coach details container.
*/
const coachFields: FormField[] = [
    { name: "name", label: "Coach Name", type: "text", required: true },
    {
        name: "gender",
        label: "Coach Gender",
        type: "select",
        required: true,
        options: ["Male", "Female", "Other"],
    },
    { name: "email", label: "Coach Email", type: "email", required: true, validator: emailValidator },
    {
        name: "phoneNumber",
        label: "Coach Phone Number",
        type: "number",
        required: true,
        validator: numberValidator,
    },
];

// ---------- Sport Field ----------
/*
Field for selecting sports.
*/
const sportField: FormField = {
    name: "selectSports",
    label: "Select Sports",
    type: "select",
    required: true,
    options: sports,
};

// ---------- Event Schema ----------
/*
Defines the overall event schema including common pages and sub-events.
*/
export const eventSchema: EventSchema = {
    commonPages: [
        {
            fields: [sportField],
        },
    ],
    subEvents: [
        {
            eventName: "Basketball",
            specificPages: [
                {
                    fields: [
                        {
                            title: "Coach Details",
                            fields: coachFields,
                        },
                        {
                            title: "Player Details",
                            repeatable: true,
                            minRepeats: 2,
                            maxRepeats: 12,
                            fields: genericFields,
                        },
                    ],
                },
            ],
        },
    ],
};

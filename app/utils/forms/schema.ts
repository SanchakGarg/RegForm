// ---------- Interfaces ----------
/*
Defines the core structure of form fields, containers, pages, sub-events, and the overall event schema.
*/
import { date, z } from "zod";

interface Page {
    pageName: string;
    fields: z.ZodObject<any>;
    meta:formMeta;
}
interface SubEvent {
    eventName: string;
    specificPages: Page[]; // Pages specific to this sub-event
}

interface EventSchema {
    commonPages: Page[]; // Common pages shared across all sub-events
    subEvents: Record<string, SubEvent>; // Sub-events keyed by their names
}



interface fieldMeta {
    label: string;
    placeholder?: string
}
export interface formMeta {
    [key: string]: fieldMeta | formMeta;
}
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
] as const;

// ---------- Generic Fields ----------
/*
Common fields used across various containers in the schema.
*/
export const genericFields = z.object({
    name: z.string().min(1, "Name is required"),
    date: z.date().refine(
        (date) => {
            const currentDate = new Date();
            const minDate = new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate());
            const maxDate = new Date(currentDate.getFullYear() - 17, currentDate.getMonth(), currentDate.getDate());
            return date >= minDate && date <= maxDate;
        },
        { message: "age must be between 17 and 25 years old" }
    ),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ),
});



export const genericMeta: formMeta = {
    title:{label:"Player-"},
    name:{label:"Name",placeholder:"Name"},
    date:{label:"Date Of Birth",placeholder:"Pick a date"},
    email:{label:"Email",placeholder:"Email"},
    phone:{label:"Phone Number", placeholder:"Phone Number"}
} 
// ---------- Coach Fields ----------
/*
Specific fields for the coach details container.
*/
export const coachFields = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ).optional(),
    gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
});
export const coachFieldsMeta:formMeta ={
    title:{label:"Coach Details"},
    name:{label:"Name",placeholder:"Name"},
    gender:{label:"Gender",placeholder:"Select Gender"},
    email:{label:"Email",placeholder:"Email"},
    phone:{label:"Phone Number", placeholder:"Phone Number"}
}


// ---------- Sport Field ----------
/*
Field for selecting sports.
*/
export const sportField = z.object({
    sports: z.enum(sports, { message: "Select a sport" }),
});

export const sportFieldMeta: formMeta = {

    sports: { label: "Select a Sport", placeholder: "Select a sport" }

}
// ---------- Event Schema ----------
/*
Defines the overall event schema including common pages and sub-events.
*/
export const eventSchema: EventSchema = {
    commonPages: [
        {
            pageName: "Sports Selection",
            fields: sportField,
            meta:sportFieldMeta
        },
    ],
    subEvents: {
        Basketball: {
            eventName: "Basketball",
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        playerFields: z.array(genericFields)
                            .min(2, "Fill details of minimum two players") // Minimum 2 players
                            .max(7, "A maximum of 7 players are allowed"), // Maximum 7 players
                    }),
                    meta:{}
                },
            ],
        },
        Football: {
            eventName: "Football",
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(genericFields)
                            .min(1, "Fill details of minimum eleven players")
                            .max(15, "A maximum of 15 players are allowed"),
                    }),
                    meta:{coachFields:coachFieldsMeta,playerFields:genericMeta

                    }
                },
            ],
        },
    },
};

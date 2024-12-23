// ---------- Interfaces ----------
/*
Defines the core structure of form fields, containers, pages, sub-events, and the overall event schema.
*/
import { z } from "zod";

interface Page {
    pageName: string;
    fields: z.ZodObject<any>; // Fields for the pagez.ZodObject<any>
}

interface SubEvent {
    eventName: string;
    specificPages: Page[]; // Pages specific to this sub-event
}

interface EventSchema {
    commonPages: Page[]; // Common pages shared across all sub-events
    subEvents: SubEvent[]; // Sub-events with specific pages
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
const genericFields = z.object({
    name: z.string().min(1, "Name is required"),
    date: z.date().refine(
        (date) => {
            const currentDate = new Date();
            const minDate = new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate());
            const maxDate = new Date(currentDate.getFullYear() - 17, currentDate.getMonth(), currentDate.getDate());
            return date >= minDate && date <= maxDate;
        },
        { message: "Date must be between 17 and 25 years ago" }
    ),
    email: z.string().email("Invalid email address"),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be between 10 and 15 digits" }
    ),
});

// ---------- Coach Fields ----------
/*
Specific fields for the coach details container.
*/
export const coachFields = z.object({
    "name": z.string().min(1, "Name is required"),
    date: z.date().refine(
        (date) => {
            const currentDate = new Date();
            const minDate = new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate());
            const maxDate = new Date(currentDate.getFullYear() - 17, currentDate.getMonth(), currentDate.getDate());
            return date >= minDate && date <= maxDate;
        },
        { message: "Date must be between 17 and 25 years ago" }
    ),
    email: z.string().email("Invalid email address"),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be between 10 and 15 digits" }
    ),
    gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required" }),
});

// ---------- Sport Field ----------
/*
Field for selecting sports.
*/
export const sportField = z.object({
    sports: z.enum(sports, { message: "Select a sport" }),
   player1:z.object({ sports: z.enum(sports, { message: "Select a sport" }),}),
   player2:z.object({ sports: z.enum(sports, { message: "Select a sport" }),}),
});


function arrayOfGenericFields(field:Record<string, any>,number:number){

}
// ---------- Event Schema ----------
/*
Defines the overall event schema including common pages and sub-events.
*/
// ---------- Event Schema ----------
// Defines the overall event schema including common pages and sub-events.
export const eventSchema: EventSchema = {
    commonPages: [
        {
            pageName: "Sports Selection",
            fields: sportField, // Directly use sportField, no need for .shape
        },
    ],  
    subEvents: [
        {
            eventName: "Basketball",
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields, // Directly use coachFields (fixed capitalization)
                        playerFields: z.array(genericFields)
                            .min(2, "Fill details of minimum two players") // Minimum 2 players
                            .max(7, "A maximum of 7 players are allowed"), // Maximum 7 players
                    }),
                }
            ],
        },
    ],
};

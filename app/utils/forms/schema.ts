// ---------- Interfaces ----------
import { z } from "zod";

interface Page {
    pageName: string;
    fields: z.ZodObject<any>;
    meta: formMeta;
    draft: z.ZodObject<any>;
}

interface SubEvent {
    eventName: string;
    specificPages: Page[];
}

interface EventSchema {
    commonPages: Page[];
    subEvents: Record<string, SubEvent>;
}

interface fieldMeta {
    label: string;
    placeholder?: string;
}

export interface formMeta {
    [key: string]: fieldMeta | formMeta;
}

// ---------- Sports List ----------
export const sports = {
    Badminton_Men: "Badminton (Men)",
    Badminton_Women: "Badminton (Women)",
    Basketball_Men: "Basketball (Men)",
    Basketball_Women: "Basketball (Women)",
    Chess_Mixed: "Chess (Mixed)",
    Cricket_Men: "Cricket (Men)",
    Football_Men: "Football (Men)",
    Futsal_Women: "Futsal (Women)",
    Tennis_Mixed: "Tennis (Mixed)",
    Volleyball_Men: "Volleyball (Men)",
    Volleyball_Women: "Volleyball (Women)",
    Table_Tennis_Men: "Table Tennis (Men)",
    Table_Tennis_Women: "Table Tennis (Women)",
    Squash_Men: "Squash (Men)",
    Squash_Women: "Squash (Women)",
    Swimming_Men: "Swimming (Men)",
    Swimming_Women: "Swimming (Women)",
    Ball_Pool_Men: "8 Ball Pool (Men)",
    Snooker_Men: "Snooker (Men)",
    Shooting: "Shooting"
} as const;

// ---------- Generic Fields ----------
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
export const genericFieldsDraft = z.object({
    name: z.string().min(1, "Name is required").optional(),
    date: z.date().refine(
        (date) => {
            const currentDate = new Date();
            const minDate = new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), currentDate.getDate());
            const maxDate = new Date(currentDate.getFullYear() - 17, currentDate.getMonth(), currentDate.getDate());
            return date >= minDate && date <= maxDate;
        },
        { message: "age must be between 17 and 25 years old" }
    ).optional(),
    email: z.string().min(1, "Email is required").email("Invalid email address").optional(),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ).optional(),
});

export const genericMeta: formMeta = {
    title: { label: "Player Details" },
    subtitle: { label: "Player-" },
    name: { label: "Name", placeholder: "Name" },
    date: { label: "Date Of Birth", placeholder: "Pick a date" },
    email: { label: "Email", placeholder: "Email" },
    phone: { label: "Phone Number", placeholder: "Phone Number" }
};

// ---------- Coach Fields ----------
export const coachFields = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ).optional(),
    gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }).optional(),
});

export const coachFieldsMeta: formMeta = {
    title: { label: "Coach Details" },
    name: { label: "Name", placeholder: "Name" },
    gender: { label: "Gender", placeholder: "Select Gender" },
    email: { label: "Email", placeholder: "Email" },
    phone: { label: "Phone Number", placeholder: "Phone Number" }
};

// ---------- Sport Field ---------
export const getKeyByValue = (obj: Record<string, string>, value: string): string | undefined => {
    return Object.keys(obj).find((key) => obj[key] === value);
}; // Output: "Basketball_Men"

export const sportField = z.object({
    sports: z.enum([
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
    ], { message: "Select a sport" }),
});

export const sportFieldMeta: formMeta = {
    sports: { label: "Select a Sport", placeholder: "Select a sport" }
};

// ---------- Event Schema ----------
export const eventSchema: EventSchema = {
    commonPages: [
        {
            pageName: "Sports Selection",
            fields: sportField,
            meta: sportFieldMeta,
            draft: sportField
        },
    ],
    subEvents: {
        Basketball: {
            eventName: "Basketball",
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(genericFields)
                            .min(2, "Fill details of minimum two players")
                            .max(7, "A maximum of 7 players are allowed"),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(genericFieldsDraft)
                            .min(2, "Fill details of minimum two players")
                            .max(7, "A maximum of 7 players are allowed"),
                    }),
                    meta: {}
                },
            ],
        },
        Badminton_Men: {
            eventName: "Football",
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        "playerFields": z.array(genericFields)
                            .min(1, "Fill details of minimum eleven players")
                            .max(15, "A maximum of 15 players are allowed"),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(genericFieldsDraft)
                            .min(1, "Fill details of minimum two players")
                            .max(15, "A maximum of 7 players are allowed"),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: genericMeta
                    }
                },
            ],
        },
    },
};
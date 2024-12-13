"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUp() {
    const router = useRouter(); 
    const [formData, setFormData] = useState({
        name: "",
        universityName: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Frontend validation for email and password length
    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }

        if (!formData.name || !formData.universityName || !formData.email || !formData.password) {
            setError("All fields are required.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || "Sign-up successful!");
                router.push("/Verification")
                setFormData({
                    name: "",
                    universityName: "",
                    email: "",
                    password: "",
                });
            } else {
                setError(data.error || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to connect to the server. Please try again.");
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Sign up</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="universityName">University Name</Label>
                            <Input
                                id="universityName"
                                type="text"
                                placeholder="Full name of university"
                                value={formData.universityName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}
                </form>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSubmit}>Sign Up</Button>
            </CardFooter>
        </Card>
    );
}
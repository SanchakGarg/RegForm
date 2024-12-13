"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react";
import Link from "next/link";

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

export function Login() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Sign in to Agneepath 6.0</CardTitle>
                {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="email" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="password" />
                        </div>
                    </div>
                    
                </form>
                <p>
          {" "}
          <Link href="/authentication/SignUp" className="text-blue-600 hover:underline">
            forgot password?
          </Link>
        </p>
                
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button>Sign In</Button>
            </CardFooter>
        </Card>
    )
}

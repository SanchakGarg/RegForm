import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import { compareHash } from "@/app/utils/hashing";
import {  encrypt } from "@/app/utils/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "your-256-bit-secret";

export async function POST(req: NextRequest) {
  try {

    const{emaile,passworde} = await req.json();
    const email = emaile.toLowerCase();
    const password = passworde;
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }
    const emailverif = await fetchUserData('email',email, ['emailVerified']);
    if(emailverif.success && emailverif.data.emailVerified == false){
      return NextResponse.json({ success: true, message: "Missing credentials", emailverif:emailverif.data.emailVerified }, { status: 200 });
    }

    // Fetch user data
    const result = await fetchUserData("email", email, ["email", "password", "name"]);
    if (!result.success) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = result.data;

    // Compare hashed password
    const isValidPassword = await compareHash(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    // Generate JWT
    const payload = { email: user.email};
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" });

    // Encrypt token (optional)
    const encryptedToken = encrypt({jwt:token});

    return NextResponse.json({ success: true, token: encryptedToken });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

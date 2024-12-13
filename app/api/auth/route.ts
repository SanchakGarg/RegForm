import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from 'bcrypt';

// Function to hash password
async function hashPassword(password: string) {
  const saltRounds = 10; // Secure number of salt rounds for bcrypt
  return await bcrypt.hash(password, saltRounds);
}

// POST handler for user registration
export async function POST(req: Request) {
  const { name, universityName, email, password } = await req.json();

  // Validate required fields
  if (!name || !universityName || !email || !password) {
    return new Response(
      JSON.stringify({ error: "All fields are required." }),
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    // Check if email is already registered
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email is already registered." }),
        { status: 409 }
      );
    }

    // Hash the password securely
    const hashedPassword = await hashPassword(password);

    // Insert user with hashed password into database
    await collection.insertOne({ 
      name, 
      universityName, 
      email, 
      password: hashedPassword 
    });

    return new Response(
      JSON.stringify({ message: "User created successfully." }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}

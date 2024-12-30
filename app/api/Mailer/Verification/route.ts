import { encrypt } from "@/app/utils/encryption";
import { connectToDatabase } from "@/lib/mongodb";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function getVerificationId(email: string): Promise<string | null> {
  const { db } = await connectToDatabase();
  const collection = db.collection("users");
  const user = await collection.findOne({ email });
  return user?.VerificationId || null;
}

async function sendEmail(to: string, id: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ROOT_URL } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !ROOT_URL) {
    throw new Error("Email configuration missing in environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const vlink = `${ROOT_URL}verify?token=${id}`;
  const emailContent = `<p>Please verify your email by clicking this link: 
    <b>${ROOT_URL}Verification/verify?e=${encrypt({ email: to })}&i=${encrypt({vid:id})}</b></p>`;

  await transporter.sendMail({
    from: `"Verification" <${SMTP_USER}>`,
    to,
    subject: "Verify your account",
    text: `Please verify your email using this Link: ${vlink}`,
    html: emailContent
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const verificationId = await getVerificationId(email);

    if (!verificationId) {
      return new Response(
        JSON.stringify({ error: "User or VerificationId not found" }),
        { status: 404 }
      );
    }

    await sendEmail(email, verificationId);
    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500 }
    );
  }
}
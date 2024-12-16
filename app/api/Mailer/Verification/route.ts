import { encrypt } from "@/app/utils/encryption";
import { connectToDatabase } from "@/lib/mongodb";
import nodemailer from "nodemailer";

async function getVerificationId(email: string): Promise<string | null> {
  const { db } = await connectToDatabase();
  const collection = db.collection("users");

  // Query MongoDB for the email's VerificationId
  const user = await collection.findOne({ email });

  if (user && user.VerificationId) {
    return user.VerificationId;
  }

  return null; // No record or missing VerificationId
}

// Email configuration using Nodemailer
async function sendEmail(to: string, id: string) {
  const { EMAIL_ADMIN, PASS_ADMIN } = process.env;

  if (!EMAIL_ADMIN || !PASS_ADMIN) {
    throw new Error("Email configuration is missing in environment variables.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail", // Change this based on your provider
    auth: {
      user: EMAIL_ADMIN,
      pass: PASS_ADMIN,
    },
  });
const {ROOT_URL} = process.env;
const vlink = ROOT_URL+`verify?token=${id}`;
const emailContent = `<p>Please verify your email by clicking this link: 
    <b>${process.env.ROOT_URL}verification/${encrypt(new Date())}?e=${encrypt({ email: to })}&i=${encrypt({vid:id})}</b></p>`;
  await transporter.sendMail({
    from: `"Verification" <${EMAIL_ADMIN}>`, // Sender's name and email
    to, // Recipient's email
    subject: "Verify your account", // Email subject
    text: `Please verify your email using this Link: ${vlink}`, // Plain text email content
    html: emailContent, // HTML email content
  });
}

// Handle POST requests for sending emails
export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const verificationId = await getVerificationId(email);

    if (!verificationId) {
      console.error("No VerificationId found for the given email.");
      return new Response(
        JSON.stringify({ error: "User or VerificationId        { status: 404 } not found for provided email." }),

      );
    }

    // Call the sendEmail function to send the email
    await sendEmail(email, verificationId);

    return new Response(
      JSON.stringify({ message: "Email sent successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email." }),
      { status: 500 }
    );
  }
}

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { sports } from "../forms/schema";
/* eslint-disable @typescript-eslint/no-explicit-any */

dotenv.config();

interface PlayerField {
    name: string;
    email: string;
    phone: string;
    gender: string;
    [key: string]: any; // For other dynamic fields
}

interface FormData {
    _id: string;
    ownerId: string;
    title: string;
    status: string;
    universityName: string,
    name: string,
    fields: {
        coachFields?: Record<string, any>;
        playerFields?: PlayerField[];
    };
}

function formatFieldName(key: string): string {
    // Handle category special cases
    if (key.startsWith('category')) {
        return 'Category ' + key.slice(-1);
    }

    // Split by camelCase, underscore, or space and capitalize each word
    return key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .split(/[_\s]+/) // Split by underscore or space
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

async function sendConfirmationEmail(formData: FormData) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
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

    // Generate table rows for coach fields if they exist
    let coachTableRows = '';
    if (formData.fields.coachFields && Object.keys(formData.fields.coachFields).length > 0) {
        coachTableRows = `
      <tr>
        <td colspan="2" style="padding: 10px; background-color: #f0f0f0;"><strong>Coach Information</strong></td>
      </tr>
      ${Object.entries(formData.fields.coachFields)
                .map(([key, value]) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${formatFieldName(key)}</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${value instanceof Date ? value.toLocaleDateString() : value
                    }</td>
          </tr>
        `).join('')}
    `;
    }

    // Generate table rows for player fields
    let playerTableRows = '';
    if (formData.fields.playerFields && formData.fields.playerFields.length > 0) {
        formData.fields.playerFields.forEach((player, index) => {
            playerTableRows += `
        <tr>
          <td colspan="2" style="padding: 10px; background-color: #f0f0f0;">
            <strong>Player ${index + 1} Information</strong>
          </td>
        </tr>
        ${Object.entries(player)
                    .map(([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>${formatFieldName(key)}</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${value instanceof Date ? value.toLocaleDateString() : value
                        }</td>
            </tr>
          `).join('')}
      `;
        });
    }

    const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="text-align: center; color: #ed810c;">Registration Confirmation - ${sports[formData.title]}</h2>
      
      <p>Dear ${formData.name},</p>
      
      <p>We are pleased to inform you that you have successfully registered for Agneepath 6.0, hosted at Ashoka University. We are excited to have you join us for the upcoming competition in ${sports[formData.title]}, representing your institution, ${formData.universityName}.</p>
      <p style="font-weight: bold; color: #666;">Your application is currently under review by our team. You will receive a separate email once your registration is confirmed.</p>

      <p>Here is a copy of datails that you submitted:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${coachTableRows}
        ${playerTableRows}
      </table>
      
      
      <p style="margin-top: 20px;">If you have any questions or need to update your information, please feel free to contact us at <a href="mailto:agneepath@ashoka.edu.in" style="color: #ed810c; text-decoration: none;">agneepath@ashoka.edu.in</a> or you can also make a support request by going to the <a href="register.agneepath.co.in" style="color: #ed810c; text-decoration: none;">dashboard</a></p>
      
      <p style="margin-top: 30px;">Best regards,<br>Team Agneepath<br>Ashoka University</p>
      
      <img src="cid:unique-image-cid" alt="Agneepath Logo" style="max-width: 15%; height: auto;" />
    </div>
  `;

    const attachments = [
        {
            filename: "logo.png",
            path: `${process.env.LOGO}`,
            cid: "unique-image-cid",
            encoding: "base64"
        }
    ];

    // Get all unique participant emails
    const participantEmails = new Set<string>();
    formData.fields.playerFields?.forEach(player => {
        if (player.email) participantEmails.add(player.email);
    });
    if (formData.fields.coachFields?.email) {
        participantEmails.add(formData.fields.coachFields.email);
    }

    // Send email to all participants
    for (const email of participantEmails) {
        await transporter.sendMail({
            from: `Registation <SMTP_USER>`,
            to: email,
            subject: `Thank you for registering for Agneepath!!}`,
            html: emailContent,
            attachments,
            headers: {
                "X-Gm-NoSave": "1"
            }
        });
    }
}

export default sendConfirmationEmail;
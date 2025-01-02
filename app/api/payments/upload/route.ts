import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage } from 'http';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
/* eslint-disable @typescript-eslint/no-explicit-any */

// Define the response interface
interface UpdateResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

// Define where files should be stored
const uploadFolder = path.join(process.cwd(), 'uploads');

// Disable Next.js's default body parsing to handle `multipart/form-data`
export const config = {
  api: {
    bodyParser: false,
  },
};

// API route handler
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Ensure the uploads directory exists
    await fs.promises.mkdir(uploadFolder, { recursive: true });

    // Create a new formidable instance
    const form = formidable({
      uploadDir: uploadFolder, // Directory to store uploaded files
      keepExtensions: true,   // Preserve file extensions
    });

    const response = await new Promise<Response>((resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
        if (err) {
          reject(
            NextResponse.json(
              { success: false, message: 'Error in parsing form data' },
              { status: 500 }
            )
          );
          return;
        }

        // Extract form fields
        const { amount, remarks } = fields;
        const file = (files.file as formidable.File[] | undefined)?.[0];

        // Check if a file is uploaded
        if (!file) {
          resolve(
            NextResponse.json(
              { success: false, message: 'File is required' },
              { status: 400 }
            )
          );
          return;
        }

        // Move the uploaded file to the final destination
        const newFilePath = path.join(uploadFolder, file.originalFilename || file.newFilename);
        fs.renameSync(file.filepath, newFilePath);

        // Prepare the response
        const updateResponse: UpdateResponse = {
          success: true,
          message: 'File and payment data uploaded successfully',
          data: {
            amount,
            remarks,
            filePath: newFilePath,
          },
        };

        // Resolve with the response
        resolve(NextResponse.json(updateResponse, { status: 200 }));
      });
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

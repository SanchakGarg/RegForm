// pages/api/upload-payment.ts
import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

interface UpdateResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

// Define where files should be stored
const uploadFolder = path.join(process.cwd(), 'uploads');

// Disable the default body parser for API routes to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file upload
  },
};

export async function POST(req: NextRequest) {
  try {
    // Use formidable to parse incoming data
    const form = new formidable.IncomingForm();
    form.uploadDir = uploadFolder;
    form.keepExtensions = true; // Preserve file extension
    form.parse(req, (err, fields, files) => {
      if (err) {
        return NextResponse.json(
          { success: false, message: 'Error in parsing form data' },
          { status: 500 }
        );
      }

      // Extract form fields
      const { amount, remarks } = fields;
      const file = files.file[0]; // Assuming the file is named 'file' in the form

      // Check if file is uploaded
      if (!file) {
        return NextResponse.json(
          { success: false, message: 'File is required' },
          { status: 400 }
        );
      }

      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }

      // Move the uploaded file to the target folder
      const newFilePath = path.join(uploadFolder, file.originalFilename || file.newFilename);
      fs.renameSync(file.filepath, newFilePath);

      // Here you can call another function to save the data to your database
      // For now, let's simulate the response

      const updateResponse: UpdateResponse = {
        success: true,
        message: 'File and payment data uploaded successfully',
        data: {
          amount,
          remarks,
          filePath: newFilePath,
        },
      };

      return NextResponse.json(updateResponse, { status: 200 });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

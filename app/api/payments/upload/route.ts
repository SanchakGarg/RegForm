import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const POST = async (req: any, res: any) => {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");
  // console.log(filename);

  // Get the directory path from the environment variable
  const directoryPath = process.env.UPLOAD_PATH || path.join(process.cwd(), "/assets");

  try {
    // Check if the directory exists, if not, create it
    await mkdir(directoryPath, { recursive: true });

    // Write the file to the directory
    await writeFile(path.join(directoryPath, filename), buffer);
    
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    // console.log("Error occurred", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Get the absolute path to the public/people directory
    const peopleDir = path.join(process.cwd(), "public", "people");

    // Read all files in the directory
    const files = fs.readdirSync(peopleDir);

    // Filter out non-image files (keep only .png, .jpg, .jpeg, .gif, .webp)
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext);
    });

    // Return the list of image files
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error reading people directory:", error);
    return NextResponse.json(
      { error: "Failed to read people directory" },
      { status: 500 }
    );
  }
}

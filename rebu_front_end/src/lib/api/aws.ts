import { API_BASE_URL } from "@/lib/constants";
import { Upload } from "@/types/app";
import humps from "humps";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";

async function getPresignedUrl(
  token: string,
  file: File,
  type: string
): Promise<{ url: string; key: string }> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: type,
      filename: file.name,
      content_type: file.type,
    }),
  });

  if (!response.ok) throw new Error("Failed to get pre-signed URL");

  return response.json();
}

export async function createUpload(token: string, newUpload: Upload) {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(humps.decamelizeKeys(newUpload)),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
}

async function uploadFileToS3(token: string, files: File[], type: string) {
  try {
    console.log(`🚀 Preparing to upload ${files.length} files...`);

    const compressedFiles = await Promise.all(
      files.map(async (file) =>
        file.type.startsWith("image/") ? await compressImage(file) : file
      )
    );

    // If multiple non-image files, zip them
    const file = await compressFiles(compressedFiles);

    const { url, key } = await getPresignedUrl(token, file, type);

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file, // Upload file directly to S3
    });

    if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

    await createUpload(token, { type, url, key });

    console.log(`✅ Uploaded ${file.name} successfully: ${key}`);
    return url; // Store key for reference
  } catch (error) {
    console.error(`❌ Error uploading files`, error);
    return null;
  }
}



// file compressions for uploads

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file; // Only compress images

  const options = {
    maxSizeMB: 0.5, // Aggressively compress to ~500KB max
    maxWidthOrHeight: 1024, // Resize if larger than 1024px
    useWebWorker: true,
  };

  try {
    const compressedFile: File = await imageCompression(file, options);
    console.log(
      `🔻 Compressed ${file.name} from ${file.size} to ${compressedFile.size} bytes`
    );
    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    return file; // Return original file if compression fails
  }
}

async function compressFiles(files: File[]): Promise<File> {
  if (files.length === 1 && files[0].size < 2 * 1024 * 1024) {
    return files[0]; // Skip compression if a single file is small (<2MB)
  }

  const zip = new JSZip();
  files.forEach((file) => zip.file(file.name, file));

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });
  return new File([zipBlob], "compressed_upload.zip", {
    type: "application/zip",
  });
}

import { API_BASE_URL } from "@/lib/constants";
import { Upload } from "@/types/types";
import humps from "humps";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import axios from "axios";

export async function processAndUploadFile(
  token: string,
  type: string,
  files: File[]
) {
  try {
    const file = await compressAndZip(files);

    const { url, key } = await getPresignedUrl(token, type, file);

    const ret = await uploadFileToS3(token, url, key, file);

    return { url, type: ret?.type };
  } catch (error) {
    console.error("Error processing and uploading file:", error);
    return null; // Or throw the error, depending on how you want to handle it
  }
}

export async function uploadFile(token: string, type: string, file: File) {
  try {
    const { url, key } = await getPresignedUrl(token, type, file);

    return await uploadFileToS3(token, url, key, file);
  } catch (error) {
    console.error("Error processing and uploading file:", error);
    return null; // Or throw the error, depending on how you want to handle it
  }
}

export async function getPresignedUrl(
  token: string,
  type: string,
  file: File
): Promise<{ url: string; key: string }> {
  const response = await fetch(`${API_BASE_URL}/upload/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: type,
      content_type: file.type,
    }),
  });

  if (!response.ok) throw new Error("Failed to get pre-signed URL");

  return response.json();
}

export async function createUpload(token: string, newUpload: Upload) {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST", // Corrected to POST
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ upload: humps.decamelizeKeys(newUpload) }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create upload: ${response.statusText}`);
  }

  return response.json(); // Return the parsed JSON response
}

export async function uploadFileToS3(
  token: string,
  url: string,
  key: string,
  file: File
) {
  try {
    console.log(`🚀 Preparing to upload file...`);

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type }, //Use the actual file type.
      body: file, // Upload file directly to S3
    });

    if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

    return { url, type: file.type };
  } catch (error) {
    console.error(`❌ Error uploading files`, error);
    return null;
  }
}

export async function compress(files: File[]) {
  const compressedFiles = await Promise.all(
    files.map(async (file) =>
      file.type.startsWith("image/") ? await compressImage(file) : file
    )
  );

  return compressedFiles;
}

export async function compressAndZip(files: File[]) {
  const compressedFiles = await Promise.all(
    files.map(async (file) =>
      file.type.startsWith("image/") ? await compressImage(file) : file
    )
  );

  // If multiple non-image files, zip them
  const file = await compressFiles(compressedFiles);

  return file;
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

/**
 * Extracts images from a ZIP file and returns their object URLs.
 */
// export async function extractImagesFromZip(zipUrl: string): Promise<string[]> {
//   try {
//     const response = await fetch(zipUrl);
//     if (!response.ok) throw new Error("Failed to fetch ZIP");

//     const blob = await response.blob();
//     const zip = await JSZip.loadAsync(blob);

//     const imageFiles: string[] = [];

//     for (const fileName of Object.keys(zip.files)) {
//       if (isImage(fileName)) {
//         const fileData = await zip.files[fileName].async("blob");
//         const imageUrl = URL.createObjectURL(fileData);
//         imageFiles.push(imageUrl);
//       }
//     }

//     return imageFiles;
//   } catch (error) {
//     console.error("Error extracting ZIP:", error);
//     return [];
//   }
// }

// export async function processFile(url: string): Promise<string[]> {
//   try {
//     return await extractImagesFromZip(url);
//   } catch (error) {
//     console.error("Error processing ZIP file:", url, error);
//     return [];
//   }
// }

// async function extractImagesFromZip(url: string): Promise<string[]> {
//   try {

//     const response = await axios.head(url);
//     const contentType = response.headers["content-type"];
//     console.log("Axios head", contentType)

//     // const response = await axios.get(url, { responseType: "blob" });
//     // const zip = await JSZip.loadAsync(response.data);
//     // const imagePromises = Object.values(zip.files)
//     //   .filter((file) => !file.dir && /\.(png|jpe?g|gif|webp)$/i.test(file.name))
//     //   .map(async (file) => {
//     //     const content = await file.async("blob");
//     //     return URL.createObjectURL(content);
//     //   });
//     return Promise.all(imagePromises);
//   } catch (error) {
//     console.error("Error extracting images from ZIP:", url, error);
//     return [];
//   }
// }

export async function processFile(url: string): Promise<string[]> {
  try {
    console.log("url for axios", url);
    const response = await axios.head(url);
    const contentType = response.headers["content-type"];
    console.log("Axios head", contentType);

    if (contentType && contentType.startsWith("image/")) {
      return [url];
    } else if (contentType && contentType === "application/zip") {
      return await extractImagesFromZip(url);
    } else {
      console.error("Unsupported file type:", url, contentType);
      return [];
    }
  } catch (error) {
    console.error("Error processing file:", url, error);
    return [];
  }
}

async function extractImagesFromZip(url: string): Promise<string[]> {
  try {
    const response = await axios.get(url, { responseType: "blob" });
    const zip = await JSZip.loadAsync(response.data);
    const imagePromises = Object.values(zip.files)
      .filter((file) => !file.dir && /\.(png|jpe?g|gif|webp)$/i.test(file.name))
      .map(async (file) => {
        const content = await file.async("blob");
        return URL.createObjectURL(content);
      });
    return Promise.all(imagePromises);
  } catch (error) {
    console.error("Error extracting images from ZIP:", url, error);
    return [];
  }
}

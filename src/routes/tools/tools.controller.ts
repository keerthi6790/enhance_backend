import { checkUserCredits, deductCredits } from "../../utils/credits";
import getReplicate from "../../utils/Replicate";

export async function processImagesController(
  images: any[],
  option: object,
  userId: string,
): Promise<any | "Please recharge"> {
  const credits = await checkUserCredits(userId);
  if (credits < images.length) {
    return "Please recharge";
  }

  const image = Buffer.from(images[0].buffer).toString("base64");

  await deductCredits(userId, images.length);

  try {
    const input = {
      image: `data:application/octet-stream;base64,${image}`,
      enhance_model: "Low Resolution V2",
      upscale_factor: "4x",
      face_enhancement: true,
      subject_detection: "Foreground",
      face_enhancement_creativity: 0.5,
    };

    const replicate = getReplicate();
    // const output = await replicate.run("topazlabs/image-upscale", { input });

    // console.log("Processed Images:", output);

    return {
      completed_at: "2025-04-25T15:25:48.719207Z",
      created_at: "2025-04-25T15:25:35.884000Z",
      data_removed: false,
      error: null,
      id: "2b7abzyx1hrmc0cpdp6rz8mvjg",
      input: {
        image:
          "https://replicate.delivery/pbxt/MtnpGxNIVJlHAMZmQNl5bLARbYpiLahniAYis3RsRN2KwhfJ/out-1.webp",
        enhance_model: "Low Resolution V2",
        output_format: "jpg",
        upscale_factor: "4x",
        face_enhancement: true,
        subject_detection: "Foreground",
        face_enhancement_strength: 0.8,
        face_enhancement_creativity: 0.5,
      },
      logs: "Converted image from webp to jpeg\nGenerating...\nProcessed in 12.5sec\nCredits used: 1\nDownloading 2229037 bytes\nDownloaded 2.13MB in 0.17sec",
      metrics: {
        image_count: 1,
        predict_time: 12.825293246,
        total_time: 12.835207,
      },
      output:
        "https://replicate.delivery/xezq/vXJDANfas80BdCZbLh06VSfeTtWCxdCB3TjgsVyxl0h5brMpA/tmp1orc4ro2.jpg",
      started_at: "2025-04-25T15:25:35.893913Z",
      status: "succeeded",
      urls: {
        stream:
          "https://stream.replicate.com/v1/files/bcwr-ine5brkltod6pxikhpnsg7st6rc63o3b3qeocz3mxqdxklwztp2a",
        get: "https://api.replicate.com/v1/predictions/2b7abzyx1hrmc0cpdp6rz8mvjg",
        cancel:
          "https://api.replicate.com/v1/predictions/2b7abzyx1hrmc0cpdp6rz8mvjg/cancel",
      },
      version: "hidden",
    };
  } catch (err) {
    console.error("Error processing images:", err);
    throw err;
  }
}

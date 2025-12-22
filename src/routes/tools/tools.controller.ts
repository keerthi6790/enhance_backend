import { checkUserCredits, deductCredits } from "../../utils/credits";
import replicate from "../../utils/Replicate";

export async function processImagesController(
  images: any[],
  option: object,
  userId: string
): Promise<any[] | "Please recharge"> {
  const credits = await checkUserCredits(userId);
  if (credits < images.length) {
    return "Please recharge";
  }

  await deductCredits(userId, images.length);

  try {
    const input = {
      image:
        "https://replicate.delivery/pbxt/MtnpGxNIVJlHAMZmQNl5bLARbYpiLahniAYis3RsRN2KwhfJ/out-1.webp",
      enhance_model: "Low Resolution V2",
      upscale_factor: "4x",
      face_enhancement: true,
      subject_detection: "Foreground",
      face_enhancement_creativity: 0.5,
    };

    const output = await replicate.run("topazlabs/image-upscale", { input });
  } catch (err) {
    console.error("Error processing images:", err);
    throw err;
  }
  // Process each image in parallel and await all results

  console.log("Processed Images:", output);

  return output;
}

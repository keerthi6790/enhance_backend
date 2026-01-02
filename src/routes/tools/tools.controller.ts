import { checkUserCredits, deductCredits } from "../../utils/credits";
import getReplicate from "../../utils/Replicate";

export async function processImagesController(
  images: any[],
  option: object,
  userId: string
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
    const output = await replicate.run("topazlabs/image-upscale", { input });

    console.log("Processed Images:", output);

    return output;
  } catch (err) {
    console.error("Error processing images:", err);
    throw err;
  }
}

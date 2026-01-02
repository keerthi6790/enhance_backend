import Replicate from "replicate";

let replicateInstance: Replicate | null = null;

function getReplicate(): Replicate {
  if (!replicateInstance) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }
    replicateInstance = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return replicateInstance;
}

export default getReplicate;

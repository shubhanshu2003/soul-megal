import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // Ensure this is correctly set in .env
});

export async function generateEmbedding(text) {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-english-v3.0",
      inputType: "classification",
    });

    return response.embeddings[0]; // Return the first embedding
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

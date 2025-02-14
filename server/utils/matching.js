import FormData from "../model/form.js";

// Function to calculate cosine similarity between two vectors
const cosineSimilarity = (vec1, vec2) => {
  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  return dotProduct / (magnitude1 * magnitude2);
};

// Find the best match based on vector similarity
export const findBestMatch = async (userId, userVector) => {
  const allUsers = await FormData.findAll({
    where: { userId: { [Op.ne]: userId } }, // Exclude the current user
  });

  let bestMatch = null;
  let highestSimilarity = -1;

  for (const user of allUsers) {
    if (user.vector) {
      const similarity = cosineSimilarity(userVector, user.vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = user;
      }
    }
  }

  return bestMatch;
};

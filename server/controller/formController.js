// import FormData from "../model/form.js";

// // Form data controller
// export const saveFormData = async (req, res) => {
//   const { hobbies, gender, education, pets, workout, drinking, userId } = req.body;

//   try {
//     const formData = await FormData.create({ hobbies, gender, education, pets, workout, drinking, userId });
//     res.status(201).json({ success: true, user: formData });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


import FormData from "../model/form.js";
import { generateEmbedding } from "../utils/embedding.js";

export const saveFormData = async (req, res) => {
  try {
    const { userId, hobbies, gender, education, pets, workout, drinking } = req.body;
    
    // Create a single text input for embedding
    const textData = `${hobbies}, ${gender}, ${education}, ${pets}, ${workout}, ${drinking}`;
    
    // Generate embedding vector
    const vector = await generateEmbedding(textData);
    if (!vector) {
      return res.status(500).json({ error: "Failed to generate embedding" });
    }

    // Save form data with embedding
    const formData = await FormData.create({
      userId,
      hobbies,
      gender,
      education,
      pets,
      workout,
      drinking,
      vector, // Store vector in DB
    });

    res.status(201).json({ message: "Form data saved successfully", formData });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ error: "Server error" });
  }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeDisasterImage = async (file) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const imagePart = await fileToGenerativePart(file);
    
    const prompt = `
      You are an expert triage AI for a home repair app. Analyze this image.
      1. Identify the specific trade required (e.g., Plumber, Carpenter, Electrician, Mason, General Handyman).
      2. Identify the urgency level (Low, Medium, High, Emergency).
      3. Provide a short 1-sentence description of the issue.
      
      Respond strictly in JSON format like this:
      {"trade": "Carpenter", "urgency": "High", "description": "Broken wooden table leg."}
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
    
  } catch (error) {
    console.error(error);
    return { trade: "General Handyman", urgency: "Medium", description: "Could not auto-analyze image." };
  }
};


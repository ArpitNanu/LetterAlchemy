export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  FRONTEND_URL: string;
  
  // New R2 Variables
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ENDPOINT: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  AI: any; // Add this line to define the AI binding
}

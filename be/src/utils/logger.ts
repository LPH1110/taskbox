import fs from "fs";
import path from "path";

// Ensure logs directory exists (Works both locally and in Docker)
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLogPath = path.join(logDir, "error.log");

const logToFile = (message: string) => {
  try {
    fs.appendFileSync(errorLogPath, message + "\n");
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};

export const Logger = {
  info: (context: string, message: string, meta?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] [${context}] ${message}`, meta ? JSON.stringify(meta) : "");
  },
  warn: (context: string, message: string, meta?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] [${context}] ${message}`, meta ? JSON.stringify(meta) : "");
  },
  error: (context: string, message: string, error?: any) => {
    const formattedMessage = `[ERROR] [${new Date().toISOString()}] [${context}] ${message}`;
    console.error(formattedMessage);
    logToFile(formattedMessage);
    
    if (error) {
      console.error(error);
      const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
      logToFile(`[ERROR DETAILS] ${errorDetails}`);
    }
  },
};

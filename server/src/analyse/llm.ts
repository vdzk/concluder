import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

export const llm = new OpenAI()
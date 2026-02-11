import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

const llm = new OpenAI()

const PremiseAnalysis = z.object({
  text: z.string(),
  justification: z.string(),
  likelihood: z.number().min(0).max(1)
})

const ArgumentAnalysis = z.object({
  pro: z.boolean(),
  premises: z.array(PremiseAnalysis)
})

export const analyseArgument = async (
  claimText: string,
  argumentText: string
) => {
  const response = await llm.responses.parse({
    model: "gpt-4o-2024-08-06",
    input: [
      {
        role: 'system',
        content: "You will be given a claim and an argument. Determine if it's a pro argument. Break down the argument into premises. Include hidden premises too. There should usually be one premise in the form of a general rule that connects of the premises to the conclusion. Do not include explanatory information that don't influence the strength of the argument as separate premises. For each premise determine how likely it is to be true. Provide justification for your conclusion about the likelihood."
      },
      {
        role: 'user',
        content: `Claim: ${claimText}`
      },
      {
        role: 'user',
        content: `Argument: ${argumentText}`
      },
    ],
    text: {
      format: zodTextFormat(ArgumentAnalysis, 'argument_analysis'),
    },
  })
  return response.output_parsed
}
import { llm } from "./llm.ts"
import { extractOutput } from "./utils.ts"

export const analyseClaim = async (
  statementText: string,
) => {
  const response = await llm.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: 'system',
        content: 'Is the text provided by the user illicit, offensive, vulgar or spam? If not, does it contain a prescriptive (as opposed to descriptive) statement? At the end of your response please include your single word answer as "violation", "prescriptive" or "descriptive" inside <output></output> tags so that it can be easily parsed.'
      },
      {
        role: 'user',
        content: statementText
      }
    ]
  })
  const output = extractOutput(response.output_text)
  return output
}


export const analyseClaimStakeholders = async (
  statementText: string,
) => {
    const response = await llm.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: 'system',
        content: 'You will be given a user-generated prescriptive claim. Your goal is to determine which group of people are affected by the subject of the claim and at the same time are in the best position to do something about it. Do not limit the group to just the leaders but include the populations that they represent. For example if the claim is specific to a certain country then the correct group to choose is the citizens of that country. At the end of your response please include your answer inside <output></output> tags so that it can be easily parsed.'
      },
      {
        role: 'user',
        content: statementText
      }
    ]
  })
  const output = extractOutput(response.output_text)
  return output
}
import { llm } from "./llm.ts"
import { extractOutput } from "./utils.ts"

export const parseConsequence = async (
  stakeholders: string,
  claimText: string,
  argumentText: string,
  pro: boolean
) => {
  const response = await llm.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: 'system',
        content: `
INPUTS
- argument-text: argument to be parsed
- claim-text: prescriptive claim that the argument is ${pro ? 'supporting' : 'opposing'}
- stakeholders: the only group of people that should be considered when determining the consequence that the argument points to
GOAL
Parse the consequence to the stakeholders that the argument points to when making the case ${pro ? 'for' : 'against'} the claim. Be concrete. The most important thing is the consequence and it should be at the start of your formulation. However the cause of this consequence can be included at the end of your formulation if it will help convey the size of the effect if it's not specified already. Don't mention who the stakeholders are in your final formulation.
OUTPUT
At the end of your response please include your formulation of the consequence as a noun phrase (as opposed to a full sentence) inside <output></output> tags so that it can be easily parsed.
`
      },
      {
        role: 'user',
        content: `
          <argument-text>${argumentText}</argument-text>
          <claim-text>${claimText}</claim-text>
          <stakeholders>${stakeholders}</decision-makers>
        `
      }
    ]
      })
  return extractOutput(response.output_text)
}


export const analyseConsequence = async (
  stakeholders: string,
  outcome: string,
  benefit: boolean
) => {
  const response = await llm.responses.parse({
    model: "gpt-5",
    input: [
      {
        role: 'system',
        content: `
INPUTS
- outcome: a change to be evaluated
- stakeholders: the group of people from whose perspective the outcome should be evaluated
GOAL
Estimate how much USD would an average member of the specified stakeholder group would be willing to pay for the outcome to occur, or if it's a negative outcome, to prevent it. This figure should not be per year but rather a one time payment for the permanent change.
OUTPUT
At the end of your response please include your estimate as a single number inside <output></output> tags so that it can be easily parsed.
`
      },
      {
        role: 'user',
        content: `
          <stakeholders>${stakeholders}</decision-makers>
          <outcome>${outcome}</outcome>
        `
      }
    ]
  })
  const derivation = response.output_text
  const wtp = parseFloat(extractOutput(response.output_text) ?? '0')
  return {derivation, wtp}
}
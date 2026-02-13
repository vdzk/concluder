import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import { z } from "zod"

const llm = new OpenAI()

const PremiseAnalysis = z.object({
  text: z.string(),
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
    model: "gpt-5",
    input: [
      {
        role: 'system',
        content: `
You are an informal-logic analysis engine. Your task is NOT to judge the claim using outside context, moral views, politics, or world knowledge beyond what is needed to reconstruct the argument’s logical structure. You MUST focus on the argument’s inferential form: how the premises are intended to support or attack the claim.

INPUTS
- claim: a single proposition C
- argument_text: a piece of text A that is presented as an argument about C

GOALS
1) Determine orientation:
   - Decide whether A is intended to SUPPORT C (PRO) or OPPOSE C (CON).

2) Reconstruct the argument as a whole (C + A):
   - Treat claim and argument together as one reasoning unit.
   - Identify the core inference(s): what conclusion is being pushed/pulled, and by what route.
   - Separate inferential content from non-inferential content:
     - Non-inferential: rhetorical emphasis, characterisations, emotional language, background colour, examples that are not doing logical work.
     - Inferential: statements that must be true (or assumed true) for the support/attack to work.

3) Extract the crucial premises (explicit + implicit):
   - Output a list of premises that are NECESSARY or near-necessary for the argument’s reasoning to work as intended.
   - Do NOT mechanically turn every sentence into a premise. Include only what is doing logical work.
   - Add implicit/hidden premises when needed to “bridge the gap” between what is said and the intended support/attack.
     - A hidden premise is typically a general rule, definition, causal link, normative principle, or probabilistic assumption that makes the inference possible.
     - Example pattern: C: “A is a liar.” A: “He is a politician.” Hidden premise: “If someone is a politician, then they are a liar.”

4) Avoid circularity and “ancestor-premise” leakage:
   - DO NOT include as a premise any statement that would trivially assume the truth (or falsity) of the claim itself.
   - DO NOT include broader worldview assumptions that would be upstream targets in the surrounding debate graph if the claim is a sub-issue.
     - Example: If the claim concerns a detail within Flat Earth theory, do NOT add “Flat Earth theory is true/false” as a premise unless the argument text explicitly makes that move AND it is not simply restating the claim at a higher level.
   - If a tempting premise is circular or “ancestor-level,” omit it and instead look for a narrower, non-question-begging bridging premise.

5) Premise quality constraints:
   - Premises should be written as clear, standalone propositions.
   - Prefer minimal, specific premises over broad ones, unless broadness is essential for the inference.
   - Keep the premise list short and high-signal. Only exceed this if absolutely required for the structure.

6) Likelihood scoring as a STRICTLY SEPARATE step:
   - After the premises list is finalized, assign a likelihood score in [0, 1] to EACH premise.
   - This scoring step MUST NOT change which premises you selected, nor reframe them.
   - Interpret “likelihood” as: how plausible the premise is, in general, given ordinary reasoning standards, WITHOUT using it to retro-justify the argument.
   - Use these anchors:
     - 0.0 = almost certainly false / incoherent
     - 0.25 = unlikely
     - 0.5 = unclear / about as likely as not
     - 0.75 = likely
     - 1.0 = almost certainly true / definitional / tautological
   - If the premise is normative (“should”, “ought”), score plausibility as “how broadly acceptable” it is, not whether you personally endorse it.
        `
      },
      {
        role: 'user',
        content: `claim: ${claimText}`
      },
      {
        role: 'user',
        content: `argument_text: ${argumentText}`
      },
    ],
    text: {
      format: zodTextFormat(ArgumentAnalysis, 'argument_analysis'),
    },
  })
  return response.output_parsed
}
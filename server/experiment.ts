import { parseConsequence } from "./src/analyse/consequence.ts"

const illegalImmigration = ['US citizens', 'lower level of illegal immigration', true] as const
const netZero = ['UK citizens', 'future global instability due to failing crops', false] as const

// const response = await analyseConsequence(...netZero)

const television = [
  'UK citizens',
  'Television is bad for people',
  "Watching TV from the safety of one's home keeps people out of trouble and protects them from a variety of public dangers.",
  false
] as const

const television2 = [
  'UK citizens',
  'Television is bad for people',
  "Social isolation can cause loneliness, cognitive decline, and depression.",
  true
] as const


const impeached = [
  'USA citizens',
  'Donald Trump should be impeached and removed from office.',
  "Allowing Trump's alleged misconduct to continue without consequences sets a dangerously poor precedent for future leaders of the country.",
  true
] as const


const impeached2 = [
  'USA citizens',
  'Donald Trump should be impeached and removed from office.',
  "Allegations are not a reason to engage in a very serious Constitutional solution of impeachment. The real danger is that future leaders will be victimized by unproven allegations, rather than fact-based investigative conclusions.",
  false
] as const

const response = await parseConsequence(...impeached2)
console.log(response)
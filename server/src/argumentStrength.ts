export interface Premise {
  invert: boolean,
  likelihood: number
}

export const calcArgumentStrength = (premises: Premise[]) => {
  if (premises.length === 0) return 0
  let strength = 1
  for (const premise of premises) {
    const { invert, likelihood } = premise
    strength *= invert ? (1 - likelihood) : likelihood
  }
  return strength
}
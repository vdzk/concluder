export const extractOutput = (text: string) => {
  const match = text.match(/<output>([\s\S]*?)<\/output>/i)
  return match ? match[1].trim() : null
}
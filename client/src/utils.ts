export const etv = (fn: (val: string, name: string) => void) => (event: { target: { value: string; name: string; }; }) => fn(event.target.value, event.target.name);

export const rpc = async (name: string, data: any) => {
  const response = await fetch(`/api/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return response.json()
}

export const getPercent = (
  x: number,
  fractionDigits?: number
) => (x * 100).toFixed(fractionDigits ?? 1) + '%'

export const getShortNumber = (value: number): string => {
  const abs = Math.abs(value)

  const format = (num: number, suffix: string) =>
    `${parseFloat(num.toFixed(1))}${suffix}`

  if (abs < 1_000) return value.toString()
  if (abs < 1_000_000) return format(value / 1_000, 'k')
  if (abs < 1_000_000_000) return format(value / 1_000_000, 'M')
  if (abs < 1_000_000_000_000) return format(value / 1_000_000_000, 'B')

  return format(value / 1_000_000_000_000, 'T')
}
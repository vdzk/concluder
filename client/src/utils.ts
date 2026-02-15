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
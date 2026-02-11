import { createSignal, Show, type Component } from 'solid-js'
import { etv, rpc } from './utils'
import { useNavigate } from '@solidjs/router'
import { TextInput } from './TextInput'

export const Home: Component = () => {
  const navigate = useNavigate()
  const [newClaimText, setNewClaimText] = createSignal('')
  const [saving, setSaving] = createSignal(false)
  const submitClaim = async () => {
    setSaving(true)
    const data = await rpc('addClaim', { text: newClaimText() })
    console.log(data)
    navigate(`/argue/${data.savedId}`)
  }
  return (
    <main>
      <TextInput
        placeholder="New claim"
        value={newClaimText()}
        onChange={setNewClaimText}
        saving={saving()}
        onSubmit={submitClaim}
      />
    </main>
  )
}

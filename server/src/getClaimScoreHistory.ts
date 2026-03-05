import { minidenticon } from 'minidenticons'
import { onError, sql } from './db.ts'

export const getClaimScoreHistory = async (claimId: number) => {
  const scoreHistory = await sql`
    SELECT id, old, new, timestamp, owner, action_data
    FROM score_change
    WHERE claim_id = ${claimId}
    ORDER BY timestamp ASC
  `.catch(onError)

  if (scoreHistory.length === 0) return { scoreHistory }

  const owners: string[] = []

  for (const scoreChange of scoreHistory) {
    const owner = scoreChange.owner
    delete scoreChange.owner
    let avatarIndex = owners.indexOf(owner)
    if (avatarIndex === -1) {
      owners.push(owner)
    }
  }

  const avatarResults = await sql`
    SELECT owner, svg
    FROM avatar
    WHERE owner IN ${sql(owners)}
  `.catch(onError)

  const avatarByOwner: Record<string, string> = {}

  for (const avatar of avatarResults) {
    avatarByOwner[avatar.owner] = avatar.svg
  }

  const hasNoAvatar = owners.filter(owner => !avatarByOwner[owner])

  if (hasNoAvatar.length > 0) {
    const newAvatars = []
    for (const owner of hasNoAvatar) {
      const svg = minidenticon(owner + process.env.RANDOM_SEED)
      avatarByOwner[owner] = svg
      newAvatars.push({owner, svg})
    }

    sql`
      INSERT INTO avatar ${sql(newAvatars)}
    `.catch(onError)
  }

  const avatars = owners.map(owner => avatarByOwner[owner])
  return { scoreHistory, avatars}
}
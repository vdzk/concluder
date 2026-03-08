import { type Request, type Response } from 'express'
import { minidenticon } from 'minidenticons'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import { onError, sql } from './db.ts'

export const getOrSetUsername = async (
  req: Request,
  res: Response
) => {
  let name = req.cookies.name

  if (!name) {
    name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      length: 3
    })

    res.cookie('name', name, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    const svg = minidenticon(name + process.env.RANDOM_SEED)
    await sql`
      INSERT INTO avatar ${sql({
        owner: name,
        svg
      })}
    `.catch(onError)
  }

  return name
}
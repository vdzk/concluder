import { type Request, type Response } from 'express'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

export const getOrSetUsername = (
  req: Request,
  res: Response
): string => {
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
  }

  return name
}
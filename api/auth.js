import { verify, sign } from 'jsonwebtoken'
import { buildResponse } from './utils.js'
import { pbkdf2Sync } from 'crypto'

export function createToken(username, id) {
  const token = sign({ username, id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
    audience: 'alura-serverless'
  })
  return token
}

export async function authorize(authorizationHeader) {
  if (!authorizationHeader) return buildResponse(401, { error: 'Missing authorization header' })
  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return buildResponse(401, { error: 'Invalid authorization header' })

  try {
    const decodedToken = verify(token, process.env.JWT_SECRET, { audience: 'alura-serverless' })
    if (!decodedToken) return buildResponse(401, { error: 'Invalid token' })
    return decodedToken
  } catch (err) {
    return buildResponse(401, { error: 'Invalid token' })
  }
}

export function makeHash(data) {
  return pbkdf2Sync(data, process.env.SALT, 100000, 64, 'sha512').toString('hex')
}
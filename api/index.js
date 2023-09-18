'use strict'
import { authorize, createToken, makeHash } from './auth.js'
import { getResultById, getUserByCredentials, saveResultToDatabase, createUser } from './db/database.js';
import { buildResponse } from './utils.js'
import { countCorrectAnswers } from './responses.js'

function extractBody(event) {
  if (!event?.body) {
    return buildResponse(422, { error: 'Missing body' })
  }

  return JSON.parse(event.body)
}

export async function login(event) {
  const { username, password } = extractBody(event)
  const hashedPass = makeHash(password)

  const user = await getUserByCredentials(username, hashedPass)

  if (!user) {
    return buildResponse(401, { error: 'Invalid username or password' })
  }

  return buildResponse(200, { token: createToken(username, user._id) })
}

export async function sendResponse(event) {
  const authResult = await authorize(event.headers.authorization)
  if (authResult.statusCode === 401) return authResult

  const { name, answers } = extractBody(event)
  const result = countCorrectAnswers(name, answers)
  const insertedId = await saveResultToDatabase(result)

  return buildResponse(201, {
    resultId: insertedId,
    __hypermedia: { href: '/results.html', query: { id: insertedId } }
  })
}

export async function getResult(event) {
  const authResult = await authorize(event.headers.authorization)
  if (authResult.statusCode === 401) return authResult

  const result = await getResultById(event.pathParameters.id)
  if (!result) {
    return buildResponse(404, { error: 'Result not found' })
  }

  return buildResponse(200, result)
}

const _createUser = async (event) => {

  const { username, password } = extractBody(event)
  const hashedPass = makeHash(password)
  const insertedId = await createUser(username, hashedPass)

  if (!insertedId) {
    return buildResponse(404, { error: 'User not created' })
  }

  return buildResponse(201, { id: insertedId, message: "User insert successfull" })
}
export { _createUser as createUser }
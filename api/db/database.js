import { MongoClient, ObjectId } from 'mongodb'

const connectionInstance = null

export async function connectToDatabase() {
  if (connectionInstance) return connectionInstance
  const client = new MongoClient(process.env.MONGODB_CONNECTIONSTRING)
  const connection = await client.connect()
  return connection.db(process.env.MONGODB_DB_NAME)
}

export async function getUserByCredentials(username, password) {
  const client = await connectToDatabase()
  const collection = client.collection('users')
  const user = await collection.findOne({ name: username, password: password })
  if (!user) return null
  return user
}

export async function saveResultToDatabase(result) {
  const client = await connectToDatabase()
  const collection = client.collection('results')
  const { insertedId } = await collection.insertOne(result)
  return insertedId
}

export async function getResultById(id) {
  const client = await connectToDatabase()
  const collection = client.collection('results')
  const result = await collection.findOne({ _id: new ObjectId(id) })
  if (!result) return null
  return result
}

export async function createUser(username, password){
  const client = await connectToDatabase()
  const collection = client.collection('users')
  const { insertedId } = await collection.insertOne({ name: username, password: password })
  if (!insertedId) return null
  return insertedId
}
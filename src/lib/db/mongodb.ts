import { MongoClient } from 'mongodb'
import { env } from '@/lib/env'

declare global {
    var __mongoClientPromise__: Promise<MongoClient> | undefined
}

const client = new MongoClient(env.MONGODB_URI)

export const mongoClientPromise =
    global.__mongoClientPromise__ ?? client.connect()

if (process.env.NODE_ENV !== 'production') {
    global.__mongoClientPromise__ = mongoClientPromise
}

export async function getDb() {
    const connectedClient = await mongoClientPromise
    return connectedClient.db(env.MONGODB_DB_NAME)
}

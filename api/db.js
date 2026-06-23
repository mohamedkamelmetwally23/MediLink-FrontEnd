/* global process */
import { MongoClient } from "mongodb";

let client;
let clientPromise;

export function getMongoClient(env = process.env) {
  const uri = env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in environment");

  if (!clientPromise) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb(dbName, env = process.env) {
  const connectedClient = await getMongoClient(env);
  // Use DB name from URI or from env, fall back to "medilink"
  const name = dbName || env.MONGODB_DB || "medilink";
  return connectedClient.db(name);
}

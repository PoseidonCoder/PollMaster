import { ObjectId } from "mongodb";
import Connection from "./mongodb";

export const findPoll = async (id) =>
  await Connection.polls.findOne({ _id: ObjectId(id) });

export const findAllPolls = async () =>
  await Connection.polls.find({}).toArray();

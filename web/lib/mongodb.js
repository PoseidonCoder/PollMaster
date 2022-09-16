import { MongoClient } from "mongodb";

class Connection {
  static async connect() {
    const client = await MongoClient.connect(this.uri, this.options);
    this.db = client.db("PollMaster");
    this.polls = this.db.collection("polls");
  }

  static async open() {
    if (this.db) return this.db;

    if (process.env.NODE_ENV === "development") {
      if (!global._db) {
        await this.connect();
        global._db = this.db;
      } else {
        this.db = global._db;
        this.polls = this.db.collection("polls");
      }
    } else await this.connect();

    return this.db;
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid environment variable: "MONGODB_URI"');
}

Connection.db = null;
Connection.uri = process.env.MONGODB_URI;
Connection.options = {
  wtimeoutMS: 2500,
  useNewUrlParser: true,
};

Connection.open();

export const polls = Connection.polls;
export default Connection;

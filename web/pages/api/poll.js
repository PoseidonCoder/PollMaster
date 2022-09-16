// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { polls } from "../../lib/mongodb";
import { findPoll } from "../../lib/queries";
import { ObjectId } from "mongodb";
import { parseUser } from "../../utils/parse-user";

export default async function handler(req, res) {
  if (req.method === "POST") {
    let options = {};
    req.body.options.forEach((option) => (options[option] = []));

    const poll = await polls.insert({
      title: req.body.title,
      options,
    });

    res.status(200).json({ data: { id: poll.insertedIds["0"] } });
  } else if (req.method === "PUT") {
    const user = parseUser(req);
    const poll = await findPoll(req.body.id);

    for (const option in poll.options) {
      const voted = poll.options[option];
      if (voted.includes(user.username))
        await polls.updateOne(
          { _id: ObjectId(req.body.id) },
          { $pull: { [`options.${option}`]: user.username } }
        );
    }

    await polls.updateOne(
      { _id: ObjectId(req.body.id) },
      { $push: { [`options.${req.body.option}`]: user.username } }
    );

    res.status(200).json({ data: await findPoll(req.body.id) });
  } else {
    res
      .status(400)
      .json({ error: { code: 400, message: "Method not allowed" } });
  }
}

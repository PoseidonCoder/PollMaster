import React from "react";
import { findAllPolls } from "../lib/queries";
import { Typography, Card, Button } from "antd";
import Link from "next/link";

const { Title } = Typography;

export async function getServerSideProps() {
  const polls = await findAllPolls();

  return {
    props: {
      polls: JSON.parse(JSON.stringify(polls)),
    },
  };
}

export default function Poll({ polls, user }) {
  return (
    <>
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Title>PollMaster</Title>
        <Title level={5}>
          A quick and easy poll creator with Discord capabilities
        </Title>
        <Link href="/create">
          <Button size="large" type="primary">
            Create a Poll
          </Button>
        </Link>
      </div>

      <section style={{ width: "50%", margin: "auto", padding: "2rem" }}>
        {polls.map((poll) => (
          <Card
            size="small"
            key={poll._id}
            title={poll.title}
            style={{ marginTop: 15 }}
          >
            <Link href={"/poll/" + poll._id}>
              <Button disabled={user}>Take Poll</Button>
            </Link>
            {user && (
              <Typography.Text style={{ marginLeft: 5 }} type="secondary">
                <a href="/api/oauth">Sign in</a> to take polls
              </Typography.Text>
            )}
          </Card>
        ))}
      </section>
    </>
  );
}

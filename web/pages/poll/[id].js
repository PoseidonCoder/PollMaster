import React, { useState } from "react";
import { findPoll } from "../../lib/queries";
import {
  Button,
  Progress,
  Form,
  Radio,
  Space,
  Typography,
  Col,
  Row,
} from "antd";

const { Title } = Typography;

export async function getServerSideProps(ctx) {
  const { id } = ctx.query;
  const poll = await findPoll(id);

  return {
    props: {
      poll: JSON.parse(JSON.stringify(poll)),
    },
  };
}

export default function Poll({ poll, user }) {
  console.log(poll);
  const [option, setOption] = useState();
  const [pollResults, setPollResults] = useState();

  let totalVotes;
  if (pollResults)
    totalVotes = Object.values(pollResults).reduce(
      (prev, curr) => prev + curr.length,
      0
    );

  const submitPoll = async () => {
    const response = await fetch("/api/poll", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        option,
        id: poll._id,
      }),
    }).then((res) => res.json());

    setPollResults(response.data.options);
  };

  if (!poll) return <Title>404 Not Found</Title>;

  return (
    <section
      style={{
        textAlign: "center",
        marginTop: "2rem",
      }}
    >
      {pollResults ? (
        <>
          {Object.keys(pollResults).map((option) => (
            <div style={{ width: "50%", margin: "1rem auto" }}>
              <Title level={5} style={{ textAlign: "left" }}>
                {option}
              </Title>
              <Progress
                percent={(pollResults[option].length / totalVotes) * 100}
                status="active"
              />
            </div>
          ))}
        </>
      ) : (
        <>
          <Title>{poll.title}</Title>

          <Radio.Group
            size="large"
            options={Object.keys(poll.options)}
            optionType="button"
            onChange={({ target: { value } }) => setOption(value)}
            value={option}
          />

          <br />
          <br />

          <Button
            disabled={!option}
            color="primary"
            size="large"
            type="primary"
            shape="round"
            onClick={submitPoll}
          >
            Submit
          </Button>
        </>
      )}
    </section>
  );
}

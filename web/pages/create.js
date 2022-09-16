import { Button, Form, Input, Layout, Typography } from "antd";
import React from "react";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 7,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 15,
    },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 15,
      offset: 7,
    },
  },
};

export default function Home({ user }) {
  const router = useRouter();

  const onFinish = async (values) => {
    const response = await fetch("/api/poll", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(values),
    }).catch((err) => Promise.reject(new Error(err)));

    const body = await response.json();
    router.push("poll/" + body.data.id);
  };

  return (
    <>
      <Title style={{ textAlign: "center", marginTop: "1rem" }} level={3}>
        Create a Poll
      </Title>
      <Form
        name="create_poll_form"
        {...formItemLayoutWithOutLabel}
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.Item
          {...formItemLayout}
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input a title!" }]}
        >
          <Input
            style={{
              width: "60%",
            }}
          />
        </Form.Item>

        <Form.List
          name="options"
          rules={[
            {
              validator: async (_, options) => {
                if (!options || options.length < 1) {
                  return Promise.reject(
                    new Error("You need at least one option")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  key={field.key}
                  label={index === 0 ? "Options" : ""}
                  required={false}
                  {...(index === 0
                    ? formItemLayout
                    : formItemLayoutWithOutLabel)}
                >
                  <Form.Item
                    {...field}
                    rules={[
                      {
                        required: true,
                        message: "Please input an option or delete this field.",
                      },
                    ]}
                    validateTrigger={["onChange", "onBlur"]}
                    noStyle
                  >
                    <Input
                      placeholder={"Option " + (index + 1)}
                      style={{
                        width: "60%",
                      }}
                    />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{
                    width: "60%",
                  }}
                >
                  Add option
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Poll
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

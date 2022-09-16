import { Menu } from "antd";
import Link from "next/link";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";

export default function Navbar({ user }) {
  const menuItems = [
    { key: "home", label: <Link href="/">PollMaster</Link> },
    {
      key: "create",
      label: <Link href="/create">Create</Link>,
      icon: <PlusOutlined />,
    },
  ];

  if (user) {
    menuItems.push({
      key: "username",
      label: `${user.username}#${user.discriminator}`,
      icon: <UserOutlined />,
    });
  } else {
    menuItems.push({
      key: "sign_in",
      label: <Link href="/api/oauth">Sign in</Link>,
    });
  }

  return <Menu mode="horizontal" theme="dark" items={menuItems} />;
}

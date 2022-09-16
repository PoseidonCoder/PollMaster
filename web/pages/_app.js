import "../styles/globals.css";
import "antd/dist/antd.css";
import Head from "next/head";
import { Divider, Layout } from "antd";
import Link from "next/link";
import { GithubFilled } from "@ant-design/icons";
import { parseUser } from "../utils/parse-user";
import Navbar from "../components/Navbar";
import App from "next/app";

const { Header, Content, Footer } = Layout;

function MyApp({ Component, pageProps, user }) {
  return (
    <Layout>
      <Head>
        <title>PollMaster</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Header>
        <Navbar user={user} />
      </Header>

      <Content>
        <Component {...pageProps} />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        <Link href="https://github.com/PoseidonCoder" target="_blank">
          <GithubFilled style={{ fontSize: 20 }} />
        </Link>
        <Divider />
        Made by Lukas with ❤️
      </Footer>
    </Layout>
  );
}

MyApp.getInitialProps = async (appCtx) => {
  let pageProps = await App.getInitialProps(appCtx);

  const user = parseUser(appCtx.ctx.req);

  return { ...pageProps, user };
};

export default MyApp;

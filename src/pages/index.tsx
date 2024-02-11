import Head from "next/head";

import { api } from "~/utils/api";
import { env } from "~/env";
import styles from "./index.module.css";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Create <span className={styles.pinkSpan}>T3</span> App
          </h1>
          <div className={styles.cardRow}>
          <a href={`${env.NEXT_PUBLIC_API_URL}/auth.login`}>Steam Login</a>
           {/* <button onClick={() => fetch("/api/login")}>Steam Login</button> */}
          </div>
          <p className={styles.showcaseText}>
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
}

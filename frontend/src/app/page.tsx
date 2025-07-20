import Head from "next/head";
import YouTubeDashboard from "@/app/components/YouTubeDashboard";

export default function Home() {
  return (
    <>
      <Head>
        <title>YouTube Companion Dashboard</title>
        <meta
          name="description"
          content="Manage your YouTube videos with ease"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <YouTubeDashboard />
    </>
  );
}

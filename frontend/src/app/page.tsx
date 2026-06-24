import { auth } from "@clerk/nextjs/server";
import { Landing } from "@/components/landing";
import "@/components/landing/landing.css";

export default async function Home() {
  const { userId } = await auth();

  return <Landing isSignedIn={!!userId} />;
}

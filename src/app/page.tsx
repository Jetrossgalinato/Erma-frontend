import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home"); //to direct users to the home page
  return null;
}

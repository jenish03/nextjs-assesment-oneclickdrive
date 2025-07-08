import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  if (authToken?.value === "authenticated") {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

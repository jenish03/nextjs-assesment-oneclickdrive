import axios from "axios";
import DashboardClient from "./DashboardClient";
import { Listing } from "@/lib/api";
import { cookies } from "next/headers";

interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
}

export default async function DashboardPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const page = parseInt((params?.page as string) || "1", 10);
  const pageSize = parseInt((params?.pageSize as string) || "10", 10);

  // Pass cookies for authentication if needed
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(
      (cookie: { name: string; value: string }) =>
        `${cookie.name}=${cookie.value}`
    )
    .join("; ");
  const res = await axios.get<ListingsResponse>(
    `${baseUrl}/api/listings?page=${page}&pageSize=${pageSize}`,
    { headers: { Cookie: cookieHeader } }
  );
  const { listings, total } = res.data;
  return (
    <DashboardClient
      initialListings={listings}
      total={total}
      page={page}
      pageSize={pageSize}
    />
  );
}

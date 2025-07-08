import axios from "axios";
import DashboardClient from "./DashboardClient";
import { Listing } from "@/lib/api";

export default async function DashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await axios.get<{ listings: Listing[] }>(
    `${baseUrl}/api/listings`
  );
  const listings = res.data.listings;
  return <DashboardClient initialListings={listings} />;
}

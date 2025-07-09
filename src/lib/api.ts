import axios from "axios";
import { ListingStatus } from "@/types/listing";

export interface Listing {
  id: number;
  title: string;
  description: string;
  status: ListingStatus;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
}

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  try {
    return await axios.post("/api/auth/login", { username, password });
  } catch (error) {
    console.error("error", error);
  }
}

export async function fetchListings(
  page = 1,
  pageSize = 10,
  status?: ListingStatus
): Promise<ListingsResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (status) params.append("status", status);
    const res = await axios.get<ListingsResponse>(
      `/api/listings?${params.toString()}`
    );
    return res.data;
  } catch (error) {
    console.error("error", error);
    return { listings: [], total: 0, page, pageSize };
  }
}

export async function approveListing(id: number) {
  try {
    return await axios.patch(`/api/listings/${id}`, { status: "approved" });
  } catch (error) {
    console.error("error", error);
  }
}

export async function rejectListing(id: number) {
  try {
    return await axios.patch(`/api/listings/${id}`, { status: "rejected" });
  } catch (error) {
    console.error("error", error);
  }
}

export async function logout() {
  try {
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("error", error);
  }
}

export async function fetchAuditLogs() {
  const res = await fetch("/api/audit-log");
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

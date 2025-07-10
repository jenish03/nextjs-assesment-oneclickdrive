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
    throw error;
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

export async function updateListingStatus(
  id: number,
  status: "approved" | "rejected" | "pending"
) {
  try {
    return await axios.patch(`/api/listings/${id}`, { status });
  } catch (error) {
    console.error("error", error);
    throw error;
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
  try {
    const res = await axios.get("/api/audit-log");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    throw error;
  }
}

import axios from "axios";
import { ListingStatus } from "@/types/listing";

export interface Listing {
  id: number;
  title: string;
  description: string;
  status: ListingStatus;
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

export async function fetchListings(): Promise<Listing[]> {
  try {
    const res = await axios.get<{ listings: Listing[] }>("/api/listings");
    return res.data.listings ?? [];
  } catch (error) {
    console.error("error", error);
    return [];
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

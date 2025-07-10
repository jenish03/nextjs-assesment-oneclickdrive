"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchListings,
  updateListingStatus,
  Listing,
  ListingsResponse,
  logout,
} from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { ReactElement } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { ListingStatus } from "@/types/listing";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import EditListingDialog from "./EditListingDialog";

interface ListingRowProps {
  listing: Listing;
  approvingId: number | null;
  rejectingId: number | null;
  handleApprove: (listing: Listing) => void;
  handleReject: (listing: Listing) => void;
  handleEdit: (listing: Listing) => void;
}
// ListingRow memoized component for table row rendering
const ListingRow = React.memo(function ListingRow({
  listing,
  approvingId,
  rejectingId,
  handleApprove,
  handleReject,
  handleEdit,
}: Readonly<ListingRowProps>) {
  return (
    <TableRow key={listing.id}>
      <TableCell>{listing.id}</TableCell>
      <TableCell>{listing.title}</TableCell>
      <TableCell>{listing.description}</TableCell>
      <TableCell>{listing.status}</TableCell>
      <TableCell className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <Button
          size="sm"
          className={`cursor-pointer ${
            listing.status === "approved"
              ? "bg-green-500 text-white hover:bg-green-600"
              : ""
          }`}
          variant={listing.status === "approved" ? "default" : "outline"}
          disabled={approvingId === listing.id || listing.status === "approved"}
          onClick={() => handleApprove(listing)}
          aria-label={`Approve listing ${listing.id}`}
        >
          {listing.status === "approved" ? "Approved" : "Approve"}
        </Button>
        <Button
          size="sm"
          className={`cursor-pointer ${
            listing.status === "rejected"
              ? "bg-red-500 text-white hover:bg-red-600"
              : ""
          }`}
          variant={listing.status === "rejected" ? "destructive" : "outline"}
          disabled={rejectingId === listing.id || listing.status === "rejected"}
          onClick={() => handleReject(listing)}
          aria-label={`Reject listing ${listing.id}`}
        >
          {listing.status === "rejected" ? "Rejected" : "Reject"}
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          variant="outline"
          onClick={() => handleEdit(listing)}
          aria-label={`Edit listing ${listing.id}`}
        >
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
});

interface DashboardClientProps {
  initialListings: Listing[];
  total: number;
  page: number;
  pageSize: number;
}

const editSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .mixed<ListingStatus>()
    .oneOf(["approved", "pending", "rejected"])
    .required("Status is required"),
});

export type EditFormValues = yup.InferType<typeof editSchema>;

export default function DashboardClient({
  initialListings,
  total: initialTotal,
  page: initialPage,
  pageSize: initialPageSize,
}: Readonly<DashboardClientProps>) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EditFormValues>({
    resolver: yupResolver(editSchema),
    defaultValues: { title: "", description: "", status: "pending" },
  });

  useEffect(() => {
    const auth = Cookies.get("auth_token") === "authenticated";
    setIsAuth(auth);
    setAuthChecked(true);
  }, []);

  useAuthRedirect({ requireAuth: true, redirectTo: "/login" });
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const {
    data: listingsData = {
      listings: initialListings,
      total: initialTotal,
      page: initialPage,
      pageSize: initialPageSize,
    },
    isLoading,
    error,
  } = useQuery<ListingsResponse>({
    queryKey: ["listings", initialPage, initialPageSize, statusFilter],
    queryFn: () =>
      fetchListings(
        initialPage,
        initialPageSize,
        statusFilter === "all" ? undefined : (statusFilter as ListingStatus)
      ),
    enabled: isAuth,
    initialData: {
      listings: initialListings,
      total: initialTotal,
      page: initialPage,
      pageSize: initialPageSize,
    },
  });
  const { listings, total, page, pageSize } = listingsData;

  const approveMutation = useMutation({
    mutationFn: (id: number) => updateListingStatus(id, "approved"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setActionSuccess("Listing approved.");
    },
    onError: () => setActionError("Failed to approve listing."),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => updateListingStatus(id, "rejected"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setActionSuccess("Listing rejected.");
    },
    onError: () => setActionError("Failed to reject listing."),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormValues & { id: number }) => {
      await axios.patch(`/api/listings/${data.id}`, {
        title: data.title,
        description: data.description,
        status: data.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setActionSuccess("Listing updated.");
      setEditOpen(false);
    },
    onError: () => setActionError("Failed to update listing."),
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleApprove = useCallback(
    (listing: Listing) => {
      setApprovingId(listing.id);
      approveMutation.mutate(listing.id, {
        onSuccess: () => {
          setActionSuccess(`${listing.title} approved.`);
        },
        onSettled: () => setApprovingId(null),
      });
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (listing: Listing) => {
      setRejectingId(listing.id);
      rejectMutation.mutate(listing.id, {
        onSuccess: () => {
          setActionSuccess(`${listing.title} rejected.`);
        },
        onSettled: () => setRejectingId(null),
      });
    },
    [rejectMutation]
  );

  const handleEdit = (listing: Listing) => {
    setEditListing(listing);
    reset({
      title: listing.title,
      description: listing.description,
      status: listing.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit: SubmitHandler<EditFormValues> = (data) => {
    if (!editListing) return;

    updateMutation.mutate({ ...data, id: editListing.id });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderTableRows = useMemo<ReactElement[]>(() => {
    return (listings ?? []).map((listing: Listing) => (
      <ListingRow
        key={listing.id}
        listing={listing}
        approvingId={approvingId}
        rejectingId={rejectingId}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleEdit={handleEdit}
      />
    ));
  }, [listings, approvingId, rejectingId]);

  let content: ReactElement | null = null;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div className="text-red-600">Failed to load listings.</div>;
  } else {
    content = (
      <div className="w-full max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table className="min-w-[700px] w-full text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="px-2 py-2">ID</TableHead>
              <TableHead className="px-2 py-2">Title</TableHead>
              <TableHead className="px-2 py-2">Description</TableHead>
              <TableHead className="px-2 py-2">Status</TableHead>
              <TableHead className="px-2 py-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows}</TableBody>
        </Table>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(total / pageSize);
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("pageSize", String(pageSize));
    if (statusFilter && statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    // Reset to page 1 on filter change
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    if (value && value !== "all") {
      params.set("status", value);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  if (!authChecked) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Car Rental Listings
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/audit-log">
            <Button
              type="button"
              variant="secondary"
              aria-label="Audit Log"
              className="w-full sm:w-auto cursor-pointer"
            >
              Audit Log
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            aria-label="Logout"
            onClick={handleLogout}
            className="w-full sm:w-auto cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
      {/* Status Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="status-filter">Filter by status:</Label>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger id="status-filter" className="w-40 cursor-pointer">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              All
            </SelectItem>
            <SelectItem value="approved" className="cursor-pointer">
              Approved
            </SelectItem>
            <SelectItem value="pending" className="cursor-pointer">
              Pending
            </SelectItem>
            <SelectItem value="rejected" className="cursor-pointer">
              Rejected
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {actionSuccess && (
        <div
          className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm mb-4"
          role="status"
        >
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div
          className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-4"
          role="alert"
        >
          {actionError}
        </div>
      )}
      {content}
      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="cursor-pointer"
        >
          Prev
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="cursor-pointer"
        >
          Next
        </Button>
      </div>
      <EditListingDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        handleSubmit={handleSubmit}
        handleEditSubmit={handleEditSubmit}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        updateMutation={updateMutation}
      />
    </div>
  );
}

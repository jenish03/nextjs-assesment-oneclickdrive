"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchListings,
  approveListing,
  rejectListing,
  Listing,
  logout,
} from "@/lib/api";
import { useAuthRedirect } from "@/lib/useAuthRedirect";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useCallback, useMemo, useEffect } from "react";
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

interface DashboardClientProps {
  initialListings: Listing[];
}

const editSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .mixed<ListingStatus>()
    .oneOf(["approved", "pending", "rejected"])
    .required("Status is required"),
});

type EditFormValues = yup.InferType<typeof editSchema>;

export default function DashboardClient({
  initialListings,
}: Readonly<DashboardClientProps>) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const router = useRouter();

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
    data: listings = [],
    isLoading,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: fetchListings,
    enabled: isAuth,
    initialData: initialListings,
  });

  const approveMutation = useMutation({
    mutationFn: approveListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      setActionSuccess("Listing approved.");
    },
    onError: () => setActionError("Failed to approve listing."),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectListing,
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
    (id: number) => {
      approveMutation.mutate(id);
    },
    [approveMutation]
  );

  const handleReject = useCallback(
    (id: number) => {
      rejectMutation.mutate(id);
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

  const renderTableRows = useMemo<ReactElement[]>(
    () =>
      (listings ?? []).map((listing: Listing) => (
        <TableRow key={listing.id}>
          <TableCell>{listing.id}</TableCell>
          <TableCell>{listing.title}</TableCell>
          <TableCell>{listing.description}</TableCell>
          <TableCell>{listing.status}</TableCell>
          <TableCell className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              size="sm"
              variant="default"
              disabled={approveMutation.isPending}
              onClick={() => handleApprove(listing.id)}
              aria-label={`Approve listing ${listing.id}`}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={rejectMutation.isPending}
              onClick={() => handleReject(listing.id)}
              aria-label={`Reject listing ${listing.id}`}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(listing)}
              aria-label={`Edit listing ${listing.id}`}
            >
              Edit
            </Button>
          </TableCell>
        </TableRow>
      )),
    [
      listings,
      approveMutation.isPending,
      rejectMutation.isPending,
      handleApprove,
      handleReject,
    ]
  );

  let content: ReactElement | null = null;
  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div className="text-red-600">Failed to load listings.</div>;
  } else {
    content = (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table className="min-w-[600px] w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows}</TableBody>
        </Table>
      </div>
    );
  }

  if (!authChecked) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Car Rental Listings
        </h1>
        <Button
          type="button"
          variant="outline"
          aria-label="Logout"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="mb-1">
                Title
              </Label>
              <Input id="edit-title" {...register("title")} required />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description" className="mb-1">
                Description
              </Label>
              <Textarea
                id="edit-description"
                {...register("description")}
                required
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-status" className="mb-1">
                Status
              </Label>
              <Select
                value={watch("status") as ListingStatus}
                onValueChange={(value: ListingStatus) =>
                  setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

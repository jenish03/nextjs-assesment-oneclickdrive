import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingStatus } from "@/types/listing";
import {
  FieldErrors,
  UseFormReturn,
  UseFormHandleSubmit,
} from "react-hook-form";
import type { EditFormValues } from "./DashboardClient";

interface EditListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: UseFormHandleSubmit<EditFormValues>;
  handleEditSubmit: (data: EditFormValues) => void;
  register: UseFormReturn<EditFormValues>["register"];
  errors: FieldErrors<EditFormValues>;
  watch: UseFormReturn<EditFormValues>["watch"];
  setValue: UseFormReturn<EditFormValues>["setValue"];
  updateMutation: { isPending: boolean };
}

export default function EditListingDialog({
  open,
  onOpenChange,
  handleSubmit,
  handleEditSubmit,
  register,
  errors,
  watch,
  setValue,
  updateMutation,
}: Readonly<EditListingDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-title" className="mb-1">
              Title
            </Label>
            <Input
              id="edit-title"
              {...register("title")}
              required
              className="cursor-pointer"
            />
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
              className="cursor-pointer"
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
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as ListingStatus)
              }
            >
              <SelectTrigger id="edit-status" className="w-full cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
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
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="cursor-pointer"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

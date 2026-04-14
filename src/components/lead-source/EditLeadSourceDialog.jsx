import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditLeadSourceDialog({
  editDialogOpen,
  setEditDialogOpen,
  setEditPreview,
  editItem,
  handleUpdate,
  setEditItem,
  setEditImage,
  readImage,
  editPreview,
  editSubmitting,
}) {
  return (
    <Dialog
      open={editDialogOpen}
      onOpenChange={(o) => {
        setEditDialogOpen(o);
        if (!o) setEditPreview(null);
      }}
    >
      <DialogContent className="bg-[#101a2a] text-white">
        <DialogHeader>
          <DialogTitle>Manbani tahrirlash</DialogTitle>
          <DialogDescription className="sr-only">
            Lead manbasi ma'lumotlarini tahrirlash oynasi.
          </DialogDescription>
        </DialogHeader>

        {editItem && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Field>
              <FieldLabel>Nom *</FieldLabel>
              <Input
                value={editItem.name}
                onChange={(e) =>
                  setEditItem((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Manba nomi"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Icon rasmi</FieldLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setEditImage(file);
                    readImage(file, setEditPreview);
                  }
                }}
              />
              {editPreview && (
                <img
                  src={editPreview}
                  alt="preview"
                  className="mt-2 h-16 w-16 rounded-lg object-cover ring-2 ring-indigo-500"
                />
              )}
            </Field>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4">
              <Label className="cursor-pointer">Aktiv holati</Label>
              <Switch
                checked={editItem.isActive}
                onCheckedChange={(v) =>
                  setEditItem((p) => ({ ...p, isActive: v }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-black"
                onClick={() => setEditDialogOpen(false)}
              >
                Bekor
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {editSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  "Saqlash"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function CreateLeadSourceDialog({
  dialogOpen,
  setDialogOpen,
  setImagePreview,
  setSelectedImage,
  handleCreate,
  newLeadSource,
  setNewLeadSource,
  readImage,
  imagePreview,
  submitting,
}) {
  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(o) => {
        setDialogOpen(o);
        if (!o) {
          setImagePreview(null);
          setSelectedImage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-700">
          <Plus size={16} /> Yangi manba
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#101a2a] text-white">
        <DialogHeader>
          <DialogTitle>Yangi lead manbasi qo'shish</DialogTitle>
          <DialogDescription className="sr-only">
            Yangi lead manbasi nomi, rasmi va holatini kiritish oynasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Nom *</FieldLabel>
            <Input
              id="name"
              value={newLeadSource.name}
              onChange={(e) =>
                setNewLeadSource((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Masalan: Instagram"
              required
            />
            <FieldDescription>Manba nomini kiriting</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="icon">Icon rasmi</FieldLabel>
            <Input
              id="icon"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedImage(file);
                  readImage(file, setImagePreview);
                }
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-2 h-16 w-16 rounded-lg object-cover ring-2 ring-indigo-500"
              />
            )}
          </Field>

          <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4">
            <Label className="cursor-pointer">Aktiv holati</Label>
            <Switch
              checked={newLeadSource.isActive}
              onCheckedChange={(v) =>
                setNewLeadSource((p) => ({ ...p, isActive: v }))
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-black"
              onClick={() => setDialogOpen(false)}
            >
              Bekor
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "Yaratish"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

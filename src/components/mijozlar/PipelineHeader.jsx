import {
  Download,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoiceVisualizer } from "react-voice-visualizer";
import IconBtn from "./IconBtn";

export default function PipelineHeader({
  currentProject,
  projects,
  loadProject,
  searchWrapRef,
  searchInputRef,
  searchParams,
  setSearchPanelOpen,
  updateSearchParam,
  searchLoading,
  searchPanelOpen,
  statuses,
  leadSource,
  operatorsList,
  operatorsLoading,
  setSearchParams,
  DEFAULT_SEARCH_PARAMS,
  isFiltering,
  totalFiltered,
  totalAll,
  totalFilteredBudjet,
  totalSumBase,
  actionsWrapRef,
  actionsOpen,
  setActionsOpen,
  handleExport,
  handleImport,
  canManageStatuses,
  sheetOpen,
  setSheetOpen,
  resetLeadForm,
  setAiDialogOpen,
  handleSubmit,
  formData,
  handleChange,
  formatPhoneDisplay,
  maxBirthDate,
  setFormData,
  formatBudgetDisplay,
  closeLeadSheet,
  submitting,
  aiDialogOpen,
  resetAiAudioState,
  recorderControls,
  recordedBlob,
  handleProcessAiAudio,
  aiProcessing,
  isRecordingInProgress,
  isProcessingRecordedAudio,
  aiDraft,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#284860] bg-[#0f2231] px-4 py-4 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <Select
          value={currentProject?.name || ""}
          onValueChange={(name) => {
            const p = projects.find((x) => x.name === name);
            if (p) loadProject(p);
          }}
        >
          <SelectTrigger className="w-full lg:w-56" style={{ height: "36px" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="mt-10">
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div ref={searchWrapRef} className="relative min-w-0 flex-1">
          <div className="flex h-10 items-center gap-2 rounded-md bg-[#10263b] px-3">
            <Search size={14} className="shrink-0 text-gray-500" />
            <input
              ref={searchInputRef}
              value={searchParams.search}
              onFocus={() => setSearchPanelOpen(true)}
              onChange={(e) => updateSearchParam("search", e.target.value)}
              placeholder="Qidiruv (ism, familiya, telefon)"
              className="h-full w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            {searchLoading && (
              <Loader2 size={14} className="shrink-0 animate-spin text-blue-400" />
            )}
            {searchParams.search && (
              <button
                onClick={() => updateSearchParam("search", "")}
                className="text-gray-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {searchPanelOpen && (
            <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-md border border-[#21435b] bg-[#0f2236] shadow-2xl">
              <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto p-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Status</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={searchParams.statusId || ""}
                      onValueChange={(v) => updateSearchParam("statusId", v)}
                    >
                      <SelectTrigger className="h-9 w-full bg-[#10263b]">
                        <SelectValue placeholder="Status tanlang" />
                      </SelectTrigger>
                      <SelectContent className="mt-10">
                        {statuses.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {searchParams.statusId && (
                      <button
                        type="button"
                        onClick={() => updateSearchParam("statusId", "")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                        aria-label="Statusni tozalash"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Lead manbasi</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={searchParams.leadSourceId || ""}
                      onValueChange={(v) => updateSearchParam("leadSourceId", v)}
                    >
                      <SelectTrigger className="h-9 w-full bg-[#10263b]">
                        <SelectValue placeholder="Manba tanlang" />
                      </SelectTrigger>
                      <SelectContent className="mt-10">
                        {leadSource.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {searchParams.leadSourceId && (
                      <button
                        type="button"
                        onClick={() => updateSearchParam("leadSourceId", "")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                        aria-label="Manbani tozalash"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Operator</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={searchParams.assignedUserId || ""}
                      onValueChange={(v) => updateSearchParam("assignedUserId", v)}
                    >
                      <SelectTrigger className="h-9 w-full bg-[#10263b]">
                        <SelectValue
                          placeholder={
                            operatorsLoading
                              ? "Operatorlar yuklanmoqda..."
                              : "Operator tanlang"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="mt-10 max-h-72">
                        {operatorsList.map((operator) => (
                          <SelectItem key={operator.id} value={String(operator.id)}>
                            {operator.fullName ||
                              operator.email ||
                              `#${operator.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {searchParams.assignedUserId && (
                      <button
                        type="button"
                        onClick={() => updateSearchParam("assignedUserId", "")}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                        aria-label="Operatorni tozalash"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">
                    Budjet (dan / gacha)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={searchParams.budjetFrom}
                      onChange={(e) =>
                        updateSearchParam("budjetFrom", e.target.value)
                      }
                      placeholder="Dan"
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                    />
                    <input
                      type="number"
                      value={searchParams.budjetTo}
                      onChange={(e) =>
                        updateSearchParam("budjetTo", e.target.value)
                      }
                      placeholder="Gacha"
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Manzil</label>
                  <input
                    value={searchParams.adress}
                    onChange={(e) => updateSearchParam("adress", e.target.value)}
                    placeholder="Manzil kiriting"
                    className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">
                    Tug'ilgan sana (dan / gacha)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={searchParams.birthDateFrom}
                      onChange={(e) =>
                        updateSearchParam("birthDateFrom", e.target.value)
                      }
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                    <input
                      type="date"
                      value={searchParams.birthDateTo}
                      onChange={(e) =>
                        updateSearchParam("birthDateTo", e.target.value)
                      }
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">
                    Yaratilgan sana (dan / gacha)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={searchParams.createdFrom}
                      onChange={(e) =>
                        updateSearchParam("createdFrom", e.target.value)
                      }
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                    <input
                      type="date"
                      value={searchParams.createdTo}
                      onChange={(e) =>
                        updateSearchParam("createdTo", e.target.value)
                      }
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-[#21435b] px-3 py-2">
                <button
                  onClick={() => setSearchParams({ ...DEFAULT_SEARCH_PARAMS })}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Tozalash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 lg:min-w-[320px] lg:items-end">
        <span className="rounded-md border border-[#1d3a52] bg-[#0b1a29] px-3 py-2 text-xs text-gray-400 lg:text-right">
          {isFiltering ? (
            <>
              <span className="text-white">{totalFiltered}</span>/{totalAll} mijoz
              <span className="mx-1">•</span>
              <span className="text-green-400">
                {Number(totalFilteredBudjet).toLocaleString()} so'm
              </span>
              <span className="mx-1 text-gray-600">/</span>
              <span className="text-green-400/80">
                {Number(totalSumBase).toLocaleString()} so'm
              </span>
            </>
          ) : (
            <>
              <span className="text-white">{totalAll}</span> mijoz
              <span className="mx-1">/</span>
              <span className="text-green-400">
                {Number(totalSumBase).toLocaleString()} so'm
              </span>
            </>
          )}
        </span>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div ref={actionsWrapRef} className="relative order-3 sm:order-none">
            <button
              onClick={() => setActionsOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a4868] text-gray-300 transition-colors hover:bg-[#1b3e57] hover:text-white"
            >
              <MoreHorizontal size={16} />
            </button>
            {actionsOpen && (
              <div className="absolute top-full left-0 z-50 mt-2 w-44 rounded-md border border-[#1e3a52] bg-[#0a1929] p-1 shadow-2xl lg:left-auto lg:right-0">
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    handleExport();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-200 hover:bg-[#11263a]"
                >
                  <Upload size={14} className="text-green-400" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    handleImport();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-200 hover:bg-[#11263a]"
                >
                  <Download size={14} className="text-yellow-400" />
                  Import
                </button>
              </div>
            )}
          </div>

          {canManageStatuses && (
            <Link to="/addStatus" className="min-w-0">
              <IconBtn
                icon={Settings}
                label="Sozlamalar"
                className="justify-center px-3"
              />
            </Link>
          )}

          <Sheet
            open={sheetOpen}
            onOpenChange={(o) => {
              setSheetOpen(o);
              if (!o) {
                resetLeadForm();
              }
            }}
          >
            <SheetTrigger asChild>
              <div className="min-w-0">
                <IconBtn
                  icon={Plus}
                  label="Yangi mijoz"
                  className="justify-center px-3"
                />
              </div>
            </SheetTrigger>
          <SheetContent className="overflow-y-auto bg-[#07131d] px-5">
            <SheetHeader>
              <SheetTitle className="text-white">Lead qo'shish</SheetTitle>
              <SheetDescription className="sr-only">
                Yangi lead qo'shish formasi.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setAiDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-[#2a4868] bg-[#11263a] px-3 py-3 text-xs text-gray-200 transition-colors hover:bg-[#1a3552] hover:text-white"
              >
                <Sparkles size={14} className="text-cyan-300" />
                AI yordamida to'ldirish
              </button>
            </div>
            <form className="mt-4 w-full text-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Ism *</FieldLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ism"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Familiya</FieldLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Familiya"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Telefon *</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={formatPhoneDisplay(formData.phone)}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Qo'shimcha</FieldLabel>
                    <Input
                      type="tel"
                      name="extraPhone"
                      value={formatPhoneDisplay(formData.extraPhone)}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Tug'ilgan sana</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={maxBirthDate}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 border-[#2a4868] bg-[#11263a] text-white hover:bg-[#1a3552]"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, birthDate: "" }))
                      }
                      disabled={!formData.birthDate}
                    >
                      Sanani tozalash
                    </Button>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    18 yoshdan katta (max: {maxBirthDate.slice(0, 4)}-yil)
                  </p>
                </Field>
                <Field>
                  <FieldLabel>Manzil</FieldLabel>
                  <Input
                    name="adress"
                    value={formData.adress}
                    onChange={handleChange}
                    placeholder="Manzil"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Budjet</FieldLabel>
                    <Input
                      type="text"
                      inputMode="numeric"
                      name="budjet"
                      value={formatBudgetDisplay(formData.budjet)}
                      onChange={handleChange}
                      placeholder="120 000 000"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Manba</FieldLabel>
                    <Select
                      value={
                        formData.leadSourceId ? String(formData.leadSourceId) : ""
                      }
                      onValueChange={(v) =>
                        setFormData((p) => ({
                          ...p,
                          leadSourceId: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="mt-10">
                        {leadSource.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Teg</FieldLabel>
                  <div className="flex flex-col gap-1.5">
                    {formData.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Input
                          value={tag}
                          onChange={(e) => {
                            const next = [...formData.tags];
                            next[idx] = e.target.value;
                            setFormData((p) => ({ ...p, tags: next }));
                          }}
                          placeholder="VIP, comfort..."
                          className="flex-1"
                        />
                        {formData.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                tags: p.tags.filter((_, i) => i !== idx),
                              }))
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-800/40 text-red-400 hover:bg-red-900/20"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, tags: [...p.tags, ""] }))
                      }
                      className="flex items-center gap-1 self-start rounded-md border border-dashed border-[#2a4868] px-2.5 py-1 text-xs text-gray-400 hover:border-blue-500/50 hover:text-white"
                    >
                      <Plus size={11} />
                      Teg qo'shish
                    </button>
                  </div>
                </Field>
                <Field orientation="horizontal" className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#2a4868] bg-[#11263a] text-white hover:bg-[#1a3552]"
                    onClick={closeLeadSheet}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    className="border bg-[#07131d]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Saqlash"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            <Dialog
              open={aiDialogOpen}
              onOpenChange={(open) => {
                setAiDialogOpen(open);
                if (!open) resetAiAudioState();
              }}
            >
              <DialogContent
                aria-describedby="ai-audio-dialog-description"
                className="border-[#21435b] bg-[#0f2236] text-white sm:max-w-2xl"
              >
                <DialogHeader>
                  <DialogTitle>AI audio yordamchisi</DialogTitle>
                  {/* Sabab: Radix `DialogContent` accessibility uchun description kutadi.
                      Oldin `aria-describedby={undefined}` turgani uchun warning chiqayotgan edi.
                      Endi `DialogDescription` id bilan aniq bog'landi. */}
                  <DialogDescription
                    id="ai-audio-dialog-description"
                    className="sr-only"
                  >
                    Audio yozib, AI yordamida lead formasini to'ldirish oynasi.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-200">
                      1. Audio yozib oling
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                      2. AI tahlil qiladi va serverga yuboradi
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                      3. Forma avtomatik to'ldiriladi
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-black">
                    <VoiceVisualizer
                      controls={recorderControls}
                      isDownloadAudioButtonShown={false}
                    />
                    {recordedBlob && (
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={handleProcessAiAudio}
                          disabled={
                            aiProcessing ||
                            isRecordingInProgress ||
                            isProcessingRecordedAudio
                          }
                          className="inline-flex min-w-40 items-center justify-center rounded-full bg-[#d8d0c4] px-6 py-3 text-base font-medium text-[#1f2f45] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {aiProcessing ? "Yuborilmoqda..." : "Yuborish"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-[#0b1a29] p-4">
                      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                        Muhim ma'lumotlar
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-gray-400">
                        <div className="flex items-center justify-between gap-3">
                          <span>Ism</span>
                          <span>—</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Familiya</span>
                          <span>—</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Telefon</span>
                          <span>—</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Manba</span>
                          <span>—</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#0b1a29] p-4">
                      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                        Qoshimcha ma'lumotlar
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-gray-200">
                        <p>
                          <span className="text-gray-400">Qo'shimcha raqam:</span>{" "}
                          {aiDraft.lastName || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Tug'ilgan yil:</span>{" "}
                          <span>—</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Budjet:</span>{" "}
                          {aiDraft.phone || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Manzil:</span>{" "}
                          {aiDraft.adress || "—"}
                        </p>
                        <p>
                          <span className="text-gray-400">Teg:</span>{" "}
                          {aiDraft.source || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

import {
  AlertCircle,
  CheckCheck,
  Clock,
  FileText,
  Loader2,
  Plus,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "./StatCard";
import TemplateCard from "./TemplateCard";

export default function SmsRightPanel({
  stats,
  canManageTemplates,
  openCreateTemplate,
  templateSearch,
  setTemplateSearch,
  templatePermissionDenied,
  filteredTemplates,
  activeTemplateId,
  canDeleteTemplates,
  applyTemplate,
  openEditTemplate,
  removeTemplate,
  duplicateTemplate,
  deletingTemplateId,
  message,
  personalizedPreview,
  selectionCount,
  smsCount,
  estimatedMessages,
  resolveTemplateContent,
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
          Statistika
        </p>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard icon={Send} label="Jami" value={stats?.total ?? 0} color="#3b82f6" />
          <StatCard icon={CheckCheck} label="Yuborildi" value={stats?.sent ?? 0} color="#10b981" />
          <StatCard icon={Clock} label="Kutilmoqda" value={stats?.pending ?? 0} color="#f59e0b" />
          <StatCard icon={XCircle} label="Xato" value={stats?.failed ?? 0} color="#ef4444" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Template
              </p>
              <p className="mt-1 text-sm font-semibold text-white">SMS shablonlari</p>
            </div>
            {canManageTemplates ? (
              <Button size="sm" variant="outline" onClick={openCreateTemplate}>
                <Plus />
                Qo'shish
              </Button>
            ) : null}
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <Search size={14} className="text-white/25" />
            <input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Template qidirish..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/22"
            />
          </div>

          {templatePermissionDenied ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] px-6 text-center">
              <AlertCircle size={26} className="text-amber-300/80" />
              <p className="mt-3 text-sm text-white/70">
                Template bo'limiga kirish uchun ruxsat yetarli emas
              </p>
              <p className="mt-1 text-xs text-white/40">
                Template yaratish va tahrirlash faqat ruxsatli rollarga ochiq.
              </p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] text-center">
              <FileText size={26} className="text-white/15" />
              <p className="mt-3 text-sm text-white/40">Template topilmadi</p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div key={template?.id || template?.name} className="relative">
                  <TemplateCard
                    template={template}
                    active={activeTemplateId === template?.id}
                    canManage={canManageTemplates}
                    canDelete={canDeleteTemplates}
                    onUse={applyTemplate}
                    onEdit={openEditTemplate}
                    onDelete={removeTemplate}
                    onDuplicate={duplicateTemplate}
                    resolveTemplateContent={resolveTemplateContent}
                  />
                  {deletingTemplateId === template?.id ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#08131e]/70">
                      <Loader2 className="animate-spin text-white" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
            SMS ko'rinishi
          </p>

          <div className="mx-auto w-[250px] rounded-[34px] border-4 border-white/10 bg-[#081726] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
            <div className="mb-4 flex justify-center">
              <div className="h-1.5 w-20 rounded-full bg-white/10" />
            </div>

            <div className="rounded-[24px] bg-[#071828] p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold">
                  P
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">ProHome</p>
                  <p className="text-[9px] text-white/35">SMS</p>
                </div>
              </div>

              {message.trim() ? (
                <div className="rounded-[18px] rounded-tl-sm bg-[#2563eb] px-3.5 py-2.5 text-xs leading-6 text-white">
                  {personalizedPreview}
                </div>
              ) : (
                <div className="py-8 text-center text-[11px] text-white/30">
                  Xabar matni kiritilganda preview shu yerda ko'rinadi
                </div>
              )}

              <div className="mt-2 text-right text-[9px] text-white/25">
                {new Date().toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <div className="h-1 w-24 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/65">
            <div className="mb-2 flex items-center justify-between">
              <span>Qabulchilar</span>
              <span className="font-semibold text-white">{selectionCount} ta</span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span>Bir qabulchiga</span>
              <span className="font-semibold text-white">{smsCount} SMS</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Jami taxmin</span>
              <span className="font-semibold text-white">{estimatedMessages} SMS</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                Template tokenlari preview'da tanlangan birinchi mijoz bilan ko'rsatiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

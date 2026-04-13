import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import TaskDatePicker from "@/components/lead-details/TaskDatePicker";

export default function InputBar({
  onSubmit,
  sending,
  INPUT_TYPES,
  parseTaskDateValue,
  pad2,
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState(INPUT_TYPES[0]);
  const [taskDate, setTaskDate] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  }, [text]);

  const handleTypeChange = (t) => {
    setType(t);
    if (t.value !== "tasks") setTaskDate("");
  };

  const submit = () => {
    if (!text.trim() || sending) return;
    onSubmit(text.trim(), type.value, taskDate || null);
    setText("");
    setTaskDate("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const TypeIcon = type.icon;
  const isTask = type.value === "tasks";

  return (
    <div
      className="sticky bottom-0 z-10 border-t px-5 py-4"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(to top, #071828 70%, rgba(7,24,40,0.88))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto max-w-3xl space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            {INPUT_TYPES.map((t) => {
              const TIcon = t.icon;
              const active = type.value === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all"
                  style={{
                    color: active ? t.color : "#4b5563",
                    background: active ? `${t.color}12` : "transparent",
                    border: `1px solid ${active ? `${t.color}25` : "transparent"}`,
                  }}
                >
                  <TIcon size={12} />
                  {t.label}
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: t.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {isTask && (
            <TaskDatePicker
              value={taskDate}
              onChange={setTaskDate}
              parseTaskDateValue={parseTaskDateValue}
              pad2={pad2}
            />
          )}
          <span className="ml-auto text-[11px] text-gray-700">Ctrl+Enter</span>
        </div>

        <div className="flex items-end gap-2.5">
          <div
            className="flex flex-1 items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200"
            style={{
              background: "#0c1e2e",
              border: `1px solid ${text ? `${type.color}30` : "rgba(255,255,255,0.06)"}`,
              boxShadow: text ? `0 0 0 3px ${type.color}08` : "none",
            }}
          >
            <TypeIcon
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: text ? type.color : "#374151" }}
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
              placeholder={type.placeholder}
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              style={{ lineHeight: "1.6", maxHeight: 130 }}
            />
          </div>
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background: text.trim()
                ? `linear-gradient(135deg, ${type.color}, ${type.color}88)`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${text.trim() ? `${type.color}35` : "rgba(255,255,255,0.05)"}`,
              boxShadow: text.trim() ? `0 4px 16px ${type.color}35` : "none",
            }}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <span>Yuborish</span>
                <SendHorizonal size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

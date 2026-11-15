import { Icon } from "@/components/ui/icon";

export interface UiMessage {
  role: "user" | "assistant";
  content: string;
  source?: "ai" | "rules";
  cached?: boolean;
  followUps?: string[];
}

export function MessageBubble({ message, onFollowUp }: { message: UiMessage; onFollowUp: (q: string) => void }) {
  if (message.role === "user") {
    return (
      <li className="ml-10 self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-brand-ink">{message.content}</li>
    );
  }
  return (
    <li className="mr-6 space-y-2">
      <div className="rounded-2xl rounded-bl-md border-[1.5px] border-line bg-surface-2 px-4 py-3 leading-relaxed">
        {message.content}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Icon name={message.source === "ai" ? "shield" : "info"} size={13} />
        {message.source === "ai"
          ? `Checked against GeoFarmer data${message.cached ? " · cached" : ""}`
          : "Rules-based answer"}
      </p>
      {message.followUps && message.followUps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.followUps.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onFollowUp(q)}
              className="rounded-full border-[1.5px] border-brand px-3 py-1 text-left text-sm font-semibold text-brand hover:bg-brand-soft"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

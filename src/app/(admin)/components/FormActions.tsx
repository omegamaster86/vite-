import type { ReactNode } from "react";
import type { SaveSurveyDraftState } from "@/types";

type FormActionsProps = {
  pending: boolean;
  state: SaveSurveyDraftState;
  secondaryAction?: ReactNode;
};

export function FormActions({
  pending,
  state,
  secondaryAction,
}: FormActionsProps) {
  const primaryButton = (
    <button
      type="submit"
      disabled={pending}
      className="w-[240px] h-10 px-6 rounded-[2px] bg-[#255ABA] text-white font-bold cursor-pointer disabled:opacity-50"
    >
      {pending ? "アップロード中..." : "保存する"}
    </button>
  );

  return (
    <>
      {secondaryAction ? (
        <div className="flex gap-6">
          {primaryButton}
          {secondaryAction}
        </div>
      ) : (
        primaryButton
      )}
      {state.success && state.messages.length > 0 ? (
        <p className="text-xs]">{state.messages[0]}</p>
      ) : !state.success && state.messages.length > 0 ? (
        <ul className="text-red-600 list-disc pl-4">
          {state.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

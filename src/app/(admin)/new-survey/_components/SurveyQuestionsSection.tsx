/**
 * アンケート作成/編集フォームの「設問」セクションを表示するコンポーネント。
 *
 * - 設問（質問文・必須フラグ・回答形式）をローカル state で管理し、編集 UI を描画
 * - 現在の設問一覧を `questionsJson` として JSON 文字列化し、hidden input に載せてフォーム送信できるようにする
 * - `pending` に応じて入力/操作を無効化する
 *
 * 設問の永続化や送信後の処理は親（フォーム/Action）側が担い、本コンポーネントは UI と state 管理に責務を限定します。
 */

import Image from "next/image";
import { useMemo, useState } from "react";
import type { QuestionDraft, SurveyQuestionsSectionProps } from "@/types";
import { cn } from "@/utils/class-name";

function createDefaultOptions(): string[] {
  return ["", ""];
}

function createQuestionId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `q-${uuid}`;
  return `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SurveyQuestionsSection({
  pending,
  initialQuestions,
}: SurveyQuestionsSectionProps) {
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q) => ({
        id: q.id,
        required: q.required,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        pageBreakAfter: q.pageBreakAfter,
      }));
    }
    return [
      {
        id: "q1",
        required: true,
        questionText: "",
        type: "text",
        options: [],
        pageBreakAfter: false,
      },
    ];
  });

  const questionsForSubmit = useMemo(() => {
    let currentPageNumber = 1;

    return questions.map((q) => {
      const item = {
        id: q.id,
        required: q.required,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        pageNumber: currentPageNumber,
      };

      if (q.pageBreakAfter) currentPageNumber += 1;
      return item;
    });
  }, [questions]);

  const questionsJson = useMemo(
    () => JSON.stringify(questionsForSubmit),
    [questionsForSubmit],
  );

  return (
    <div className="pr-16">
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 bg-[#255ABA] rounded-[2px]" />
        <p className="text-[16px] font-bold text-[#255ABA]">設問</p>
      </div>

      <input type="hidden" name="questionsJson" value={questionsJson} />

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <div className="relative bg-white rounded-[12px] p-8 border border-[#E1E1E1]">
              <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    aria-label={`設問を追加（Q${idx + 1}の次）`}
                    onClick={() => {
                      const next = [...questions];
                      const insertIndex = idx + 1;
                      const newQuestion: QuestionDraft = {
                        id: createQuestionId(),
                        required: true,
                        questionText: "",
                        type: "text",
                        options: [],
                        pageBreakAfter: false,
                      };
                      next.splice(insertIndex, 0, newQuestion);
                      setQuestions(next);
                    }}
                    disabled={pending}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center cursor-pointer",
                      pending ? "cursor-not-allowed opacity-60" : null,
                    )}
                  >
                    <Image
                      src="/icons/question_action_plus.svg"
                      alt=""
                      width={32}
                      height={32}
                    />
                  </button>

                  <button
                    type="button"
                    aria-label={`設問を削除（Q${idx + 1}）`}
                    onClick={() => {
                      if (questions.length <= 1) return;
                      const next = questions.filter((_, i) => i !== idx);
                      setQuestions(next);
                    }}
                    disabled={pending || questions.length <= 1}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center cursor-pointer",
                      pending || questions.length <= 1
                        ? "cursor-not-allowed opacity-40"
                        : null,
                    )}
                  >
                    <Image
                      src="/icons/question_action_minus.svg"
                      alt=""
                      width={32}
                      height={32}
                    />
                  </button>

                  <button
                    type="button"
                    aria-label={`改ページを追加（Q${idx + 1}の後）`}
                    onClick={() => {
                      if (questions[idx].pageBreakAfter) return;
                      const next = [...questions];
                      next[idx] = {
                        ...next[idx],
                        pageBreakAfter: true,
                      };
                      setQuestions(next);
                    }}
                    disabled={pending}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center cursor-pointer",
                      pending ? "cursor-not-allowed opacity-60" : null,
                    )}
                  >
                    <Image
                      src="/icons/question_action_minus_or_plus.svg"
                      alt=""
                      width={32}
                      height={32}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-[20px] leading-[1.08] font-bold">
                  Q{idx + 1}
                </p>

                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium">必須</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={q.required}
                    aria-label={`必須切り替え（Q${idx + 1}）`}
                    onClick={() => {
                      const next = [...questions];
                      next[idx] = { ...next[idx], required: !q.required };
                      setQuestions(next);
                    }}
                    disabled={pending}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full p-[2px] transition-colors cursor-pointer",
                      q.required ? "bg-[#F24A17]" : "bg-[#EAEAEA]",
                      pending ? "cursor-not-allowed opacity-60" : null,
                    )}
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full bg-white transition-transform",
                        "shadow-[0px_1.4285715px_1.4285715px_0px_rgba(0,0,0,0.05)]",
                        q.required ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`question-text-${q.id}`}
                      className="text-[14px] font-bold"
                    >
                      質問内容
                    </label>
                    <textarea
                      id={`question-text-${q.id}`}
                      value={q.questionText}
                      onChange={(e) => {
                        const next = [...questions];
                        next[idx] = {
                          ...next[idx],
                          questionText: e.target.value,
                        };
                        setQuestions(next);
                      }}
                      placeholder="入力してください"
                      className="min-h-[96px] p-3 rounded-[4px] border border-[#E1E1E1] text-[14px] resize-y"
                      disabled={pending}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-bold">回答形式</p>

                    <div className="flex flex-wrap gap-4 text-[14px]">
                      {(
                        [
                          {
                            key: "text",
                            label: "記述式",
                            iconSrc: "/icons/answer_type_text.svg",
                          },
                          {
                            key: "radio",
                            label: "ラジオボタン",
                            iconSrc: "/icons/answer_type_radio.svg",
                          },
                          {
                            key: "select",
                            label: "プルダウン",
                            iconSrc: "/icons/answer_type_select.svg",
                          },
                          {
                            key: "checkbox",
                            label: "チェックボックス",
                            iconSrc: "/icons/answer_type_checkbox.svg",
                          },
                        ] as const
                      ).map((t) => (
                        <label
                          key={t.key}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-type-${q.id}`}
                            checked={q.type === t.key}
                            onChange={() => {
                              const next = [...questions];
                              const nextOptions =
                                t.key === "text"
                                  ? []
                                  : next[idx].options.length > 0
                                    ? next[idx].options
                                    : createDefaultOptions();
                              next[idx] = {
                                ...next[idx],
                                type: t.key,
                                options: nextOptions,
                              };
                              setQuestions(next);
                            }}
                            disabled={pending}
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {q.type !== "text" && (
                    <div className="rounded-[3px] bg-[#F7F7F7] p-4">
                      <p className="text-[14px] font-medium">選択肢</p>
                      <div className="mt-3 flex flex-col gap-3">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={`${q.id}-opt-${optIdx}`}
                            className="flex items-center gap-2"
                          >
                            <p className="w-5 text-[14px]">{optIdx + 1}</p>
                            <div className="relative flex-1">
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const next = [...questions];
                                  const options = [...next[idx].options];
                                  options[optIdx] = e.target.value;
                                  next[idx] = { ...next[idx], options };
                                  setQuestions(next);
                                }}
                                placeholder="入力してください"
                                className="w-full h-12 px-3 pr-10 rounded-[4px] border border-[#E1E1E1] bg-white text-[14px]"
                                disabled={pending}
                              />
                              <button
                                type="button"
                                aria-label={`選択肢を削除（Q${idx + 1} ${optIdx + 1}）`}
                                onClick={() => {
                                  if (q.options.length <= 1) return;
                                  const next = [...questions];
                                  const options = next[idx].options.filter(
                                    (_, i) => i !== optIdx,
                                  );
                                  next[idx] = { ...next[idx], options };
                                  setQuestions(next);
                                }}
                                disabled={pending || q.options.length <= 1}
                                className={cn(
                                  "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer",
                                  pending || q.options.length <= 1
                                    ? "cursor-not-allowed opacity-40"
                                    : null,
                                )}
                              >
                                <Image
                                  src="/close.svg"
                                  alt="close"
                                  width={16}
                                  height={16}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = [...questions];
                          next[idx] = {
                            ...next[idx],
                            options: [...next[idx].options, ""],
                          };
                          setQuestions(next);
                        }}
                        disabled={pending}
                        className={cn(
                          "mt-3 inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#255ABA] bg-white px-4 text-[14px] font-bold text-[#255ABA] cursor-pointer",
                          pending ? "cursor-not-allowed opacity-60" : null,
                        )}
                      >
                        <Image
                          src="/add_blue.svg"
                          alt="add"
                          width={16}
                          height={16}
                        />
                        選択肢を追加
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {q.pageBreakAfter ? (
              <div className="relative mt-4">
                <div className="flex items-center gap-3">
                  <div className="h-0.5 flex-1 rounded-full bg-[#255ABA]" />
                  <p className="text-[16px] font-bold text-[#255ABA]">
                    {questionsForSubmit[idx].pageNumber + 1}ページ目
                  </p>
                  <div className="h-0.5 flex-1 rounded-full bg-[#255ABA]" />
                </div>

                <button
                  type="button"
                  aria-label={`表示ページ指定をリセット（Q${idx + 1}）`}
                  onClick={() => {
                    const next = [...questions];
                    next[idx] = { ...next[idx], pageBreakAfter: false };
                    setQuestions(next);
                  }}
                  disabled={pending}
                  className={cn(
                    "absolute -right-13 top-1/2 -translate-y-1/2",
                    "inline-flex h-10 w-10 items-center justify-center bg-white cursor-pointer",
                    pending ? "cursor-not-allowed opacity-60" : null,
                  )}
                >
                  <Image src="/close.svg" alt="close" width={16} height={16} />
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

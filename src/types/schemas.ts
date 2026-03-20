import { z } from "zod";
import { toOptionalNumber } from "@/utils/ToOptionalNumber";
import { toOptionalString } from "@/utils/ToOptionalString";
import { toUtcIsoFromJstLocal } from "@/utils/ToUtcIsoFromJstLocal";

// APIレスポンス/入力のZodスキーマ を集約する場所

// ============================================
// Surveys 結果取得 APIレスポンススキーマ
// ============================================

export const SurveyStatusSchema = z.enum(["公開前", "公開中", "終了"]);

export const SurveyItemSchema = z.object({
  id: z.number(),
  thumbnailTitle: z.string(),
  thumbnailGradientColor: z.string(),
  thumbnailImageUrl: z.string().nullable(),
  title: z.string(),
  estimatedMinutes: z.number(),
  rewardYen: z.number(),
  deadline: z.string(),
  responseCount: z.number(),
  status: SurveyStatusSchema,
});

export const GetSurveysResultsSuccessResponseSchema = z.object({
  data: z.array(SurveyItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const GetSurveysResultsErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetSurveysResultsResponseSchema = z.union([
  GetSurveysResultsSuccessResponseSchema,
  GetSurveysResultsErrorResponseSchema,
]);

// ============================================
// Survey Results（メタ/回答一覧）APIレスポンススキーマ
// ============================================

export const SurveyResultsMetaSchema = z.object({
  id: z.number(),
  title: z.string(),
  estimatedMinutes: z.number(),
  minimumInputMinutes: z.number(),
  rewardYen: z.number(),
  deadline: z.string(),
  responseCount: z.number(),
  thumbnailImageUrl: z.string(),
  questions: z
    .array(
      z.object({
        questionNumber: z.string(),
      }),
    )
    .optional(),
});

export const GetSurveyResultsMetaSuccessResponseSchema = z.object({
  data: SurveyResultsMetaSchema.nullable(),
});

export const GetSurveyResultsMetaErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetSurveyResultsMetaResponseSchema = z.union([
  GetSurveyResultsMetaSuccessResponseSchema,
  GetSurveyResultsMetaErrorResponseSchema,
]);

export const SurveyDetailAnswerSchema = z.object({
  answerId: z.number(),
  respondentName: z.string(),
  universityName: z.string(),
  grade: z.string(),
  faculty: z.string(),
  department: z.string(),
  answeredAt: z.string(),
  answerDuration: z.number(),
  answers: z.record(z.string(), z.string()),
});

export const GetSurveyDetailAnswersSuccessResponseSchema = z.object({
  data: z.array(SurveyDetailAnswerSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const GetSurveyDetailAnswersErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetSurveyDetailAnswersResponseSchema = z.union([
  GetSurveyDetailAnswersSuccessResponseSchema,
  GetSurveyDetailAnswersErrorResponseSchema,
]);

// ============================================
// Survey Edit Detail（編集画面初期値）APIレスポンススキーマ
// ============================================

export const SurveyEditQuestionTypeSchema = z.enum([
  "text",
  "radio",
  "select",
  "checkbox",
]);

export const AllowedThumbnailExtensionsSchema = z.enum([
  "png",
  "jpg",
  "jpeg",
]);
export const AllowedThumbnailMimeTypesSchema = z.enum([
  "image/png",
  "image/jpg",
  "image/jpeg",
]);

export const SurveyEditQuestionSchema = z.object({
  id: z.string(),
  required: z.boolean(),
  questionText: z.string(),
  type: SurveyEditQuestionTypeSchema,
  options: z.array(z.string()),
  pageBreakAfter: z.boolean(),
});

export const QuestionDraftSchema = z.object({
  id: z.string().min(1),
  required: z.boolean(),
  questionText: z.string().min(1, "質問内容は必須です"),
  type: SurveyEditQuestionTypeSchema,
  options: z.array(z.string()).optional(),
  pageNumber: z.number().int().positive().optional().default(1),
});

export const SurveyEditDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  estimatedMinutes: z.number().nullable(),
  rewardYen: z.number(),
  rewardLimit: z.number().nullable(),
  timeLimitMinutes: z.number().nullable(),
  targetAudience: z.string().nullable(),
  publishAt: z.string().nullable(),
  deadline: z.string().nullable(),
  thumbnailImageUrl: z.string().nullable(),
  questions: z.array(SurveyEditQuestionSchema),
});

export const GetSurveyEditDetailSuccessResponseSchema = z.object({
  data: SurveyEditDetailSchema.nullable(),
});

export const GetSurveyEditDetailErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetSurveyEditDetailResponseSchema = z.union([
  GetSurveyEditDetailSuccessResponseSchema,
  GetSurveyEditDetailErrorResponseSchema,
]);

// ============================================
// Survey Upsert（編集保存）APIレスポンススキーマ
// ============================================

export const UpsertSurveyForAdminSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    questionnaireId: z.number(),
  }),
});

export const UpsertSurveyForAdminErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const UpsertSurveyForAdminResponseSchema = z.union([
  UpsertSurveyForAdminSuccessResponseSchema,
  UpsertSurveyForAdminErrorResponseSchema,
]);

export const SaveSurveyDraftSchema = z
  .object({
    questionnaireId: z.preprocess(
      toOptionalNumber,
      z.number().int().positive().optional(),
    ),
    title: z.string().min(1, "アンケートタイトルは必須です"),
    description: z.string().min(1, "質問内容は必須です"),
    estimatedMinutes: z.preprocess(
      toOptionalNumber,
      z
        .number({ message: "所要時間は必須です" })
        .int({ message: "所要時間は整数で入力してください" })
        .nonnegative({ message: "所要時間は0以上で入力してください" }),
    ),
    rewardYen: z.preprocess(
      toOptionalNumber,
      z
        .number({ message: "謝礼金額は必須です" })
        .int({ message: "謝礼金額は整数で入力してください" })
        .nonnegative({ message: "謝礼金額は0以上で入力してください" }),
    ),
    publishAt: z.preprocess(
      toOptionalString,
      z.string({ message: "公開日時は必須です" }).min(1, "公開日時は必須です"),
    ),
    deadline: z.preprocess(
      toOptionalString,
      z.string({ message: "締切日時は必須です" }).min(1, "締切日時は必須です"),
    ),
    targetUniversity: z.preprocess(
      toOptionalString,
      z.string({ message: "対象大学は必須です" }).min(1, "対象大学は必須です"),
    ),
    rewardLimit: z.preprocess(
      toOptionalNumber,
      z
        .number({ message: "報酬付与上限人数は必須です" })
        .int({ message: "報酬付与上限人数は整数で入力してください" })
        .nonnegative({ message: "報酬付与上限人数は0以上で入力してください" }),
    ),
    timeLimitMinutes: z.preprocess(
      toOptionalNumber,
      z
        .number({ message: "最低回答時間は必須です" })
        .int({ message: "最低回答時間は整数で入力してください" })
        .nonnegative({ message: "最低回答時間は0以上で入力してください" }),
    ),
    questions: z.array(QuestionDraftSchema).min(1, "設問は1つ以上必要です"),
  })
  .superRefine((data, ctx) => {
    const publishAt = data.publishAt;
    const deadline = data.deadline;
    if (!publishAt || !deadline) return;

    const publishAtUtc = toUtcIsoFromJstLocal(publishAt);
    const deadlineUtc = toUtcIsoFromJstLocal(deadline);
    if (!publishAtUtc || !deadlineUtc) return;
    const publishAtTime = new Date(publishAtUtc).getTime();
    const deadlineTime = new Date(deadlineUtc).getTime();
    if (Number.isNaN(publishAtTime) || Number.isNaN(deadlineTime)) return;

    if (publishAtTime >= deadlineTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishAt"],
        message: "公開日時は締切日時より前に設定してください",
      });
    }
  });

// ============================================
// Announcement Edit Detail（編集画面初期値）APIレスポンススキーマ
// ============================================

export const AnnouncementEditDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  publishAt: z.string(),
  deadline: z.string(),
});

export const GetAnnouncementEditDetailSuccessResponseSchema = z.object({
  data: AnnouncementEditDetailSchema.nullable(),
});

export const GetAnnouncementEditDetailErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetAnnouncementEditDetailResponseSchema = z.union([
  GetAnnouncementEditDetailSuccessResponseSchema,
  GetAnnouncementEditDetailErrorResponseSchema,
]);

// ============================================
// Universities 一覧取得 APIレスポンススキーマ
// ============================================

export const UniversityItemSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const GetUniversitiesSuccessResponseSchema = z.object({
  data: z.array(UniversityItemSchema),
});

export const GetUniversitiesErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetUniversitiesResponseSchema = z.union([
  GetUniversitiesSuccessResponseSchema,
  GetUniversitiesErrorResponseSchema,
]);

// ============================================
// Students 一覧取得 APIレスポンススキーマ
// ============================================

export const StudentItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  universityName: z.string(),
  academicYear: z.string(),
  facultyName: z.string(),
  departmentName: z.string(),
  surveyResponseCount: z.number(),
  estimatedMonthlyAmount: z.number(),
});

export const GetStudentsSuccessResponseSchema = z.object({
  data: z.array(StudentItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const GetStudentsErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetStudentsResponseSchema = z.union([
  GetStudentsSuccessResponseSchema,
  GetStudentsErrorResponseSchema,
]);

// ============================================
// Account Approvals 一覧取得 APIレスポンススキーマ
// ============================================

export const AccountApprovalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export const AccountApprovalItemSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  universityName: z.string(),
  grade: z.string(),
  faculty: z.string(),
  department: z.string(),
  studentNumber: z.string(),
  studentCardImageUrl: z.string(),
  appliedAt: z.string(),
  adminMemo: z.string(),
  approvalStatus: AccountApprovalStatusSchema,
});

export const GetAccountApprovalsSuccessResponseSchema = z.object({
  data: z.array(AccountApprovalItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pendingCount: z.number(),
});

export const GetAccountApprovalsErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetAccountApprovalsResponseSchema = z.union([
  GetAccountApprovalsSuccessResponseSchema,
  GetAccountApprovalsErrorResponseSchema,
]);

export const UpdateAccountApprovalStatusSuccessResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    approvalStatus: AccountApprovalStatusSchema,
    adminMemo: z.string().nullable(),
  }),
});

export const UpdateAccountApprovalStatusErrorResponseSchema = z.object({
  error: z.string(),
});

export const UpdateAccountApprovalStatusResponseSchema = z.union([
  UpdateAccountApprovalStatusSuccessResponseSchema,
  UpdateAccountApprovalStatusErrorResponseSchema,
]);

// ============================================
// 先月合計獲得金額取得 APIレスポンススキーマ
// ============================================

export const MonthlyRewardTotalSchema = z.object({
  totalAmount: z.number(),
  year: z.number(),
  month: z.number(),
});

export const GetMonthlyRewardTotalSuccessResponseSchema = z.object({
  data: MonthlyRewardTotalSchema,
});

export const GetMonthlyRewardTotalErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetMonthlyRewardTotalResponseSchema = z.union([
  GetMonthlyRewardTotalSuccessResponseSchema,
  GetMonthlyRewardTotalErrorResponseSchema,
]);

// ============================================
// Announcements 一覧取得 APIレスポンススキーマ
// ============================================

export const AnnouncementItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  detailMessage: z.string().optional(),
  target: z.string(),
  publicationDate: z.string(),
  publicationEndDate: z.string(),
});

export const GetAnnouncementsSuccessResponseSchema = z.object({
  data: z.array(AnnouncementItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const GetAnnouncementsErrorResponseSchema = z.object({
  error: z.string(),
});

export const GetAnnouncementsResponseSchema = z.union([
  GetAnnouncementsSuccessResponseSchema,
  GetAnnouncementsErrorResponseSchema,
]);

// ============================================
// Announcement Upsert（編集保存）APIレスポンススキーマ
// ============================================

export const UpsertAnnouncementForAdminSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    announcementId: z.number(),
  }),
});

export const UpsertAnnouncementForAdminErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const UpsertAnnouncementForAdminResponseSchema = z.union([
  UpsertAnnouncementForAdminSuccessResponseSchema,
  UpsertAnnouncementForAdminErrorResponseSchema,
]);

export const SaveAnnouncementDraftSchema = z
  .object({
    announcementId: z.preprocess(
      toOptionalNumber,
      z.number().int().positive().optional(),
    ),
    title: z.preprocess(
      (value) => toOptionalString(value) ?? "",
      z.string().min(1, "タイトルは必須です"),
  ),
    description: z.preprocess(
      (value) => toOptionalString(value) ?? "",
      z.string().min(1, "詳細メッセージは必須です"),
    ),
    target: z.preprocess(
      (value) => toOptionalString(value) ?? "",
      z.string().min(1, "公開対象は必須です"),
    ),
    publishAt: z.preprocess(
      toOptionalString,
      z.string().min(1, "公開日時は必須です"),
    ),
    deadline: z.preprocess(
      toOptionalString,
      z.string().min(1, "公開終了期日は必須です"),
    ),
  })
  .superRefine((data, ctx) => {
    const publishAtUtc = toUtcIsoFromJstLocal(data.publishAt);
    const deadlineUtc = toUtcIsoFromJstLocal(data.deadline);
    if (!publishAtUtc || !deadlineUtc) {
      if (!publishAtUtc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["publishAt"],
          message: "公開日時の形式が正しくありません",
        });
      }
      if (!deadlineUtc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadline"],
          message: "公開終了期日の形式が正しくありません",
        });
      }
      return;
    }
    const publishAtTime = new Date(publishAtUtc).getTime();
    const deadlineTime = new Date(deadlineUtc).getTime();
    if (Number.isNaN(publishAtTime) || Number.isNaN(deadlineTime)) return;
    if (publishAtTime >= deadlineTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishAt"],
        message: "公開日時は公開終了期日より前に設定してください",
      });
    }
  });
// Amazon Incentive API リクエスト/レスポンススキーマ
// ============================================

export const AmazonGiftCardRequestSchema = z.object({
  creationRequestId: z.string().min(1),
  partnerId: z.string().min(1),
  currencyCode: z.string().min(1),
  amount: z.string().min(1),
});

export const AmazonGiftCardExternalResponseSchema = z.string();

export const AmazonGiftCardSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.number(),
    responseText: z.string(),
    responseHeaders: z.record(z.string(), z.string()),
  }),
});

export const AmazonGiftCardErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  status: z.number().optional(),
  responseText: z.string().optional(),
  responseHeaders: z.record(z.string(), z.string()).optional(),
});

export const AmazonGiftCardResponseSchema = z.union([
  AmazonGiftCardSuccessResponseSchema,
  AmazonGiftCardErrorResponseSchema,
]);

export type AmazonGiftCardRequest = z.infer<typeof AmazonGiftCardRequestSchema>;
export type AmazonGiftCardResponse = z.infer<
  typeof AmazonGiftCardResponseSchema
>;

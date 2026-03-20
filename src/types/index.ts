// ============================================
// Firebase サービスアカウント設定
// ============================================

export type ServiceAccountConfig = {
  project_id: string;
  client_email: string;
  private_key: string;
};

export type SendFcmNotificationParams = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

// ============================================
// アカウント承認画面で使用
// ============================================

export type AccountApprovalNotificationParams = {
  title: string;
  body: string;
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AccountApprovalUser = {
  id: string;
  displayName: string;
  universityName: string;
  grade: string;
  faculty: string;
  department: string;
  studentNumber: string;
  studentCardImageUrl: string;
  appliedAt: string;
  adminMemo?: string;
  approvalStatus: ApprovalStatus;
};

export type AccountApproveContentProps = {
  users: AccountApprovalUser[];
  currentStatus: ApprovalStatus;
  currentPage: number;
  total: number;
  pageSize: number;
  pendingCount: number;
};

export type ApprovalTabsProps = {
  currentStatus: ApprovalStatus;
  pendingCount: number;
  onTabChange: (status: ApprovalStatus) => void;
};

export type ApprovalCardProps = {
  entry: AccountApprovalUser;
  memo: string;
  onMemoChange: (targetId: string, value: string) => void;
  onOpenAction: (
    entry: AccountApprovalUser,
    action: "approve" | "reject",
  ) => void;
  onOpenImage: (entry: AccountApprovalUser) => void;
};

export type ActionConfirmModalProps = {
  actionModal: {
    targetName: string;
    action: "approve" | "reject";
  };
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isProcessing: boolean;
  errorMessage?: string | null;
};

export type ImagePreviewModalProps = {
  activeImage: {
    src: string;
    name: string;
  };
  onClose: () => void;
};

export type AccountApprovePageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
};

import type { ChangeEvent, DragEvent, ReactNode, RefObject } from "react";

// ============================================
// Surveys 型情報
// ============================================

export type SurveyStatus = "公開前" | "公開中" | "終了";

export type SurveyItem = {
  id: number;
  thumbnailTitle: string;
  thumbnailGradientColor: string;
  thumbnailImageUrl: string | null;
  title: string;
  estimatedMinutes: number;
  rewardYen: number;
  deadline: string;
  responseCount: number;
  status: SurveyStatus;
};

export type ColumnConfig = {
  label: string;
  width: string;
};

export type SurveysContentProps = {
  currentPage: number;
  surveys: SurveyItem[];
  total: number;
  pageSize: number;
};

type ButtonConfig = {
  iconSrc: string;
  alt: string;
  label: string;
  actionKey: string;
  onClick?: (surveyId: number) => void;
};

export type SurveyActionButtonsProps = {
  surveyId: number;
  buttons?: ButtonConfig[];
};

export type SurveysPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

type PageSearchParams<T extends Record<string, string | undefined>> = {
  searchParams: Promise<T>;
};

type PagedContentBase = {
  currentPage: number;
  total: number;
  pageSize: number;
};

// ============================================
// survey-results 型情報
// ============================================

export type QuestionMeta = {
  questionNumber: string;
};

export type SurveyResultItem = {
  id: string;
  surveyId: string;
  name: string;
  university: string;
  academicYear: string;
  faculty: string;
  department: string;
  answerDate: string;
  answerDuration: number;
  answers: Record<string, string>;
};

export type SurveyDetails = {
  id: string;
  title: string;
  estimatedMinutes: number;
  minimumInputMinutes: number;
  rewardYen: number;
  deadline: string;
  responseCount: number;
  thumbnailImageUrl: string;
  questions: QuestionMeta[];
};

export type SurveyResultsContentProps = {
  currentPage: number;
  surveyResults: SurveyResultItem[];
  total: number;
  pageSize: number;
  questions: QuestionMeta[];
  minimumInputMinutes: number;
};

export type SurveyResultsPageProps = {
  searchParams: Promise<{
    page?: string;
    id?: string;
  }>;
};

export type SurveyInfoCardProps = {
  survey: SurveyDetails;
};

// ============================================
// new-survey 型情報
// ============================================

export type NewSurveyPageProps = PageSearchParams<{
  id?: string;
}>;

type SurveyQuestionBase = {
  id: string;
  required: boolean;
  questionText: string;
  type: QuestionType;
  options: string[];
  pageBreakAfter: boolean;
};

export type SurveyEditQuestion = SurveyQuestionBase;

export type SurveyEditDetail = {
  id: number;
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  rewardYen: number;
  rewardLimit: number | null;
  timeLimitMinutes: number | null;
  targetAudience: string | null;
  publishAt: string | null;
  deadline: string | null;
  thumbnailImageUrl: string | null;
  questions: SurveyEditQuestion[];
};

export type NewSurveyContentProps = {
  initialData: SurveyEditDetail | null;
  universities: UniversityOption[];
};

export type SurveyBasicInfoDefaultValues = {
  title: string;
  description: string;
  estimatedMinutes: string;
  rewardYen: string;
  targetUniversity: string;
  rewardLimit: string;
  timeLimitMinutes: string;
};

export type UniversityOption = {
  id: string;
  name: string;
};

export type QuestionType = "text" | "radio" | "select" | "checkbox";

export type QuestionDraft = SurveyQuestionBase;

export type SurveyQuestionsSectionProps = {
  pending: boolean;
  initialQuestions?: SurveyEditQuestion[] | null;
};

export type SaveSurveyDraftState = {
  success: boolean;
  messages: string[];
  error?: string;
  thumbnailPath?: string | null;
  fieldErrors?: {
    title?: string[];
    description?: string[];
    estimatedMinutes?: string[];
    rewardYen?: string[];
    publishAt?: string[];
    deadline?: string[];
    targetUniversity?: string[];
    target?: string[];
    rewardLimit?: string[];
    timeLimitMinutes?: string[];
    questionsJson?: string[];
    thumbnail?: string[];
  };
};

export type SurveyBasicInfoSectionProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  thumbnailPreviewUrl: string | null;
  onPickThumbnail: () => void;
  onThumbnailInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onClearThumbnail: () => void;
  uploadError: string | null;
  pending: boolean;
  universities: UniversityOption[];
  defaultValues: SurveyBasicInfoDefaultValues;
};

// ============================================
// students 型情報
// ============================================

export type StudentInfo = {
  id: string;
  name: string;
  universityName: string;
  academicYear: string;
  facultyName: string;
  departmentName: string;
  surveyResponseCount: number;
  estimatedMonthlyAmount: number;
};

export type StudentsContentProps = {
  students: StudentInfo[];
  lastMonthTotalAmount: number;
} & PagedContentBase;

export type StudentsPageProps = PageSearchParams<{
  page?: string;
}>;

export type MonthlyRewardParams = {
  year: number;
  month: number;
};

// ============================================
// components内 型情報
// ============================================

export type CreateButtonProps = {
  onClick?: () => void;
  href?: string;
  icon: string;
  label: string;
  disabled?: boolean;
};

export type BackToButtonProps = {
  href: string;
  label: string;
};

export type TableHeaderProps = ColumnConfig;

export type TableCellProps = {
  width: string;
  children: ReactNode;
  maxLines?: number;
};

export type PaginationProps = {
  total: number;
  currentPage: number;
  pageSize: number;
};

export type AdminLayoutProps = {
  children: ReactNode;
};

export type SidebarItemProps = {
  href: string;
  iconKey: string;
  label: string;
};

export type LabelValueItemProps = {
  label: string;
  value: string | number;
  valueTitle?: string;
  containerClassName?: string;
};

export type PublishSettingsSectionProps = {
  pending: boolean;
  initialPublishAt?: string | null;
  initialDeadline?: string | null;
  publishAtLabel: string;
  deadlineLabel: string;
};

export type DateTimeFieldProps = {
  id: string;
  name: string;
  label: string;
  pending: boolean;
  initialRawValue?: string;
};

export type AnnouncementPublishSettingsSectionProps = {
  pending: boolean;
  initialPublishAt?: string | null;
  initialDeadline?: string | null;
  publishAtLabel: string;
  deadlineLabel: string;
  universities: UniversityOption[];
  targetUniversityDefaultValue: string;
};

// ============================================
// announcements 型情報
// ============================================

export type AnnouncementItem = {
  id: string;
  title: string;
  detailMessage?: string;
  target: string;
  publicationDate: string;
  publicationEndDate: string;
};

export type AnnouncementsContentProps = {
  announcements: AnnouncementItem[];
} & PagedContentBase;

export type AnnouncementsPageProps = PageSearchParams<{
  page?: string;
}>;

export type AnnouncementCreateEditPageProps = PageSearchParams<{
  id?: string;
}>;

export type AnnouncementBasicInfoDefaultValues = {
  title: string;
  description: string;
};

export type AnnouncementEditDetail = {
  id: number;
  title: string;
  description: string;
  targetAudience: string;
  publishAt: string;
  deadline: string;
};

export type AnnouncementCreateEditContentProps = {
  initialData: AnnouncementEditDetail | null;
  universities: UniversityOption[];
};

export type SaveAnnouncementDraftState = {
  success: boolean;
  messages: string[];
  error?: string;
  fieldErrors?: {
    title?: string[];
    description?: string[];
    target?: string[];
    publishAt?: string[];
    deadline?: string[];
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      m_announcement: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          detail_message: string | null;
          id: number;
          lock_no: number;
          noticed_at: string | null;
          patched_at: string | null;
          patched_by: string | null;
          publication_date: string;
          publication_end_date: string;
          target_type: Database["public"]["Enums"]["target_type"] | null;
          title: string;
          university_id: number | null;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          detail_message?: string | null;
          id?: never;
          lock_no?: number;
          noticed_at?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          publication_date: string;
          publication_end_date: string;
          target_type?: Database["public"]["Enums"]["target_type"] | null;
          title: string;
          university_id?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          detail_message?: string | null;
          id?: never;
          lock_no?: number;
          noticed_at?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          publication_date?: string;
          publication_end_date?: string;
          target_type?: Database["public"]["Enums"]["target_type"] | null;
          title?: string;
          university_id?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_announcement_university_id";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "m_university";
            referencedColumns: ["id"];
          },
        ];
      };
      m_faq: {
        Row: {
          answer: string;
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          patched_at: string | null;
          patched_by: string | null;
          question: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          answer: string;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          answer?: string;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question?: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [];
      };
      m_page_question: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          is_visible: boolean;
          lock_no: number;
          page_id: number;
          patched_at: string | null;
          patched_by: string | null;
          question_id: number;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          is_visible?: boolean;
          lock_no?: number;
          page_id: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          is_visible?: boolean;
          lock_no?: number;
          page_id?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id?: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_page_question_page_id";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire_page";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_m_page_question_question_id";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire_question";
            referencedColumns: ["id"];
          },
        ];
      };
      m_question_option: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          option_text: string;
          option_value: string | null;
          patched_at: string | null;
          patched_by: string | null;
          question_id: number;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          option_text: string;
          option_value?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          option_text?: string;
          option_value?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id?: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_question_option_question_id";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire_question";
            referencedColumns: ["id"];
          },
        ];
      };
      m_questionnaire: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deadline: string;
          deleted_at: string | null;
          description: string;
          estimated_minutes: number;
          id: number;
          is_new: boolean;
          lock_no: number;
          max_respondents: number;
          minimum_input_minutes: number;
          notice_sent_at: string | null;
          patched_at: string | null;
          patched_by: string | null;
          published_at: string | null;
          reward_amount: number;
          reward_type: string;
          section_title: string;
          target_audience: string;
          thumbnail_color: string | null;
          thumbnail_image_url: string | null;
          thumbnail_type: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deadline: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_minutes: number;
          id?: never;
          is_new?: boolean;
          lock_no?: number;
          max_respondents?: number | null;
          minimum_input_minutes?: number | null;
          notice_sent_at?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          published_at?: string | null;
          reward_amount: number;
          reward_type: string;
          section_title?: string | null;
          target_audience: string;
          thumbnail_color?: string | null;
          thumbnail_image_url?: string | null;
          thumbnail_type?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deadline?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_minutes?: number;
          id?: never;
          is_new?: boolean;
          lock_no?: number;
          max_respondents?: number | null;
          minimum_input_minutes?: number | null;
          notice_sent_at?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          published_at?: string | null;
          reward_amount?: number;
          reward_type?: string;
          section_title?: string | null;
          target_audience?: string;
          thumbnail_color?: string | null;
          thumbnail_image_url?: string | null;
          thumbnail_type?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      m_questionnaire_page: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          description: string | null;
          id: number;
          lock_no: number;
          page_number: number;
          patched_at: string | null;
          patched_by: string | null;
          questionnaire_id: number;
          sort_order: number;
          title: string | null;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: never;
          lock_no?: number;
          page_number?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          questionnaire_id: number;
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: never;
          lock_no?: number;
          page_number?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          questionnaire_id?: number;
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_questionnaire_page_questionnaire_id";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire";
            referencedColumns: ["id"];
          },
        ];
      };
      m_questionnaire_question: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          is_required: boolean;
          lock_no: number;
          patched_at: string | null;
          patched_by: string | null;
          question_number: string;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          questionnaire_id: number;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          is_required?: boolean;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question_number: string;
          question_text: string;
          question_type: Database["public"]["Enums"]["question_type"];
          questionnaire_id: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          is_required?: boolean;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          question_number?: string;
          question_text?: string;
          question_type?: Database["public"]["Enums"]["question_type"];
          questionnaire_id?: number;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_questionnaire_question_questionnaire_id";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire";
            referencedColumns: ["id"];
          },
        ];
      };
      m_university: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          name: string;
          patched_at: string | null;
          patched_by: string | null;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: number;
          lock_no?: number;
          name: string;
          patched_at?: string | null;
          patched_by?: string | null;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: number;
          lock_no?: number;
          name?: string;
          patched_at?: string | null;
          patched_by?: string | null;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [];
      };
      m_user: {
        Row: {
          admin_memo: string | null;
          approval_status:
            | Database["public"]["Enums"]["approval_status"]
            | null;
          authority_type: Database["public"]["Enums"]["authority_type"];
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          department: string | null;
          display_name: string | null;
          email: string;
          faculty: string | null;
          fcm_token: string | null;
          grade: string | null;
          id: number;
          lock_no: number;
          member_id: string | null;
          patched_at: string | null;
          patched_by: string | null;
          referral_code: string | null;
          referrer_user_id: number | null;
          student_card_image_url: string | null;
          student_number: string | null;
          supabase_auth_user_id: string;
          university_id: number | null;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          admin_memo?: string | null;
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null;
          authority_type?: Database["public"]["Enums"]["authority_type"];
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          department?: string | null;
          display_name?: string | null;
          email: string;
          faculty?: string | null;
          fcm_token?: string | null;
          grade?: string | null;
          id?: never;
          lock_no?: number;
          member_id?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          referral_code?: string | null;
          referrer_user_id?: number | null;
          student_card_image_url?: string | null;
          student_number?: string | null;
          supabase_auth_user_id: string;
          university_id?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          admin_memo?: string | null;
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null;
          authority_type?: Database["public"]["Enums"]["authority_type"];
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          department?: string | null;
          display_name?: string | null;
          email?: string;
          faculty?: string | null;
          fcm_token?: string | null;
          grade?: string | null;
          id?: never;
          lock_no?: number;
          member_id?: string | null;
          patched_at?: string | null;
          patched_by?: string | null;
          referral_code?: string | null;
          referrer_user_id?: number | null;
          student_card_image_url?: string | null;
          student_number?: string | null;
          supabase_auth_user_id?: string;
          university_id?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_m_user_referrer_user_id";
            columns: ["referrer_user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_m_user_university_id";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "m_university";
            referencedColumns: ["id"];
          },
        ];
      };
      t_monthly_reward: {
        Row: {
          coupon_code: string | null;
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          month: number;
          patched_at: string | null;
          patched_by: string | null;
          reward_type: Database["public"]["Enums"]["reward_type"];
          scheduled_issue_date: string | null;
          status: Database["public"]["Enums"]["reward_status"];
          total_amount: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
          user_id: number;
          year: number;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          month: number;
          patched_at?: string | null;
          patched_by?: string | null;
          reward_type: Database["public"]["Enums"]["reward_type"];
          scheduled_issue_date?: string | null;
          status?: Database["public"]["Enums"]["reward_status"];
          total_amount?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          user_id: number;
          year: number;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          month?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          reward_type?: Database["public"]["Enums"]["reward_type"];
          scheduled_issue_date?: string | null;
          status?: Database["public"]["Enums"]["reward_status"];
          total_amount?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          user_id?: number;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "fk_t_monthly_reward_user_id";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
        ];
      };
      t_questionnaire_answer: {
        Row: {
          answer_time_seconds: number | null;
          answered_at: string;
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          patched_at: string | null;
          patched_by: string | null;
          questionnaire_id: number;
          reward_amount: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
          user_id: number;
        };
        Insert: {
          answer_time_seconds?: number | null;
          answered_at?: string;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          questionnaire_id: number;
          reward_amount: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          user_id: number;
        };
        Update: {
          answer_time_seconds?: number | null;
          answered_at?: string;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          questionnaire_id?: number;
          reward_amount?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
          user_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "fk_t_questionnaire_answer_questionnaire_id";
            columns: ["questionnaire_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_t_questionnaire_answer_user_id";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
        ];
      };
      t_questionnaire_answer_detail: {
        Row: {
          answer_id: number;
          answer_text: string | null;
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          option_id: number | null;
          patched_at: string | null;
          patched_by: string | null;
          question_id: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          answer_id: number;
          answer_text?: string | null;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: number;
          lock_no?: number;
          option_id?: number | null;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          answer_id?: number;
          answer_text?: string | null;
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: number;
          lock_no?: number;
          option_id?: number | null;
          patched_at?: string | null;
          patched_by?: string | null;
          question_id?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_t_questionnaire_answer_detail_answer_id";
            columns: ["answer_id"];
            isOneToOne: false;
            referencedRelation: "t_questionnaire_answer";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_t_questionnaire_answer_detail_option_id";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "m_question_option";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_t_questionnaire_answer_detail_question_id";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "m_questionnaire_question";
            referencedColumns: ["id"];
          },
        ];
      };
      t_referral_campaign: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          lock_no: number;
          patched_at: string | null;
          patched_by: string | null;
          referred_user_id: number;
          sequence_no: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          referred_user_id: number;
          sequence_no?: never;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          referred_user_id?: number;
          sequence_no?: never;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_t_referral_campaign_referred_user_id";
            columns: ["referred_user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
        ];
      };
      t_user_referral: {
        Row: {
          created_at: string;
          created_by: string | null;
          created_program: string | null;
          deleted_at: string | null;
          id: number;
          lock_no: number;
          patched_at: string | null;
          patched_by: string | null;
          referred_user_id: number;
          referrer_user_id: number;
          updated_at: string;
          updated_by: string | null;
          updated_program: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          referred_user_id: number;
          referrer_user_id: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          created_program?: string | null;
          deleted_at?: string | null;
          id?: never;
          lock_no?: number;
          patched_at?: string | null;
          patched_by?: string | null;
          referred_user_id?: number;
          referrer_user_id?: number;
          updated_at?: string;
          updated_by?: string | null;
          updated_program?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_t_user_referral_referrer_user_id";
            columns: ["referrer_user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_t_user_referral_referred_user_id";
            columns: ["referred_user_id"];
            isOneToOne: false;
            referencedRelation: "m_user";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      sel_announcement_notification_targets: {
        Args: {
          target_type: Database["public"]["Enums"]["target_type"];
          target_university_id: number;
        };
        Returns: {
          fcm_token: string;
          user_id: number;
        }[];
      };
      sel_announcements_for_admin: {
        Args: {
          target_limit: number;
          target_offset: number;
        };
        Returns: {
          detail_message: string;
          id: number;
          publication_date: string;
          publication_end_date: string;
          target: string;
          title: string;
        }[];
      };
      sel_announcements_page_count_for_admin: {
        Args: never;
        Returns: number;
      };
      sel_announcements_to_notify: {
        Args: {
          target_now: string;
        };
        Returns: {
          announcement_id: number;
          detail_message: string | null;
          publication_date: string;
          target_type: Database["public"]["Enums"]["target_type"] | null;
          title: string;
          university_id: number | null;
        }[];
      };
      sel_questionnaire_notification_targets: {
        Args: never;
        Returns: {
          fcm_token: string;
          user_id: number;
        }[];
      };
      sel_questionnaires_to_notify: {
        Args: {
          target_now: string;
        };
        Returns: {
          notice_count: number;
        }[];
      };
      sel_survey_detail_answers_for_admin: {
        Args: {
          target_questionnaire_id: number;
          target_limit: number;
          target_offset: number;
        };
        Returns: {
          answer_id: number;
          answered_at: string;
          answers: Json;
          department: string;
          faculty: string;
          grade: string;
          respondent_name: string;
          university_name: string;
        }[];
      };
      sel_survey_detail_answers_page_count_for_admin: {
        Args: {
          target_questionnaire_id: number;
        };
        Returns: number;
      };
      sel_students_for_admin: {
        Args: {
          target_limit: number;
          target_offset: number;
        };
        Returns: {
          academic_year: string;
          department_name: string;
          estimated_monthly_amount: number;
          faculty_name: string;
          id: number;
          name: string;
          survey_response_count: number;
          university_name: string;
        }[];
      };
      sel_students_page_count_for_admin: {
        Args: never;
        Returns: number;
      };
      sel_surveys_results_for_admin: {
        Args: {
          target_now: string;
          target_limit: number;
          target_offset: number;
        };
        Returns: {
          deadline: string;
          estimated_minutes: number;
          id: number;
          response_count: number;
          reward_yen: number;
          status: string;
          thumbnail_gradient_color: string;
          thumbnail_title: string;
          title: string;
        }[];
      };
      sel_surveys_results_page_count_for_admin: {
        Args: never;
        Returns: number;
      };
      ins_questionnaire_for_admin: {
        Args: {
          p_title: string;
          p_description: string | null;
          p_estimated_minutes: number | null;
          p_reward_amount: number | null;
          p_publish_at: string | null;
          p_deadline: string | null;
          p_target_audience: string | null;
          p_max_respondents: number | null;
          p_minimum_input_minutes: number | null;
          p_thumbnail_image_url: string | null;
          p_questions: Json;
        };
        Returns: {
          success: boolean;
          questionnaire_id: number | null;
          error: string | null;
        }[];
      };
      upd_questionnaire_for_admin: {
        Args: {
          p_questionnaire_id: number;
          p_title: string;
          p_description: string | null;
          p_estimated_minutes: number | null;
          p_reward_amount: number | null;
          p_publish_at: string | null;
          p_deadline: string | null;
          p_target_audience: string | null;
          p_max_respondents: number | null;
          p_minimum_input_minutes: number | null;
          p_thumbnail_image_url: string | null;
          p_questions: Json;
        };
        Returns: {
          success: boolean;
          questionnaire_id: number | null;
          error: string | null;
        }[];
      };
      sel_questionnaire_detail: {
        Args: {
          target_date?: string;
          target_questionnaire_id: number;
          target_user_id: number;
        };
        Returns: {
          created_at: string;
          deadline: string;
          description: string;
          estimated_minutes: number;
          id: number;
          is_answered: boolean;
          is_expired: boolean;
          is_new: boolean;
          pages: Json;
          questions: Json;
          reward_amount: number;
          reward_type: string;
          section_title: string;
          target_audience: string;
          thumbnail_color: string;
          thumbnail_image_url: string;
          thumbnail_type: string;
          title: string;
          url: string;
        }[];
      };
      sel_questionnaires_for_user: {
        Args: {
          page_number?: number;
          page_size?: number;
          target_date?: string;
          target_user_id: number;
        };
        Returns: {
          created_at: string;
          deadline: string;
          estimated_minutes: number;
          id: number;
          is_answered: boolean;
          is_new: boolean;
          reward_amount: number;
          reward_type: string;
          target_audience: string;
          thumbnail_color: string;
          thumbnail_image_url: string;
          thumbnail_type: string;
          title: string;
          total_count: number;
          url: string;
        }[];
      };
      sel_surveys_for_user: {
        Args: {
          page_number?: number;
          page_size?: number;
          target_date?: string;
          target_user_id: number;
        };
        Returns: {
          created_at: string;
          deadline: string;
          estimated_minutes: number;
          id: number;
          is_answered: boolean;
          is_new: boolean;
          reward_amount: number;
          reward_type: string;
          target_audience: string;
          thumbnail_color: string;
          thumbnail_image_url: string;
          thumbnail_type: string;
          title: string;
          total_count: number;
          url: string;
        }[];
      };
      sel_user_authority_type_for_admin: {
        Args: { p_auth_user_id: string };
        Returns: Json;
      };
      submit_questionnaire_answer_with_reward: {
        Args: {
          p_answered_at: string;
          p_auth_user_id: string;
          p_questionnaire_id: number;
          p_user_id: number;
        };
        Returns: Database["public"]["CompositeTypes"]["submit_answer_result"];
        SetofOptions: {
          from: "*";
          to: "submit_answer_result";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      approval_status: "pending" | "approved" | "rejected";
      authority_type: "member" | "admin";
      question_type: "text" | "radio" | "dropdown" | "checkbox";
      reward_status: "aggregating" | "issued";
      reward_type: "questionnaire" | "referral";
      target_type: "all" | "university";
    };
    CompositeTypes: {
      submit_answer_result: {
        answer_id: number | null;
        reward_amount: number | null;
        monthly_reward_id: number | null;
        reward_year: number | null;
        reward_month: number | null;
        added_amount: number | null;
        new_total: number | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      authority_type: ["member", "admin"],
      question_type: ["text", "radio", "dropdown", "checkbox"],
      reward_status: ["aggregating", "issued"],
      reward_type: ["questionnaire", "referral"],
      target_type: ["all", "university"],
    },
  },
} as const;

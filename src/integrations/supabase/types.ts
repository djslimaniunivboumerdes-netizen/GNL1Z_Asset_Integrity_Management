// src/integrations/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // ─────────────────────────────────────────────────────────────
      // Existing Tables (preserved + enhanced)
      // ─────────────────────────────────────────────────────────────
      equipment: {
        Row: {
          id: string;
          tag: string;
          name: string | null;
          description: string | null;
          area: string | null;
          unit: string | null;
          section: string | null;
          status: string | null;
          design_pressure: number | null;
          test_pressure_shell: number | null;
          test_pressure_tube: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tag: string;
          name?: string | null;
          description?: string | null;
          area?: string | null;
          unit?: string | null;
          section?: string | null;
          status?: string | null;
          design_pressure?: number | null;
          test_pressure_shell?: number | null;
          test_pressure_tube?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          tag?: string;
          name?: string | null;
          description?: string | null;
          area?: string | null;
          unit?: string | null;
          section?: string | null;
          status?: string | null;
          design_pressure?: number | null;
          test_pressure_shell?: number | null;
          test_pressure_tube?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };

      maintenance_logs: {
        Row: {
          id: string;
          equipment_id: string | null;
          tag: string | null;                    // Primary identifier
          maintenance_type: string | null;
          description: string | null;
          performed_by: string | null;
          performed_at: string | null;
          created_at: string;
          technician_name: string | null;
          test_date: string | null;
          test_type: string | null;
          test_pressure_shell: number | null;
          test_pressure_tube: number | null;
          result: string | null;                 // PASS / FAIL / PENDING
          notes: string | null;
        };
        Insert: {
          id?: string;
          equipment_id?: string | null;
          tag?: string | null;
          maintenance_type?: string | null;
          description?: string | null;
          performed_by?: string | null;
          performed_at?: string | null;
          created_at?: string;
          technician_name?: string | null;
          test_date?: string | null;
          test_type?: string | null;
          test_pressure_shell?: number | null;
          test_pressure_tube?: number | null;
          result?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          equipment_id?: string | null;
          tag?: string | null;
          maintenance_type?: string | null;
          description?: string | null;
          performed_by?: string | null;
          performed_at?: string | null;
          created_at?: string;
          technician_name?: string | null;
          test_date?: string | null;
          test_type?: string | null;
          test_pressure_shell?: number | null;
          test_pressure_tube?: number | null;
          result?: string | null;
          notes?: string | null;
        };
      };

      equipment_images: {
        Row: {
          id: string;
          tag: string;
          file_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          uploaded_by: string | null;
          uploaded_at: string;
          equipment_id: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          tag: string;
          file_path: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          uploaded_at?: string;
          equipment_id?: string | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          tag?: string;
          file_path?: string;
          file_name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          uploaded_at?: string;
          equipment_id?: string | null;
          image_url?: string | null;
        };
      };

      equipment_test_dates: {
        Row: {
          tag: string;
          last_tested: string | null;
          next_test_due: string | null;
          updated_at: string;
        };
        Insert: {
          tag: string;
          last_tested?: string | null;
          next_test_due?: string | null;
          updated_at?: string;
        };
        Update: {
          tag?: string;
          last_tested?: string | null;
          next_test_due?: string | null;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────────────────────────
      // NEW TABLE: Fast Alerts
      // ─────────────────────────────────────────────────────────────
      alerts: {
        Row: {
          id: string;
          tag: string;
          alert_type: string;           // FAILED_TEST | OVERDUE_TEST | UPCOMING_TEST | NOTE_KEYWORD
          priority: 'HIGH' | 'MEDIUM' | 'LOW';
          message: string;
          status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
          source_log_id: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tag: string;
          alert_type: string;
          priority: 'HIGH' | 'MEDIUM' | 'LOW';
          message: string;
          status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
          source_log_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          tag?: string;
          alert_type?: string;
          priority?: 'HIGH' | 'MEDIUM' | 'LOW';
          message?: string;
          status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
          source_log_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Common row types
export type Alert = Tables<'alerts'>['Row'];
export type MaintenanceLog = Tables<'maintenance_logs'>['Row'];
export type EquipmentImage = Tables<'equipment_images'>['Row'];
export type EquipmentTestDate = Tables<'equipment_test_dates'>['Row'];

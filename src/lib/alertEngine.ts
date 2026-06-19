export type AlertPriority = "HIGH" | "MEDIUM" | "LOW";

export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

export type AlertType =
  | "FAILED_TEST"
  | "OVERDUE_TEST"
  | "UPCOMING_TEST"
  | "KEYWORD_NOTE";

export interface Alert {
  id: string;
  tag: string;
  alert_type: AlertType;
  priority: AlertPriority;
  message: string;
  status: AlertStatus;
  source_log_id: string | null;
  created_at: string;
}

export interface AlertStats {
  total_open: number;
  overdue: number;
  failed_tests: number;
  upcoming_tests: number;
}

export interface AlertFilter {
  priority?: AlertPriority;
  status?: AlertStatus;
  tag?: string;
  alert_type?: AlertType;
}

export interface ScheduleItem {
  tag: string;
  last_test: string | null;
  next_due: string | null;
  days_left: number | null;
  status: ScheduleStatus;
  test_type: string | null;
}

export type ScheduleStatus = "OK" | "OVERDUE" | "DUE_SOON";

export const DEFAULT_INTERVALS = {
  psv: 365,
  preventive: 180,
  hydrostatic: 365,
} as const;

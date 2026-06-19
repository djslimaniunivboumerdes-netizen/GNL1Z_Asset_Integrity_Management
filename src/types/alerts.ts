export interface Alert {
  id: string;
  tag: string;
  type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  created_at: string;
  updated_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
}

export type AlertPriority = Alert['priority'];
export type AlertStatus = Alert['status'];

export interface AlertFilter {
  priority?: AlertPriority;
  status?: AlertStatus;
  tag?: string;
  type?: string;
}

export interface AlertStats {
  total: number;
  open: number;
  highPriority: number;
}

export type StatusLevel = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';

export interface Component {
  id: string;
  name: string;
  description: string;
  status: StatusLevel;
  lastCheckedAt?: string;
  upstream?: {
    vendor: string;
    statusUrl: string;
  };
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: StatusLevel;
  startedAt: string;
  resolvedAt?: string;
  affectedComponents: string[];
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  timestamp: string;
  status: Incident['status'];
  message: string;
}

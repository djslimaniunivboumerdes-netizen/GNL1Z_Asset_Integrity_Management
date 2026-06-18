// src/lib/alertEngine.ts
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, addDays, parseISO, isToday, subDays } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Alert = Database['public']['Tables']['alerts']['Row'];
type MaintenanceLog = Database['public']['Tables']['maintenance_logs']['Row'];

const KEYWORD_ALERTS = [
  'leak', 'leaking', 'corrosion', 'corroded', 'crack', 'cracked',
  'vibration', 'vibrating', 'failure', 'failed', 'urgent', 'critical',
  'emergency', 'safety', 'hazard', 'risk'
];

/**
 * Main function to refresh all alerts for a specific equipment tag
 */
export async function refreshAlertsForTag(tag: string): Promise<void> {
  try {
    // 1. Clear existing alerts for this tag (except manually acknowledged ones)
    await supabase
      .from('alerts')
      .delete()
      .eq('tag', tag)
      .in('status', ['OPEN', 'RESOLVED']);

    // 2. Generate new alerts from various sources
    await Promise.all([
      generateFailedTestAlerts(tag),
      generateTestScheduleAlerts(tag),
      generateKeywordAlerts(tag),
    ]);

    console.log(`✅ Alerts refreshed for tag: ${tag}`);
  } catch (error) {
    console.error(`Failed to refresh alerts for ${tag}:`, error);
  }
}

/**
 * Generate alerts from FAILED maintenance logs
 */
async function generateFailedTestAlerts(tag: string) {
  const { data: failedLogs } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('tag', tag)
    .eq('result', 'FAIL')
    .order('test_date', { ascending: false });

  if (!failedLogs?.length) return;

  const latestFail = failedLogs[0];

  await supabase.from('alerts').insert({
    tag,
    alert_type: 'FAILED_TEST',
    priority: 'HIGH',
    message: `Test FAILED on ${latestFail.test_date}. Result: ${latestFail.result}. Review required.`,
    source_log_id: latestFail.id,
    status: 'OPEN',
  });
}

/**
 * Generate alerts based on test schedule (Overdue + Due Soon)
 */
async function generateTestScheduleAlerts(tag: string) {
  const { data: testDate } = await supabase
    .from('equipment_test_dates')
    .select('*')
    .eq('tag', tag)
    .single();

  if (!testDate?.next_test_due) return;

  const nextDue = parseISO(testDate.next_test_due);
  const daysRemaining = differenceInDays(nextDue, new Date());

  if (daysRemaining < 0) {
    // OVERDUE
    await supabase.from('alerts').insert({
      tag,
      alert_type: 'OVERDUE_TEST',
      priority: 'HIGH',
      message: `Test is OVERDUE by ${Math.abs(daysRemaining)} days. Next due: ${testDate.next_test_due}`,
      status: 'OPEN',
    });
  } else if (daysRemaining <= 30) {
    // DUE SOON
    await supabase.from('alerts').insert({
      tag,
      alert_type: 'UPCOMING_TEST',
      priority: daysRemaining <= 7 ? 'HIGH' : 'MEDIUM',
      message: `Test due in ${daysRemaining} days (${testDate.next_test_due})`,
      status: 'OPEN',
    });
  }
}

/**
 * Scan equipment notes and maintenance logs for critical keywords
 */
async function generateKeywordAlerts(tag: string) {
  // Check recent maintenance logs notes
  const { data: logs } = await supabase
    .from('maintenance_logs')
    .select('id, test_date, notes')
    .eq('tag', tag)
    .not('notes', 'is', null)
    .order('test_date', { ascending: false })
    .limit(10);

  logs?.forEach(async (log) => {
    const noteText = (log.notes || '').toLowerCase();
    const foundKeyword = KEYWORD_ALERTS.find(kw => noteText.includes(kw));

    if (foundKeyword) {
      await supabase.from('alerts').insert({
        tag,
        alert_type: 'NOTE_KEYWORD',
        priority: 'HIGH',
        message: `Critical keyword "${foundKeyword}" found in maintenance notes (${log.test_date})`,
        source_log_id: log.id,
        status: 'OPEN',
      });
    }
  });
}

/**
 * Refresh ALL alerts across the entire system (for dashboard / background sync)
 */
export async function refreshAllAlerts(): Promise<void> {
  try {
    // Get all unique tags that have activity
    const { data: tags } = await supabase
      .from('maintenance_logs')
      .select('tag')
      .not('tag', 'is', null);

    const uniqueTags = [...new Set(tags?.map(t => t.tag).filter(Boolean))];

    await Promise.all(uniqueTags.map(tag => refreshAlertsForTag(tag as string)));

    console.log(`✅ Global alert refresh completed for ${uniqueTags.length} tags`);
  } catch (error) {
    console.error('Global alert refresh failed:', error);
  }
}

/**
 * Get all open alerts (for Alert Center page)
 */
export async function getOpenAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      maintenance_logs!source_log_id (
        test_date,
        result,
        notes
      )
    `)
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get alert statistics for dashboard widget
 */
export async function getAlertStats() {
  const { data: alerts } = await supabase
    .from('alerts')
    .select('priority, alert_type, status');

  const totalOpen = alerts?.filter(a => a.status === 'OPEN').length || 0;
  const highPriority = alerts?.filter(a => a.priority === 'HIGH' && a.status === 'OPEN').length || 0;
  const overdue = alerts?.filter(a => a.alert_type === 'OVERDUE_TEST').length || 0;
  const failedTests = alerts?.filter(a => a.alert_type === 'FAILED_TEST').length || 0;

  return {
    totalOpen,
    highPriority,
    overdue,
    failedTests,
    upcoming: alerts?.filter(a => a.alert_type === 'UPCOMING_TEST').length || 0,
  };
}

/**
 * Update alert status (Acknowledge / Resolve)
 */
export async function updateAlertStatus(
  alertId: string,
  status: 'ACKNOWLEDGED' | 'RESOLVED'
) {
  const { error } = await supabase
    .from('alerts')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', alertId);

  if (error) throw error;
  return true;
}

/**
 * Auto-generate alerts after a new maintenance log is created (call from form submit)
 */
export async function triggerAlertOnNewLog(log: MaintenanceLog) {
  if (log.tag) {
    await refreshAlertsForTag(log.tag);
  }
      }

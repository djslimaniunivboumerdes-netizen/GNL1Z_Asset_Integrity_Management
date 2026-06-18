// src/lib/alertEngine.ts
export async function generateAlertsForTag(tag: string) {
  // Check maintenance logs for FAIL
  const { data: failedLogs } = await supabase
    .from('maintenance_logs')
    .select('id, test_date, result, notes')
    .eq('tag', tag)
    .eq('result', 'FAIL');

  if (failedLogs?.length) {
    await supabase.from('alerts').upsert({
      tag,
      alert_type: 'FAILED_TEST',
      priority: 'HIGH',
      message: `Failed test on ${failedLogs[0].test_date}. Review immediately.`,
      source_log_id: failedLogs[0].id,
    }, { onConflict: 'tag,alert_type' });
  }

  // Due dates etc. (similar logic)
  // ... 
}

const { data: existing } = await supabase
  .from("equipment_test_dates")
  .select("tag")
  .eq("tag", tag)
  .maybeSingle();

if (existing) {
  await supabase
    .from("equipment_test_dates")
    .update({
      last_tested: format(last, "yyyy-MM-dd"),
      next_test_due: format(next, "yyyy-MM-dd"),
      updated_at: new Date().toISOString(),
    })
    .eq("tag", tag);
} else {
  await supabase
    .from("equipment_test_dates")
    .insert({
      tag,
      last_tested: format(last, "yyyy-MM-dd"),
      next_test_due: format(next, "yyyy-MM-dd"),
      updated_at: new Date().toISOString(),
    });
}

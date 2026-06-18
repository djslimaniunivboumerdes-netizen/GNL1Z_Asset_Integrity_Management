import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
// ... other UI

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).then(({ data }) => setAlerts(data || []));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-6">Fast Alerts Center</h1>
      {/* Table with sortable columns: Date, Tag, Type, Priority, Message, Status */}
      {/* Use DataTable or simple list with badges for HIGH/MEDIUM/LOW */}
    </div>
  );
}

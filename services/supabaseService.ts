
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  source: string;
}

export const logToSupabase = async (message: string, level: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
  const log: SystemLog = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    level,
    message,
    source: 'Neural_Council_Core'
  };
  
  // Simulate API Call to Supabase
  console.log('%c [SUPABASE SYNC] ', 'background: #3ecf8e; color: #000; font-weight: bold', log);
  
  // In a real app:
  // const { data, error } = await supabase.from('system_logs').insert([log]);
  return log;
};

export const syncSessionToCloud = async (topic: string, consensus: string) => {
  const payload = { topic, consensus, synced_at: new Date().toISOString() };
  console.log('%c [SUPABASE SESSION SYNC] ', 'background: #3ecf8e; color: #000; font-weight: bold', payload);
};

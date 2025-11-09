'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type LogEntry = {
  id: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: any[];
  time: number;
};

function isInTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.location.search.includes('tgWebAppPlatform') ||
      window.location.hash.includes('tgWebAppPlatform') ||
      (window as any).Telegram?.WebApp != null
    );
  } catch {
    return false;
  }
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'log'>('all');
  const idRef = useRef(0);
  const isTMA = isInTelegramMiniApp();

  // Preserve original console
  const original = useRef({
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  });

  useEffect(() => {
    if (!isTMA) return; // Only hook inside TMA

    const push = (level: LogEntry['level'], args: any[]) => {
      const id = ++idRef.current;
      setLogs(prev => {
        const next = [...prev, { id, level, message: args, time: Date.now() }];
        return next.slice(-300); // cap buffer
      });
    };

    console.log = (...args: any[]) => {
      push('log', args);
      original.current.log(...args);
    };
    console.warn = (...args: any[]) => {
      push('warn', args);
      original.current.warn(...args);
    };
    console.error = (...args: any[]) => {
      push('error', args);
      original.current.error(...args);
    };
    console.info = (...args: any[]) => {
      push('info', args);
      original.current.info(...args);
    };

    const onError = (event: ErrorEvent) => {
      push('error', [event.message, event.filename, event.lineno, event.colno]);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      push('error', ['UnhandledRejection', event.reason]);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection as any);

    // Useful domain events
    const onTokenSelected = (e: Event) => {
      const ce = e as CustomEvent;
      push('info', ['tokenSelected', ce.detail]);
    };
    window.addEventListener('tokenSelected', onTokenSelected as EventListener);

    // Navigation debug events
    const onDebugNavigation = (e: Event) => {
      const ce = e as CustomEvent;
      const { type, data } = ce.detail;
      if (type === 'flagsSet') {
        push('warn', ['🔧 NAVIGATION FLAGS SET:', data]);
        // Auto-open panel for navigation debugging
        setOpen(true);
      } else if (type === 'returnLogic') {
        push('error', ['🔧 NAVIGATION RETURN LOGIC:', data]);
        // Auto-open panel for navigation debugging
        setOpen(true);
      }
    };
    window.addEventListener('debugNavigation', onDebugNavigation as EventListener);

    return () => {
      // Restore console
      console.log = original.current.log;
      console.warn = original.current.warn;
      console.error = original.current.error;
      console.info = original.current.info;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection as any);
      window.removeEventListener('tokenSelected', onTokenSelected as EventListener);
      window.removeEventListener('debugNavigation', onDebugNavigation as EventListener);
    };
  }, [isTMA]);

  const filtered = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter(l => l.level === filter);
  }, [logs, filter]);

  if (!isTMA) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          right: 10,
          bottom: 10,
          zIndex: 9999,
          borderRadius: 8,
          padding: '6px 10px',
          background: open ? '#ff4d4f' : '#2b6cb0',
          color: '#fff',
          fontSize: 12,
          opacity: 0.9,
        }}
      >
        {open ? 'Close Debug' : 'Open Debug'}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: 10,
            right: 10,
            bottom: 50,
            height: '45%',
            zIndex: 9998,
            background: 'rgba(0,0,0,0.9)',
            color: '#d1d5db',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: 8 }}>
            <strong style={{ color: '#fff' }}>Debug</strong>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              style={{ background: '#111827', color: '#fff', borderRadius: 6, padding: '4px 6px' }}
            >
              <option value="all">all</option>
              <option value="log">log</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
            </select>
            <button
              type="button"
              onClick={() => setLogs([])}
              style={{ marginLeft: 'auto', background: '#374151', color: '#fff', borderRadius: 6, padding: '4px 6px' }}
            >
              Clear
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', fontSize: 12, padding: 8, lineHeight: 1.35 }}>
            {filtered.map(l => (
              <div key={l.id} style={{ marginBottom: 6 }}>
                <span style={{ color: '#9ca3af' }}>{new Date(l.time).toLocaleTimeString()} </span>
                <span style={{ color: l.level === 'error' ? '#f87171' : l.level === 'warn' ? '#fbbf24' : '#60a5fa' }}>
                  [{l.level}]
                </span>{' '}
                {l.message.map((m, i) => (
                  <span key={i} style={{ color: '#e5e7eb' }}>
                    {typeof m === 'string' ? m : JSON.stringify(m)}{' '}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default DebugPanel;





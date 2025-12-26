
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KarmaEntry } from '../types';

interface KarmaVisualizerProps {
  entries: KarmaEntry[];
}

const KarmaVisualizer: React.FC<KarmaVisualizerProps> = ({ entries }) => {
  const data = entries.slice(-10).map((entry, idx) => ({
    name: idx + 1,
    balance: entries.slice(0, entries.indexOf(entry) + 1).reduce((acc, curr) => acc + curr.scoreImpact, 0)
  }));

  if (data.length === 0) return null;

  return (
    <div className="w-full h-48 mt-8 glass rounded-2xl p-4 overflow-hidden">
      <h3 className="text-xs font-cinzel text-slate-400 mb-2 uppercase tracking-widest">Temporal Balance Graph</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            strokeWidth={2}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#8b5cf6' }}
            labelStyle={{ display: 'none' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KarmaVisualizer;


import React, { useEffect, useState } from 'react';
import { Agent, NeuralState } from '../types';

interface NeuralNetworkVizProps {
  agents: Agent[];
  neuralState: NeuralState | null;
}

const NeuralNetworkViz: React.FC<NeuralNetworkVizProps> = ({ agents, neuralState }) => {
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  
  useEffect(() => {
    const newPositions: { [key: string]: { x: number; y: number } } = {};
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * 2 * Math.PI - Math.PI / 2;
      newPositions[agent.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
    
    newPositions['user'] = { x: centerX, y: centerY };
    newPositions['all'] = { x: centerX, y: centerY };
    
    setPositions(newPositions);
  }, [agents]);

  const getStrokeColor = (type: string) => {
    switch (type) {
      case 'attack': return '#FF4444';
      case 'agree': return '#44FF44';
      case 'query': return '#44AAFF';
      default: return '#FFFFFF';
    }
  };

  const getStrokeWidth = (intensity: number) => Math.max(1, intensity / 10);
  
  const activeAgentPos = neuralState && positions[neuralState.speaker_id];
  const targetAgentPos = neuralState && positions[neuralState.target_id];

  return (
    <div className="w-full h-[320px] bg-black/40 rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center mb-6 shadow-inner">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      {/* Status Overlay */}
      {neuralState && (
        <div className="absolute top-6 left-6 z-10 font-mono text-[9px] pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: neuralState.sentiment_hex || '#ef4444' }}></span>
            <span className="text-zinc-600 font-black uppercase tracking-widest">TRANSMISSION:</span>
            <span className="text-white font-black tracking-widest uppercase">{neuralState.status_text}</span>
          </div>
          <div className="text-zinc-700 mt-1 font-black uppercase tracking-widest">INTENSITY: {neuralState.intensity}%</div>
        </div>
      )}

      <svg width="400" height="300" className="z-0 overflow-visible">
        <defs>
          <filter id="neural-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Neural Connections */}
        {activeAgentPos && targetAgentPos && (
          <line 
            x1={activeAgentPos.x} 
            y1={activeAgentPos.y} 
            x2={targetAgentPos.x} 
            y2={targetAgentPos.y} 
            stroke={getStrokeColor(neuralState.connection_type)}
            strokeWidth={getStrokeWidth(neuralState.intensity)}
            strokeDasharray={neuralState.connection_type === 'query' ? "5,5" : "0"}
            className="animate-pulse"
            filter="url(#neural-glow)"
            style={{ transition: 'all 0.5s ease-in-out' }}
          />
        )}

        {/* Council Nodes */}
        {agents.map((agent) => {
          const pos = positions[agent.id];
          if (!pos) return null;
          
          const isActive = neuralState?.speaker_id === agent.id;
          const isTarget = neuralState?.target_id === agent.id;

          return (
            <g key={agent.id} transform={`translate(${pos.x}, ${pos.y})`} className="transition-transform duration-500">
              {isActive && (
                <circle 
                  r="25" 
                  fill="none" 
                  stroke={neuralState.sentiment_hex || '#ef4444'} 
                  strokeWidth="1" 
                  className="animate-ping opacity-30"
                />
              )}
              
              <circle 
                r="16" 
                fill="#030712" 
                stroke={isActive ? (neuralState.sentiment_hex || '#ef4444') : (isTarget ? '#fff' : 'rgba(255,255,255,0.05)')} 
                strokeWidth={isActive ? 2 : 1}
                className="transition-all duration-300"
              />
              
              <text 
                y="4" 
                textAnchor="middle" 
                fill={isActive ? '#fff' : '#3f3f46'} 
                className="text-[8px] font-black font-mono pointer-events-none uppercase tracking-tighter"
              >
                {agent.name.substring(0, 2)}
              </text>
            </g>
          );
        })}
        
        {/* Central Core */}
        <g transform={`translate(200, 150)`}>
             <circle r="6" fill="#030712" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
             <text y="15" textAnchor="middle" fill="#18181b" className="text-[7px] font-black uppercase tracking-widest">COUNCIL_CORE</text>
        </g>
      </svg>
      
      <div className="absolute bottom-6 right-6 text-[8px] text-zinc-800 font-mono font-black uppercase tracking-[0.4em]">
        NEURAL_LINK_ACTIVE
      </div>
    </div>
  );
};

export default NeuralNetworkViz;

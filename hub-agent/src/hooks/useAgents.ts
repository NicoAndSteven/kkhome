import { useState, useCallback } from 'react';
import { CustomAgent } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { BUILTIN_PROMPTS } from '../config';

const STORAGE_KEY = 'customAgents';

// 内置 Agent：随代码发布，不写入 localStorage
const BUILTIN_AGENTS: CustomAgent[] = [
  {
    id: 'default',
    name: '工具顾问',
    description: '从 kkhome 真实工具目录里挑合适的 AI / 效率工具',
    systemPrompt: BUILTIN_PROMPTS.toolAdvisor,
    icon: 'Sparkles',
    color: '#0052d9',
    permissionMode: 'default',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'wish-writer',
    name: '许愿墙助手',
    description: '把口语化的想法整理成可执行的需求条目',
    systemPrompt: BUILTIN_PROMPTS.wishWriter,
    icon: 'FileText',
    color: '#00a870',
    permissionMode: 'default',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const BUILTIN_IDS = new Set(BUILTIN_AGENTS.map(a => a.id));

export function useAgents() {
  const [agents, setAgents] = useState<CustomAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...BUILTIN_AGENTS, ...parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }))];
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
    return BUILTIN_AGENTS;
  });

  // 保存到 localStorage（排除内置 agent）
  const saveAgents = useCallback((newAgents: CustomAgent[]) => {
    const toSave = newAgents.filter(a => !BUILTIN_IDS.has(a.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  const addAgent = useCallback((agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent: CustomAgent = {
      ...agent,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAgents(prev => {
      const updated = [...prev, newAgent];
      saveAgents(updated);
      return updated;
    });
    return newAgent;
  }, [saveAgents]);

  const updateAgent = useCallback((id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => {
    setAgents(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const deleteAgent = useCallback((id: string) => {
    if (BUILTIN_IDS.has(id)) return; // 不能删除内置 agent
    setAgents(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveAgents(updated);
      return updated;
    });
  }, [saveAgents]);

  const getAgent = useCallback((id: string) => {
    return agents.find(a => a.id === id);
  }, [agents]);

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    defaultAgent: BUILTIN_AGENTS[0],
  };
}

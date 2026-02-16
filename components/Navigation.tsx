
import React from 'react';
import { AppView } from '../types';
import { Leaf, BookOpen, Store, Plus, History, User, LogOut } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  inventory: number;
  userEmail?: string | null;
  onSignOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, inventory, userEmail, onSignOut }) => {
  const navItems = [
    { view: AppView.FOREST, icon: Leaf, label: '我的森林' },
    { view: AppView.ARCHIVE, icon: BookOpen, label: '智慧档案' },
    { view: AppView.MARKET, icon: Store, label: '共生市集' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[260px] bg-[#0d0d0d] text-[#ececec] border-r border-white/5 shadow-xl transition-all">
      {/* Top Header / New Chat Action */}
      <div className="p-3 mb-2">
        <button
          onClick={() => setView(AppView.CHAT)}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all group
            ${currentView === AppView.CHAT ? 'bg-white/10 border-white/40' : 'bg-transparent'}
          `}
        >
          <div className="bg-emerald-500/20 p-1.5 rounded-md text-emerald-400 group-hover:scale-110 transition-transform">
            <Plus size={18} />
          </div>
          <span className="text-sm font-semibold tracking-tight">开启新转化</span>
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 mt-4 px-3">
          智慧漫游
        </div>
        
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`
                w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive ? 'bg-[#2b2b2b] text-white' : 'text-white/60 hover:bg-[#2b2b2b] hover:text-white'}
              `}
            >
              <item.icon 
                size={18} 
                className={isActive ? 'text-emerald-400' : 'text-white/40 group-hover:text-white'}
              />
              {item.label}
              {isActive && <div className="ml-auto w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>
          );
        })}

        <div className="mt-8 border-t border-white/5 pt-6">
           <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-3">
            近期心迹
           </div>
           {/* Placeholder for history-like items similar to GPT sidebar */}
           <div className="px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-[#2b2b2b] hover:text-white cursor-pointer truncate flex items-center gap-3">
              <History size={14} />
              解决被经理责骂...
           </div>
           <div className="px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-[#2b2b2b] hover:text-white cursor-pointer truncate flex items-center gap-3">
              <History size={14} />
              社交焦虑重构...
           </div>
        </div>
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 mt-auto border-t border-white/5 bg-[#000000]/20">
        <div className="flex flex-col gap-1 mb-4">
           <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <span className="text-xs font-bold text-white/60">当前心力</span>
              </div>
              <span className="text-sm font-black text-emerald-400">{inventory}</span>
           </div>
        </div>

        <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg group">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
             <User size={18} />
          </div>
          <div className="flex flex-col items-start min-w-0 flex-1">
             <span className="text-sm font-semibold truncate w-full">{userEmail || "冥想行者"}</span>
             <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mt-0.5">Free Plan</span>
          </div>
          {onSignOut && (
            <button onClick={onSignOut} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white shrink-0" title="退出登录">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Navigation;

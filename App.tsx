
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Message, Tree, Wisdom, CommunityFruit, TREE_SPECIES_DB, FREE_UNLOCKED_SPECIES, TreeType, TreeRarity, EmotionTag } from './types';
import Navigation from './components/Navigation';
import TreeVisual from './components/TreeVisual';
import { createChatSession, extractWisdom, type ChatSession } from './services/deepseekService';
import { ArrowUp, Sparkles, Send, X, RefreshCw, User, Lock, ExternalLink, Leaf, Timer, Sprout, Gift, HeartHandshake, Archive, Plus, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const INITIAL_TREES: Tree[] = [
  {
    id: '1',
    wisdomId: 'w1',
    stage: 'fruiting',
    plantedAt: Date.now() - 10000000,
    stageStartedAt: Date.now() - 10000000,
    lastWatered: Date.now(),
    type: 'oak',
    speciesConfig: TREE_SPECIES_DB.oak,
    hasProduced: true
  }
];

const INITIAL_WISDOM: Wisdom[] = [
  { id: 'w1', title: "言语的重量", situation: "被经理不公平地责骂。", insight: "他人的愤怒往往反映了他们内部的状态，而非你的价值。", date: new Date().toLocaleDateString() }
];

const MOCK_COMMUNITY_FRUITS: CommunityFruit[] = [
  { id: 'cf1', author: 'ZenWalker', insight: "愤怒就像手里握着一块烧红的煤炭想扔给别人，最终烫伤的是你自己。", cost: 1 },
  { id: 'cf2', author: 'StoicGirl', insight: "我们在想象中受的苦，往往比在现实中多。", cost: 1 },
  { id: 'cf3', author: 'ForestSpirit', insight: "大自然从不匆忙，却能完成一切。", cost: 1 },
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.FOREST);
  const [trees, setTrees] = useState<Tree[]>(INITIAL_TREES);
  const [wisdomArchive, setWisdomArchive] = useState<Wisdom[]>(INITIAL_WISDOM);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWisdomModal, setShowWisdomModal] = useState(false);
  const [newWisdom, setNewWisdom] = useState<Wisdom | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wisdomCardRef = useRef<HTMLDivElement>(null);
  const [communityInventory, setCommunityInventory] = useState<CommunityFruit[]>(MOCK_COMMUNITY_FRUITS);
  const [myCollection, setMyCollection] = useState<CommunityFruit[]>([]);
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  const [inventory, setInventory] = useState(0);
  const [stats, setStats] = useState({
    collected: 0
  });

  // 树木多样性系统状态
  const [unlockedSpecies, setUnlockedSpecies] = useState<TreeType[]>(FREE_UNLOCKED_SPECIES);
  const [userHasSpeedBoost, setUserHasSpeedBoost] = useState(false); // 是否拥有加速包
  const [purchasedSpecies, setPurchasedSpecies] = useState<TreeType[]>([]); // 已购买的稀有树种

  // 树木多样性辅助函数
  const getStageDuration = (tree: Tree): number => {
    const baseDuration = 60000; // 1分钟用于演示，实际应为24小时(24 * 60 * 60 * 1000)
    const speedMultiplier = userHasSpeedBoost ? 0.5 : 1.0; // 付费用户减半
    const speciesMultiplier = tree.speciesConfig.growthMultiplier; // 树种系数

    return baseDuration * speedMultiplier * speciesMultiplier;
  };

  // 根据智慧内容推荐树种
  const getRecommendedSpecies = (wisdom: Wisdom): TreeType => {
    // 简单关键词匹配情绪标签
    const insight = wisdom.insight.toLowerCase();
    const situation = wisdom.situation.toLowerCase();

    if (insight.includes('愤怒') || situation.includes('责骂') || insight.includes('angry')) {
      return 'pine';
    }
    if (insight.includes('悲伤') || insight.includes('失去') || insight.includes('sad')) {
      return 'willow';
    }
    if (insight.includes('焦虑') || insight.includes('担心') || insight.includes('anxious')) {
      return 'maple';
    }
    if (insight.includes('压力') || insight.includes('紧张') || insight.includes('stress')) {
      return 'bamboo';
    }
    if (insight.includes('喜悦') || insight.includes('快乐') || insight.includes('joy')) {
      return 'cherry';
    }

    // 默认返回橡树
    return 'oak';
  };

  // 检查用户是否可以种植某种树种
  const canPlantSpecies = (speciesType: TreeType): boolean => {
    const speciesConfig = TREE_SPECIES_DB[speciesType];

    switch (speciesConfig.unlockCondition) {
      case 'free':
        return true;
      case 'purchase':
        return purchasedSpecies.includes(speciesType) || unlockedSpecies.includes(speciesType);
      case 'social':
        return stats.collected > 0; // 至少完成过一次交换
      default:
        return unlockedSpecies.includes(speciesType);
    }
  };

  // 创建新树的辅助函数
  const createNewTree = (wisdomId: string, speciesType?: TreeType): Tree | null => {
    const selectedType = speciesType || 'oak';
    const speciesConfig = TREE_SPECIES_DB[selectedType];

    if (!canPlantSpecies(selectedType)) {
      console.warn(`用户无法种植树种: ${selectedType}`);
      return null;
    }

    return {
      id: Date.now().toString(),
      wisdomId,
      stage: 'sapling',
      plantedAt: Date.now(),
      stageStartedAt: Date.now(),
      lastWatered: Date.now(),
      type: selectedType,
      speciesConfig,
      hasProduced: false
    };
  };

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
      setMessages([{
        id: 'init',
        role: 'model',
        text: "Hi，我在这里。无论发生什么，我都在听。",
        timestamp: Date.now()
      }]);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrees((prevTrees: Tree[]) => {
        const updatedTrees = prevTrees.map((tree: Tree) => {
          const now = Date.now();
          const lastStageTime = tree.stageStartedAt || tree.plantedAt;
          const elapsed = now - lastStageTime;
          const stageDuration = getStageDuration(tree);

          let nextStage = tree.stage;
          let shouldUpdate = false;
          let justFruited = false;

          if (tree.stage === 'sapling' && elapsed > stageDuration) {
            nextStage = 'growing';
            shouldUpdate = true;
          } else if (tree.stage === 'growing' && elapsed > stageDuration) {
            nextStage = 'mature';
            shouldUpdate = true;
          } else if (tree.stage === 'mature' && elapsed > stageDuration) {
            nextStage = 'fruiting';
            shouldUpdate = true;
            justFruited = true;
          }

          if (tree.stage === 'fruiting' && !tree.hasProduced) {
             return { ...tree, hasProduced: true };
          }

          if (shouldUpdate) {
            if (justFruited) {
              return { ...tree, stage: nextStage, stageStartedAt: now, hasProduced: true };
            }
            return { ...tree, stage: nextStage, stageStartedAt: now };
          }
          return tree;
        });
        return updatedTrees;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [userHasSpeedBoost]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setChatError(null);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "我在听。",
        timestamp: Date.now()
      };
      setMessages((prev: Message[]) => [...prev, modelMsg]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "网络异常，请稍后重试";
      setChatError(msg.includes("429") || msg.includes("请求过于频繁") ? "请求过于频繁，请稍后再试" : msg);
    } finally {
      setIsTyping(false);
    }
  };

  const endSessionAndTransform = async () => {
    setIsExtracting(true);
    setChatError(null);
    try {
      const extracted = await extractWisdom(messages);
      const newWisdomEntry: Wisdom = {
        ...extracted,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString()
      };

      // 根据智慧内容推荐树种
      const recommendedSpecies = getRecommendedSpecies(newWisdomEntry);
      const newTree = createNewTree(newWisdomEntry.id, recommendedSpecies);

      if (!newTree) {
        // 如果无法创建树（如未解锁树种），使用默认橡树
        const fallbackTree = createNewTree(newWisdomEntry.id, 'oak');
        if (fallbackTree) {
          setTrees((prev: Tree[]) => [...prev, fallbackTree]);
        }
      } else {
        setTrees((prev: Tree[]) => [...prev, newTree]);
      }

      setWisdomArchive((prev: Wisdom[]) => [newWisdomEntry, ...prev]);
      setNewWisdom(newWisdomEntry);
      
      chatSessionRef.current = createChatSession();
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: "新的开始。当你准备好时，我依然在这里。",
        timestamp: Date.now()
      }]);

      setShowWisdomModal(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "生成失败，请稍后重试";
      setChatError(msg.includes("429") || msg.includes("请求过于频繁") ? "请求过于频繁，请稍后再试" : msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const harvestFruit = (treeId: string) => {
    setTrees((prev: Tree[]) => prev.map((t: Tree) => {
      if (t.id === treeId && t.stage === 'fruiting') {
        setInventory((inv: number) => inv + 1);
        return { ...t, stage: 'mature', stageStartedAt: Date.now(), hasProduced: false };
      }
      return t;
    }));
  };

  const tradeFruit = (fruit: CommunityFruit) => {
    if (inventory >= fruit.cost) {
      setInventory((prev: number) => prev - fruit.cost);
      setMyCollection((prev: CommunityFruit[]) => [...prev, fruit]);
      setCommunityInventory((prev: CommunityFruit[]) => prev.filter((f: CommunityFruit) => f.id !== fruit.id));
      setStats((prev: { collected: number }) => ({ ...prev, collected: prev.collected + 1 }));

      // 创建友谊树 (樱花树)
      const friendshipTree = createNewTree(fruit.id, 'cherry');
      if (friendshipTree) {
        setTrees((prev: Tree[]) => [...prev, friendshipTree]);
      }
      
      // Trigger Celebration Animation
      setIsCelebrating(true);
      setTimeout(() => {
        setIsCelebrating(false);
        setView(AppView.FOREST);
      }, 2500);
    } else {
      alert("你的库存不足。请回到森林，等待树木结果并点击收集。");
    }
  };

  const downloadCard = async () => {
    if (!wisdomCardRef.current) return;
    try {
      const canvas = await html2canvas(wisdomCardRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `wisdom-card-${Date.now()}.png`;
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  // --- VIEWS ---

  const ForestView = () => (
    <div className="min-h-screen bg-[#ffffff] pb-12 pt-16 px-12 ml-[260px]">
      <header className="mb-12 fade-in">
        <h1 className="text-4xl font-extrabold text-[#111827] mb-3 leading-tight tracking-tight">
          你好，你的心灵之森。
        </h1>
        <p className="text-stone-500 font-medium text-lg">愿你在静默的生长中找到力量。</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bento Stats Group */}
        <div className="lg:col-span-1 space-y-6 fade-in">
          <div className="bg-[#E3F2E1] p-8 rounded-[2.5rem] flex flex-col justify-between h-52 bento-card shadow-sm border border-stone-100">
            <div className="bg-white/40 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-700">
              <Archive size={24} />
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-900 mb-1">{inventory}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/60">心力果实</div>
            </div>
          </div>
          <div className="bg-[#FFF9C4] p-8 rounded-[2.5rem] flex flex-col justify-between h-52 bento-card shadow-sm border border-stone-100">
            <div className="bg-white/40 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600">
              <Gift size={24} />
            </div>
            <div>
              <div className="text-4xl font-black text-amber-900 mb-1">{stats.collected}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700/60">共鸣交换</div>
            </div>
          </div>
        </div>

        {/* Forest Grid Container */}
        <div className="lg:col-span-2 bg-[#F9FAFB] rounded-[3rem] p-12 shadow-inner border border-stone-100 min-h-[500px] relative overflow-hidden fade-in delay-100">
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-4 place-items-end justify-items-center relative z-10">
            {trees.map((tree: Tree) => {
              const isFriend = tree.type === 'cherry';
              const fruit = isFriend ? myCollection.find((f: CommunityFruit) => f.id === tree.wisdomId) : null;
              const wisdom = !isFriend ? wisdomArchive.find((w: Wisdom) => w.id === tree.wisdomId) : null;
              const label = isFriend ? (fruit?.author || '友谊') : (wisdom?.title || '成长');

              return (
                <div key={tree.id} className="flex flex-col items-center group relative">
                  {tree.type === 'cherry' && (
                    <div className="absolute -top-4 bg-pink-100 text-pink-500 p-1.5 rounded-full opacity-80 animate-bounce">
                       <HeartHandshake size={14} />
                    </div>
                  )}
                  <TreeVisual 
                    tree={tree} 
                    onClick={() => {
                      if (tree.stage === 'fruiting') {
                        harvestFruit(tree.id);
                      }
                    }} 
                  />
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all text-center text-stone-400 bg-white/90 px-3 py-1.5 rounded-2xl shadow-sm border border-stone-100">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <div className="h-screen flex flex-col bg-[#ffffff] ml-[260px]">
      <div className="px-12 py-10 border-b border-stone-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
         <h2 className="text-2xl font-black text-[#111827]">心境转化</h2>
         <p className="text-stone-500 font-medium text-sm mt-1">将压力重构为向上的力量。</p>
      </div>
      
      {chatError && (
        <div className="mx-12 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-sm">
          <span>{chatError}</span>
          <button onClick={() => setChatError(null)} className="text-red-500 hover:text-red-700 p-1">
            <X size={18} />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
        {messages.map((msg: Message) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-6 rounded-[1.5rem] text-[15px] font-medium leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#111827] text-white rounded-tr-sm'
                  : 'bg-[#f9fafb] text-[#111827] rounded-tl-sm border border-stone-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-[#f9fafb] px-6 py-4 rounded-[1.2rem] rounded-tl-sm border border-stone-100 flex gap-2 shadow-sm">
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-12">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length > 2 && !isExtracting && (
             <div className="flex justify-center fade-in">
               <button 
                  onClick={endSessionAndTransform}
                  className="bg-[#D1FAE5] text-emerald-800 px-6 py-3 rounded-full hover:bg-[#A7F3D0] transition-all flex items-center gap-2 font-black shadow-lg shadow-emerald-900/5 hover:-translate-y-1 text-sm"
               >
                 <RefreshCw size={16} />
                 结束并生成智慧结晶
               </button>
             </div>
          )}
          
          <div className="relative bg-[#F9FAFB] rounded-[1.5rem] p-2 flex items-center border border-stone-200">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
              placeholder="倾诉你的压力或烦恼..."
              className="flex-1 pl-6 bg-transparent focus:outline-none text-[#111827] text-base font-medium placeholder-stone-400"
              disabled={isExtracting}
              autoFocus
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isExtracting}
              className="w-12 h-12 bg-[#111827] text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-50 transition-all shrink-0"
            >
              {isExtracting ? <RefreshCw className="animate-spin" size={20} /> : <ArrowUp size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ArchiveView = () => (
    <div className="min-h-screen bg-[#ffffff] p-16 ml-[260px]">
      <h2 className="text-4xl font-black text-[#111827] mb-12 leading-tight">智慧档案库</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {wisdomArchive.map((w: Wisdom, idx: number) => {
          const colors = ['bg-[#E1F5FE]', 'bg-[#F3E5F5]', 'bg-[#FFF9C4]', 'bg-[#E3F2E1]'];
          const bg = colors[idx % colors.length];
          
          return (
            <div key={w.id} className={`${bg} p-8 rounded-[2.5rem] bento-card shadow-sm border border-stone-100/50 relative overflow-hidden group`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-black text-xl text-[#111827]">{w.title}</h3>
                  <span className="text-[9px] font-black bg-white/60 px-2 py-1 rounded-full text-[#111827]/70 uppercase tracking-widest">{w.date}</span>
                </div>
                <div className="bg-white/40 p-5 rounded-2xl mb-6 backdrop-blur-md">
                   <p className="text-xs font-bold text-[#111827]/70 line-clamp-2 italic">情境: {w.situation}</p>
                </div>
                <p className="text-[16px] font-bold text-[#111827] leading-relaxed">
                  "{w.insight}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MarketView = () => (
    <div className="min-h-screen bg-[#ffffff] p-16 ml-[260px]">
      <header className="mb-12">
         <div className="flex justify-between items-end mb-6">
           <div>
             <h2 className="text-4xl font-black text-[#111827] leading-tight mb-2">共生花园</h2>
             <p className="text-stone-500 font-medium text-lg">交换智慧，让灵魂不再孤独。</p>
           </div>
         </div>
      </header>

      {/* My Collection Section */}
      {myCollection.length > 0 && (
        <div className="mb-12 fade-in">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6 pl-2">已解锁的共鸣</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {myCollection.map((fruit: CommunityFruit) => (
               <div key={fruit.id} className="bg-[#F9FAFB] border border-stone-100 p-6 rounded-[1.5rem] flex gap-6 shadow-sm items-center">
                  <div className="bg-pink-100 text-pink-500 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    <HeartHandshake size={24} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#111827]">"{fruit.insight}"</p>
                    <p className="text-[10px] font-black text-stone-400 mt-2 uppercase tracking-widest">— {fruit.author}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Market Cards */}
      <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6 pl-2">探寻他人的智慧</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {communityInventory.map((fruit: CommunityFruit) => {
          const canAfford = inventory >= fruit.cost;
          return (
            <div key={fruit.id} className="bg-[#F9FAFB] p-8 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col bento-card group">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111827]">
                    <User size={20} />
                 </div>
                 <div>
                    <div className="text-base font-black text-[#111827]">{fruit.author}</div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">需 {fruit.cost} 心力</div>
                 </div>
              </div>
              <div className="flex-1 bg-white/50 rounded-2xl p-8 flex items-center justify-center text-stone-300 mb-8 border border-stone-100 border-dashed">
                 <Lock size={32} />
              </div>
              <button 
                onClick={() => tradeFruit(fruit)}
                className={`w-full py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2
                  ${canAfford 
                    ? 'bg-[#111827] text-white shadow-lg hover:-translate-y-1 active:scale-95' 
                    : 'bg-[#F2F4F6] text-stone-400 cursor-not-allowed'
                  }`}
              >
                 {canAfford ? '解锁智慧果实' : '心力不足'} <ExternalLink size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#ffffff] text-[#111827]">
      <Navigation currentView={view} setView={setView} inventory={inventory} />
      
      <main className="flex-1 relative overflow-hidden">
        {view === AppView.FOREST && ForestView()}
        {view === AppView.CHAT && ChatView()}
        {view === AppView.ARCHIVE && ArchiveView()}
        {view === AppView.MARKET && MarketView()}
      </main>

      {/* Celebration Overlay */}
      {isCelebrating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-white/90 animate-[fadeOut_0.5s_ease-out_1.5s_forwards]" />
          <div className="relative z-10 flex flex-col items-center animate-[bounceIn_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
             <div className="bg-white p-6 rounded-full shadow-2xl mb-8">
               <HeartHandshake className="text-pink-500 w-16 h-16" />
             </div>
             <h2 className="text-3xl font-black text-[#111827]">共鸣达成</h2>
             <p className="text-stone-400 font-black text-sm mt-2 tracking-widest uppercase">New friendship tree planted</p>
          </div>
          <style>{`
            @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); opacity: 1; }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeOut { to { opacity: 0; } }
          `}</style>
        </div>
      )}

      {/* New Wisdom Modal */}
      {showWisdomModal && newWisdom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm fade-in">
          <div ref={wisdomCardRef} className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl relative overflow-hidden text-center border border-stone-100">
            <button 
              onClick={downloadCard}
              data-html2canvas-ignore
              className="absolute top-8 right-8 text-stone-300 hover:text-[#111827] transition-colors p-2"
            >
              <Download size={24} />
            </button>
            <div className="w-20 h-20 bg-[#D1FAE5] text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Leaf size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#111827] mb-2">{newWisdom.title}</h3>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-8">Crystal of Wisdom</p>
            <p className="text-lg font-bold text-stone-700 mb-10 leading-relaxed italic">
              "{newWisdom.insight}"
            </p>
            <button 
              onClick={() => { setShowWisdomModal(false); setView(AppView.FOREST); }}
              data-html2canvas-ignore
              className="w-full py-4 bg-[#111827] text-white rounded-2xl text-base font-black shadow-xl hover:scale-[1.02] transition-transform"
            >
              踏入森林
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

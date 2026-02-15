import React, { useState, useEffect } from 'react';
import { Tree } from '../types';

interface TreeVisualProps {
  tree: Tree;
  onClick?: () => void;
}

const TreeVisual: React.FC<TreeVisualProps> = ({ tree, onClick }) => {
  const [isCollecting, setIsCollecting] = useState(false);

  // Reset collecting state if tree stage changes (e.g., fruiting -> mature)
  useEffect(() => {
    if (tree.stage !== 'fruiting') {
      setIsCollecting(false);
    }
  }, [tree.stage]);

  const handleInteraction = (e: React.MouseEvent) => {
    if (tree.stage === 'fruiting') {
      e.stopPropagation();
      if (!isCollecting) {
        setIsCollecting(true);
        // Play animation for 600ms, then trigger the actual harvest logic (which is passed via onClick)
        setTimeout(() => {
          if (onClick) onClick();
        }, 600); 
      }
    } else {
      if (onClick) onClick();
    }
  };

  // 从树种配置获取颜色和样式
  const speciesConfig = tree.speciesConfig;
  const colors = speciesConfig.colorPalette;

  // 根据稀有度添加特殊效果
  const getRarityEffects = () => {
    switch (speciesConfig.rarity) {
      case 'rare':
        return {
          filter: 'drop-shadow(0 0 8px rgba(100, 200, 255, 0.5))',
          className: 'rare-tree'
        };
      case 'epic':
        return {
          filter: 'drop-shadow(0 0 12px rgba(200, 100, 255, 0.7))',
          className: 'epic-tree'
        };
      default:
        return {
          filter: 'none',
          className: ''
        };
    }
  };

  const rarityEffects = getRarityEffects();

  // 不同树种的SVG生成函数
  const getTreeSVG = () => {
    const commonProps = {
      viewBox: "0 0 100 100",
      key: tree.stage,
      className: `w-full h-full animate-grow animate-sway drop-shadow-sm ${rarityEffects.className}`,
      style: { filter: rarityEffects.filter }
    };

    // 基础SVG元素
    const baseElements = {
      trunk: (width: number, height: number, startY: number) => (
        <path
          d={`M50 ${startY} L50 ${height}`}
          stroke={colors.trunk}
          strokeWidth={width}
          strokeLinecap="round"
        />
      ),
      circleCanopy: (cx: number, cy: number, r: number, opacity: number = 0.9) => (
        <circle cx={cx} cy={cy} r={r} fill="currentColor" opacity={opacity} />
      ),
      roundedCanopy: (controlY: number, startY: number) => (
        <path
          d={`M50 ${startY} Q20 ${controlY} 20 40 Q20 10 50 10 Q80 10 80 40 Q80 ${controlY} 50 ${startY}`}
          fill="currentColor"
        />
      )
    };

    // 根据树种类型定制SVG
    const treeType = tree.type;

    switch (tree.stage) {
      case 'sapling':
        // 不同树种的树苗形态
        switch (treeType) {
          case 'bamboo':
            return (
              <svg {...commonProps} style={{ color: colors.sapling }}>
                <path d="M50 90 L50 60" stroke={colors.trunk} strokeWidth="5" strokeLinecap="round" />
                <rect x="45" y="50" width="10" height="20" rx="2" fill="currentColor" />
                <path d="M50 50 Q55 40 60 45" stroke="currentColor" strokeWidth="3" fill="none" />
                <path d="M50 50 Q45 40 40 45" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            );
          case 'willow':
            return (
              <svg {...commonProps} style={{ color: colors.sapling }}>
                <path d="M50 90 L50 60" stroke={colors.trunk} strokeWidth="5" strokeLinecap="round" />
                <path d="M50 60 Q40 55 45 45" stroke="currentColor" strokeWidth="4" fill="none" />
                <path d="M50 60 Q60 55 55 45" stroke="currentColor" strokeWidth="4" fill="none" />
                <circle cx="45" cy="45" r="4" fill="currentColor" />
                <circle cx="55" cy="45" r="4" fill="currentColor" />
              </svg>
            );
          default:
            // 默认橡树形态
            return (
              <svg {...commonProps} style={{ color: colors.sapling }}>
                <path d="M50 90 L50 60 Q50 30 70 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="70" cy="40" r="6" fill="currentColor" />
                <path d="M50 60 Q50 40 30 50" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <circle cx="30" cy="50" r="5" fill="currentColor" />
              </svg>
            );
        }

      case 'growing':
        switch (treeType) {
          case 'bamboo':
            return (
              <svg {...commonProps} style={{ color: colors.growing }}>
                {baseElements.trunk(6, 50, 90)}
                <g className="animate-sway" style={{ animationDuration: '2s' }}>
                  <rect x="45" y="30" width="10" height="40" rx="3" fill="currentColor" />
                  <path d="M45 30 Q40 25 45 20" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M55 30 Q60 25 55 20" stroke="currentColor" strokeWidth="2" fill="none" />
                </g>
              </svg>
            );
          case 'willow':
            return (
              <svg {...commonProps} style={{ color: colors.growing }}>
                {baseElements.trunk(8, 50, 90)}
                <g className="animate-sway" style={{ animationDuration: '3s' }}>
                  <path d="M50 40 Q30 35 35 25 Q40 15 50 15 Q60 15 65 25 Q70 35 50 40" fill="currentColor" opacity="0.8" />
                  <path d="M50 50 Q40 45 45 35" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7" />
                  <path d="M50 50 Q60 45 55 35" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7" />
                </g>
              </svg>
            );
          default:
            return (
              <svg {...commonProps} style={{ color: colors.growing }}>
                {baseElements.trunk(8, 50, 90)}
                <g className="animate-sway" style={{ animationDuration: '3s' }}>
                  {baseElements.circleCanopy(50, 40, 28)}
                  {baseElements.circleCanopy(35, 50, 18, 0.8)}
                  {baseElements.circleCanopy(65, 50, 18, 0.8)}
                </g>
              </svg>
            );
        }

      case 'mature':
        switch (treeType) {
          case 'bamboo':
            return (
              <svg {...commonProps} style={{ color: colors.mature }}>
                {baseElements.trunk(8, 40, 90)}
                <g>
                  <rect x="40" y="20" width="5" height="50" rx="2" fill="currentColor" opacity="0.9" />
                  <rect x="55" y="15" width="5" height="55" rx="2" fill="currentColor" opacity="0.8" />
                  <rect x="45" y="10" width="5" height="60" rx="2" fill="currentColor" opacity="0.7" />
                </g>
              </svg>
            );
          case 'willow':
            return (
              <svg {...commonProps} style={{ color: colors.mature }}>
                {baseElements.trunk(10, 40, 90)}
                <path d="M50 30 Q20 25 25 10 Q30 0 50 0 Q70 0 75 10 Q80 25 50 30" fill="currentColor" opacity="0.9" />
                <path d="M50 50 Q30 40 35 25" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.7" />
                <path d="M50 50 Q70 40 65 25" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.7" />
              </svg>
            );
          case 'pine':
            return (
              <svg {...commonProps} style={{ color: colors.mature }}>
                {baseElements.trunk(12, 40, 90)}
                <path d="M50 20 L30 40 L40 40 L25 55 L35 55 L20 70 L50 50 L80 70 L65 55 L75 55 L60 40 L70 40 L50 20" fill="currentColor" />
              </svg>
            );
          case 'cherry':
            return (
              <svg {...commonProps} style={{ color: colors.mature }}>
                {baseElements.trunk(10, 40, 90)}
                <path d="M50 30 Q20 25 30 10 Q40 0 50 0 Q60 0 70 10 Q80 25 50 30" fill="currentColor" opacity="0.9" />
                <circle cx="35" cy="25" r="8" fill={colors.fruit} opacity="0.6" />
                <circle cx="65" cy="25" r="8" fill={colors.fruit} opacity="0.6" />
              </svg>
            );
          default:
            return (
              <svg {...commonProps} style={{ color: colors.mature }}>
                {baseElements.trunk(10, 40, 90)}
                {baseElements.roundedCanopy(70, 80)}
              </svg>
            );
        }

      case 'fruiting':
        const fruitClass = isCollecting
          ? "fruit-base animate-fruit-collect"
          : "fruit-base animate-fruit-appear fruit-interactive";

        // 果实位置配置
        const fruitPositions = [
          { cx: 30, cy: 30, r: 7 },
          { cx: 70, cy: 40, r: 7 },
          { cx: 50, cy: 20, r: 7 },
          { cx: 25, cy: 55, r: 6 },
          { cx: 75, cy: 55, r: 6 }
        ];

        switch (treeType) {
          case 'cherry':
            return (
              <svg {...commonProps} style={{ color: colors.fruiting }}>
                {baseElements.trunk(12, 40, 90)}
                <path d="M50 30 Q10 25 20 5 Q30 0 50 0 Q70 0 80 5 Q90 25 50 30" fill="currentColor" opacity="0.9" />
                <g>
                  {fruitPositions.map((pos, idx) => (
                    <circle
                      key={idx}
                      className={fruitClass}
                      cx={pos.cx}
                      cy={pos.cy}
                      r={pos.r}
                      fill={colors.fruit}
                      style={isCollecting ? {} : { animationDelay: `${(idx + 1) * 100}ms` }}
                    />
                  ))}
                </g>
              </svg>
            );
          case 'bamboo':
            return (
              <svg {...commonProps} style={{ color: colors.fruiting }}>
                {baseElements.trunk(10, 40, 90)}
                <g>
                  <rect x="40" y="15" width="5" height="55" rx="2" fill="currentColor" opacity="0.9" />
                  <rect x="55" y="10" width="5" height="60" rx="2" fill="currentColor" opacity="0.8" />
                  <rect x="45" y="5" width="5" height="65" rx="2" fill="currentColor" opacity="0.7" />
                </g>
                <g>
                  {fruitPositions.slice(0, 3).map((pos, idx) => (
                    <circle
                      key={idx}
                      className={fruitClass}
                      cx={pos.cx + (idx * 5)}
                      cy={pos.cy + 20}
                      r={pos.r - 1}
                      fill={colors.fruit}
                      style={isCollecting ? {} : { animationDelay: `${(idx + 1) * 150}ms` }}
                    />
                  ))}
                </g>
              </svg>
            );
          default:
            return (
              <svg {...commonProps} style={{ color: colors.fruiting }}>
                {baseElements.trunk(12, 40, 90)}
                <path d="M50 85 Q10 75 10 35 Q10 5 50 5 Q90 5 90 35 Q90 75 50 85" fill="currentColor" opacity="0.9" />
                <g>
                  {fruitPositions.map((pos, idx) => (
                    <circle
                      key={idx}
                      className={fruitClass}
                      cx={pos.cx}
                      cy={pos.cy}
                      r={pos.r}
                      fill={colors.fruit}
                      style={isCollecting ? {} : { animationDelay: `${(idx + 1) * 100}ms` }}
                    />
                  ))}
                </g>
              </svg>
            );
        }
    }
  };

  // Define animations locally
  const styles = `
    @keyframes grow-pop {
      0% { opacity: 0; transform: scale(0.4) translateY(20px); }
      60% { opacity: 1; transform: scale(1.1) translateY(-5px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes sway {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(1deg); }
      75% { transform: rotate(-1deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes fruit-appear {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.3); opacity: 1; }
      80% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes fruit-collect {
      0% { transform: scale(1) translateY(0); opacity: 1; }
      20% { transform: scale(1.4) translateY(-5px); filter: brightness(1.3); }
      100% { transform: scale(0) translateY(-40px); opacity: 0; }
    }

    .animate-grow {
      animation: grow-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      transform-origin: bottom center;
    }
    .animate-sway {
      animation: sway 4s ease-in-out infinite;
      transform-origin: bottom center;
    }
    
    .fruit-base {
      transform-origin: center;
      transform-box: fill-box;
    }
    
    .animate-fruit-appear {
      animation: fruit-appear 0.6s ease-out backwards;
    }
    
    .animate-fruit-collect {
      animation: fruit-collect 0.6s ease-in forwards;
      pointer-events: none; /* Prevent double clicks */
    }

    .fruit-interactive:hover {
      filter: brightness(1.2);
      transform: scale(1.2);
      transition: all 0.2s;
    }
  `;


  return (
    <div
      onClick={handleInteraction}
      className="relative flex items-end justify-center transition-transform hover:scale-105 cursor-pointer group"
      style={{ width: '100px', height: '120px' }}
    >
      <style>{styles}</style>
      {getTreeSVG()}
      <div className="absolute -bottom-2 w-16 h-3 bg-black/5 rounded-[100%] blur-[4px] group-hover:bg-black/10 transition-colors"></div>
    </div>
  );
};

export default TreeVisual;
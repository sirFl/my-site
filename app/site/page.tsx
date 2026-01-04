import React, { useState, useEffect, useRef } from 'react';

interface MenuItem {
  id: number;
  label: string;
  icon?: string;
}

interface RotaryMenuProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  centerLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RotaryMenu: React.FC<RotaryMenuProps> = ({
  items,
  onSelect,
  centerLabel = 'Menu',
  size = 'md'
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Размеры в зависимости от пропса size
  const sizeClasses = {
    sm: { container: 'w-64 h-64', item: 'w-12 h-12 text-sm', center: 'w-24 h-24' },
    md: { container: 'w-80 h-80', item: 'w-14 h-14 text-base', center: 'w-32 h-32' },
    lg: { container: 'w-96 h-96', item: 'w-16 h-16 text-lg', center: 'w-40 h-40' }
  };

  const currentSize = sizeClasses[size];

  // Вычисляем позиции для каждого элемента
  const getItemPosition = (index: number) => {
    const totalItems = items.length;
    const angle = (index * 360) / totalItems + rotation;
    const radius = size === 'sm' ? 100 : size === 'md' ? 120 : 140;
    
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    
    return { x, y };
  };

  // Обработка начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startX = e.clientX - centerX;
    const startY = e.clientY - centerY;
    
    const initialAngle = Math.atan2(startY, startX) * (180 / Math.PI);
    
    setIsDragging(true);
    setStartAngle(initialAngle - rotation);
    
    e.preventDefault();
  };

  // Обработка перетаскивания
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentX = e.clientX - centerX;
    const currentY = e.clientY - centerY;
    
    const currentAngle = Math.atan2(currentY, currentX) * (180 / Math.PI);
    const newRotation = currentAngle - startAngle;
    
    setRotation(newRotation);
  };

  // Обработка окончания перетаскивания
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Фиксируем вращение к ближайшему элементу
    if (items.length > 0) {
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const snapAngle = 360 / items.length;
      const nearestIndex = Math.round(normalizedRotation / snapAngle) % items.length;
      const nearestRotation = nearestIndex * snapAngle;
      
      setRotation(nearestRotation);
      setSelectedIndex(nearestIndex);
      
      // Активируем выбранный элемент с небольшой задержкой для плавности
      setTimeout(() => {
        onSelect(items[nearestIndex]);
      }, 300);
    }
  };

  // Обработчики для сенсорных устройств
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startX = touch.clientX - centerX;
    const startY = touch.clientY - centerY;
    
    const initialAngle = Math.atan2(startY, startX) * (180 / Math.PI);
    
    setIsDragging(true);
    setStartAngle(initialAngle - rotation);
  };

  // Эффекты для добавления/удаления глобальных обработчиков
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove as any);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove as any);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, startAngle, rotation]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        ref={containerRef}
        className={`relative ${currentSize.container} select-none`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Центральный круг */}
        <div
          className={`
            absolute inset-0 m-auto
            ${currentSize.center}
            rounded-full
            bg-gradient-to-br from-gray-800 to-black
            border-4 border-gray-700
            shadow-2xl
            flex items-center justify-center
            text-white font-bold
            transition-transform duration-300
            ${isDragging ? 'scale-95' : 'scale-100'}
            cursor-pointer
            select-none
            z-10
          `}
        >
          <div className="text-center">
            <div className="text-xs opacity-75">ROTARY</div>
            <div className="text-sm">{centerLabel}</div>
            {selectedIndex !== null && (
              <div className="text-xs mt-1 opacity-75">
                {items[selectedIndex].label}
              </div>
            )}
          </div>
        </div>

        {/* Элементы меню */}
        {items.map((item, index) => {
          const position = getItemPosition(index);
          const isSelected = selectedIndex === index;
          
          return (
            <div
              key={item.id}
              className={`
                absolute
                ${currentSize.item}
                rounded-full
                flex items-center justify-center
                transition-all duration-300
                ${isSelected
                  ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white scale-110 shadow-lg'
                  : 'bg-gradient-to-br from-gray-700 to-gray-900 text-gray-300'
                }
                border-2 ${isSelected ? 'border-blue-400' : 'border-gray-600'}
                cursor-pointer
                hover:scale-105 hover:shadow-md
                active:scale-95
                z-0
              `}
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => {
                setSelectedIndex(index);
                onSelect(item);
              }}
              title={item.label}
            >
              {item.icon ? (
                <span className="text-xl">{item.icon}</span>
              ) : (
                <span className="font-bold">{item.label.charAt(0)}</span>
              )}
            </div>
          );
        })}

        {/* Декоративные линии */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-600 border-opacity-30" />
        
        {/* Концентрические круги */}
        <div className="absolute inset-4 rounded-full border border-gray-700 border-opacity-20" />
        <div className="absolute inset-8 rounded-full border border-gray-700 border-opacity-10" />
        
        {/* Индикатор выбора (как в старых телефонах) */}
        <div
          className={`
            absolute top-0 left-1/2
            w-1 h-4
            bg-red-500
            transform -translate-x-1/2
            transition-opacity duration-300
            ${selectedIndex !== null ? 'opacity-100' : 'opacity-0'}
            z-20
          `}
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: 'bottom center',
          }}
        />
      </div>

      {/* Инструкция */}
      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm mb-2">Поверните диск или перетащите мышью</p>
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Выбранный элемент</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
            <span>Доступный элемент</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Пример использования компонента
const Menu1: React.FC = () => {
  const menuItems: MenuItem[] = [
    { id: 1, label: 'Главная', icon: '🏠' },
    { id: 2, label: 'Контакты', icon: '📞' },
    { id: 3, label: 'Настройки', icon: '⚙️' },
    { id: 4, label: 'Помощь', icon: '❓' },
    { id: 5, label: 'Профиль', icon: '👤' },
    { id: 6, label: 'Сообщения', icon: '✉️' },
    { id: 7, label: 'Календарь', icon: '📅' },
    { id: 8, label: 'Файлы', icon: '📁' },
  ];

  const handleSelect = (item: MenuItem) => {
    console.log('Выбран элемент:', item);
    alert(`Выбрано: ${item.label}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-2">
        Rotary Phone Menu
      </h1>
      <p className="text-gray-400 mb-8">
        Вращающееся меню в стиле старых телефонных дисков
      </p>
      
      <RotaryMenu
        items={menuItems}
        onSelect={handleSelect}
        centerLabel="МЕНЮ"
        size="md"
      />
      
      <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
        <p>
          • Перетащите мышью для вращения диска<br/>
          • Кликните на элемент для быстрого выбора<br/>
          • Диск автоматически фиксируется на ближайшем элементе
        </p>
      </div>
    </div>
  );
};

export default Menu1;
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wine, Upload, Image as ImageIcon, Send, Settings, 
  User, LogOut, Sparkles, FileText, Camera, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Wine as WineType } from '../App';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  recommendations?: WineType[];
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface MainChatInterfaceProps {
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onPreferencesClick?: () => void;
}

export function MainChatInterface({ 
  onLogout, 
  onSettingsClick, 
  onPreferencesClick 
}: MainChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const hasActiveConversation = !!activeConversation;

  // Mock wine data for demonstration
  const mockRecommendations: WineType[] = [
    {
      id: '1',
      name: 'Château Margaux 2015',
      winery: 'Château Margaux',
      year: 2015,
      region: 'Margaux',
      country: 'France',
      type: 'Red',
      price: 850,
      matchScore: 98,
      flavorProfile: ['Blackcurrant', 'Cedar', 'Tobacco', 'Violet'],
      tastingNotes: 'Exquisite balance with silky tannins and remarkable depth.',
      pairings: ['Beef Wellington', 'Lamb Rack', 'Aged Cheese'],
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
      reasoning: 'Based on your preference for elegant Bordeaux wines with structured tannins.',
    },
    {
      id: '2',
      name: 'Screaming Eagle Cabernet',
      winery: 'Screaming Eagle',
      year: 2018,
      region: 'Napa Valley',
      country: 'USA',
      type: 'Red',
      price: 3200,
      matchScore: 96,
      flavorProfile: ['Dark Cherry', 'Chocolate', 'Espresso', 'Vanilla'],
      tastingNotes: 'Powerful yet refined, with exceptional concentration and elegance.',
      pairings: ['Prime Ribeye', 'Truffle Risotto', 'Dark Chocolate'],
      imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400',
      reasoning: 'Matches your taste for bold, full-bodied Napa Valley Cabernets.',
    },
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);
      processWineList(imageUrl);
    };

    reader.readAsDataURL(file);
  };

  const processWineList = (imageUrl: string) => {
    setIsUploading(true);

    // Simulate AI processing
    setTimeout(() => {
      const conversationId = Date.now().toString();
      const newConversation: Conversation = {
        id: conversationId,
        title: `Wine List - ${new Date().toLocaleDateString()}`,
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'I uploaded a wine list from the restaurant',
            imageUrl,
            timestamp: new Date(),
          },
          {
            id: '2',
            type: 'assistant',
            content: `I've analyzed the wine list and found ${mockRecommendations.length} perfect matches based on your taste profile. Here are my top recommendations:`,
            recommendations: mockRecommendations,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(conversationId);
      setIsUploading(false);
      setSelectedImage(null);
    }, 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const conversationId = activeConversationId || Date.now().toString();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageInput,
      timestamp: new Date(),
    };

    // Add user message immediately
    setConversations((prev) => {
      const conversationIndex = prev.findIndex(c => c.id === conversationId);
      if (conversationIndex === -1) {
        const newConversation: Conversation = {
          id: conversationId,
          title: `Conversation - ${new Date().toLocaleDateString()}`,
          messages: [userMessage],
          createdAt: new Date(),
        };
        return [newConversation, ...prev];
      } else {
        const updatedConversation = {
          ...prev[conversationIndex],
          messages: [...prev[conversationIndex].messages, userMessage],
        };
        return [
          ...prev.slice(0, conversationIndex),
          updatedConversation,
          ...prev.slice(conversationIndex + 1),
        ];
      }
    });

    setMessageInput('');
    setIsSendingMessage(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date(),
      };

      setConversations((prev) => {
        const conversationIndex = prev.findIndex(c => c.id === conversationId);
        if (conversationIndex !== -1) {
          const updatedConversation = {
            ...prev[conversationIndex],
            messages: [...prev[conversationIndex].messages, aiResponse],
          };
          return [
            ...prev.slice(0, conversationIndex),
            updatedConversation,
            ...prev.slice(conversationIndex + 1),
          ];
        }
        return prev;
      });

      setIsSendingMessage(false);
    }, 1500);
  };

  // Generate mock AI responses based on user questions
  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('expensive')) {
      return "The Château Margaux 2015 is priced at $850, while the Screaming Eagle Cabernet 2018 is $3,200. Both represent excellent value for their quality and reputation. Would you like me to suggest more budget-friendly options from the list?";
    } else if (lowerQuestion.includes('pair') || lowerQuestion.includes('food') || lowerQuestion.includes('dish')) {
      return "Great question! The Château Margaux pairs beautifully with beef Wellington, lamb rack, or aged cheese. The Screaming Eagle would be perfect with a prime ribeye, truffle risotto, or even dark chocolate for dessert. What will you be ordering?";
    } else if (lowerQuestion.includes('difference') || lowerQuestion.includes('compare')) {
      return "The main difference is regional character: Château Margaux offers classic Bordeaux elegance with silky tannins and complex flavors of blackcurrant, cedar, and tobacco. The Screaming Eagle is a bold Napa powerhouse with intense dark fruit, chocolate, and espresso notes. Both are exceptional, but the Margaux is more restrained and food-friendly.";
    } else if (lowerQuestion.includes('white') || lowerQuestion.includes('lighter')) {
      return "While these recommendations are red wines based on your profile, I can certainly look for white or lighter options on the list. Would you prefer a crisp white Burgundy, an elegant Champagne, or perhaps a lighter Pinot Noir?";
    } else if (lowerQuestion.includes('year') || lowerQuestion.includes('vintage') || lowerQuestion.includes('2015') || lowerQuestion.includes('2018')) {
      return "2015 was an exceptional vintage for Bordeaux - considered one of the finest in recent decades. The 2018 Napa vintage was also outstanding, with perfect growing conditions that produced wines with great concentration and balance. Both are drinking beautifully now but can age for many more years.";
    } else {
      return "Based on your taste profile, both of these wines showcase the elegant, structured style you prefer. The Château Margaux leans toward Old World refinement, while the Screaming Eagle represents New World power and opulence. Is there a specific aspect of these wines you'd like to know more about?";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 320 }}
        className="bg-white/60 backdrop-blur-lg border-r border-white/80 shadow-xl flex flex-col relative"
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-[#d4af37]/30 rounded-full 
                   flex items-center justify-center shadow-lg hover:bg-[#f8f5f2] transition-colors z-10"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#8b4049]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#8b4049]" />
          )}
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wine className="w-8 h-8 text-[#8b4049]" />
              <Sparkles className="w-3 h-3 text-[#d4af37] absolute -top-1 -right-1" />
            </div>
            {!isSidebarCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-serif text-[#2c2c2c]"
              >
                So Divino
              </motion.h2>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isSidebarCollapsed && (
            <>
              <h3 className="text-[#6b6b6b] mb-4 px-2">Recent Conversations</h3>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      activeConversationId === conv.id
                        ? 'bg-[#8b4049]/10 border border-[#8b4049]/30'
                        : 'bg-white/40 border border-transparent hover:bg-white/60'
                    }`}
                  >
                    <p className="text-[#2c2c2c] truncate mb-1">{conv.title}</p>
                    <p className="text-[#a0a0a0]">
                      {conv.createdAt.toLocaleDateString()}
                    </p>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-white/60 p-4 space-y-2">
          <NavButton
            icon={User}
            label="Preferences"
            onClick={onPreferencesClick}
            collapsed={isSidebarCollapsed}
          />
          <NavButton
            icon={Settings}
            label="Settings"
            onClick={onSettingsClick}
            collapsed={isSidebarCollapsed}
          />
          <NavButton
            icon={LogOut}
            label="Sign Out"
            onClick={onLogout}
            collapsed={isSidebarCollapsed}
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/40 backdrop-blur-sm border-b border-white/60 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#2c2c2c] font-serif mb-1">
                {activeConversation ? activeConversation.title : 'Your AI Sommelier'}
              </h1>
              <p className="text-[#6b6b6b]">
                Upload a wine list to receive personalized recommendations
              </p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeConversation ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <EmptyState onUploadClick={() => fileInputRef.current?.click()} />
          )}
        </div>

        {/* Upload Area or Message Input Area */}
        <div className="border-t border-white/60 bg-white/40 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            {isUploading ? (
              <div className="flex items-center justify-center gap-4 p-6 bg-white/60 rounded-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-[#8b4049]" />
                </motion.div>
                <p className="text-[#2c2c2c]">Analyzing wine list...</p>
              </div>
            ) : hasActiveConversation ? (
              // Text Chat Input
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a follow-up question about these wines..."
                  className="flex-1 px-6 py-4 bg-white/80 border border-[#d4af37]/30 rounded-full
                           text-[#2c2c2c] placeholder:text-[#a0a0a0]
                           focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30 focus:border-[#8b4049]/50
                           transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  }}
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSendingMessage}
                  className="px-6 py-4 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white 
                           rounded-full hover:shadow-lg transition-all disabled:opacity-50 
                           disabled:cursor-not-allowed flex items-center justify-center min-w-[64px]"
                >
                  {isSendingMessage ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              // Upload Area
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 transition-all ${
                  isDragging
                    ? 'border-[#8b4049] bg-[#8b4049]/5'
                    : 'border-[#d4af37]/40 bg-white/40'
                }`}
              >
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#8b4049] to-[#6d323a] 
                             text-white rounded-full hover:shadow-lg transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Wine List
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-3 bg-white/60 border border-[#d4af37]/40 
                             text-[#2c2c2c] rounded-full hover:bg-white/80 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                </div>
                <p className="text-center text-[#a0a0a0] mt-4">
                  or drag and drop your wine list image here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

// Helper Components

function NavButton({ 
  icon: Icon, 
  label, 
  onClick, 
  collapsed 
}: { 
  icon: any; 
  label: string; 
  onClick?: () => void; 
  collapsed: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/40 
               hover:bg-white/60 border border-transparent hover:border-[#d4af37]/30 
               text-[#2c2c2c] transition-all"
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </motion.button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
        <div
          className={`rounded-2xl p-6 ${
            message.type === 'user'
              ? 'bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white'
              : 'bg-white/60 backdrop-blur-md border border-white/80 text-[#2c2c2c]'
          }`}
        >
          {message.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={message.imageUrl} 
                alt="Wine list" 
                className="w-full h-auto"
              />
            </div>
          )}
          <p>{message.content}</p>
        </div>

        {message.recommendations && (
          <div className="mt-6 space-y-4">
            {message.recommendations.map((wine) => (
              <WineRecommendationCard key={wine.id} wine={wine} />
            ))}
          </div>
        )}

        <p className={`text-[#a0a0a0] mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

function WineRecommendationCard({ wine }: { wine: WineType }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex gap-6">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-[#f0ebe6] flex-shrink-0">
          <img 
            src={wine.imageUrl} 
            alt={wine.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-[#2c2c2c] mb-1">{wine.name}</h3>
              <p className="text-[#6b6b6b]">{wine.winery} • {wine.year}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#8b4049] rounded-full">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-white">{wine.matchScore}%</span>
            </div>
          </div>
          <p className="text-[#6b6b6b] mb-3">{wine.reasoning}</p>
          <div className="flex flex-wrap gap-2">
            {wine.flavorProfile.slice(0, 3).map((flavor) => (
              <span
                key={flavor}
                className="px-3 py-1 bg-[#f0e6e6]/60 rounded-full text-[#6b6b6b]"
              >
                {flavor}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 
                        flex items-center justify-center backdrop-blur-sm">
            <Wine className="w-16 h-16 text-[#8b4049]" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-[#d4af37]" />
          </motion.div>
        </div>
      </motion.div>

      <h2 className="text-[#2c2c2c] font-serif mb-4">
        Welcome Back!
      </h2>
      <p className="text-[#6b6b6b] mb-8">
        Upload a wine list from your restaurant and I'll recommend the perfect wines 
        based on your personal taste profile.
      </p>

      <button
        onClick={onUploadClick}
        className="px-8 py-4 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white 
                 rounded-full hover:shadow-lg transition-all flex items-center gap-3"
      >
        <Upload className="w-5 h-5" />
        Upload Your First Wine List
      </button>
    </div>
  );
}
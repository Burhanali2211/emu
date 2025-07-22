import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  ExternalLink,
  ChevronRight,
  Star,
  Download,
  Play,
  FileText,
  Lightbulb,
  Settings,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HelpArticle {
  id: string;
  title: string;
  category: 'getting-started' | 'controls' | 'missions' | 'troubleshooting' | 'advanced';
  type: 'article' | 'video' | 'tutorial';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  rating: number;
  description: string;
  tags: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const [articles] = useState<HelpArticle[]>([
    {
      id: '1',
      title: 'Getting Started with Your Robot',
      category: 'getting-started',
      type: 'tutorial',
      difficulty: 'beginner',
      readTime: 10,
      rating: 4.8,
      description: 'Complete guide to setting up and configuring your robot for the first time.',
      tags: ['setup', 'configuration', 'first-time'],
    },
    {
      id: '2',
      title: 'Understanding the Dashboard',
      category: 'getting-started',
      type: 'article',
      difficulty: 'beginner',
      readTime: 5,
      rating: 4.6,
      description: 'Learn about all the features and widgets available on the main dashboard.',
      tags: ['dashboard', 'interface', 'overview'],
    },
    {
      id: '3',
      title: 'Creating Your First Mission',
      category: 'missions',
      type: 'video',
      difficulty: 'intermediate',
      readTime: 15,
      rating: 4.9,
      description: 'Step-by-step video guide to creating and executing your first robot mission.',
      tags: ['missions', 'waypoints', 'planning'],
    },
    {
      id: '4',
      title: 'Advanced Control Techniques',
      category: 'controls',
      type: 'article',
      difficulty: 'advanced',
      readTime: 20,
      rating: 4.7,
      description: 'Master advanced control methods including precision movements and custom routines.',
      tags: ['controls', 'precision', 'advanced'],
    },
    {
      id: '5',
      title: 'Troubleshooting Connection Issues',
      category: 'troubleshooting',
      type: 'article',
      difficulty: 'intermediate',
      readTime: 8,
      rating: 4.5,
      description: 'Common solutions for network and connectivity problems.',
      tags: ['network', 'connection', 'troubleshooting'],
    },
    {
      id: '6',
      title: 'Sensor Calibration Guide',
      category: 'advanced',
      type: 'tutorial',
      difficulty: 'advanced',
      readTime: 25,
      rating: 4.8,
      description: 'Detailed guide for calibrating and optimizing sensor performance.',
      tags: ['sensors', 'calibration', 'optimization'],
    },
  ]);

  const [faqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'How do I connect my robot to WiFi?',
      answer: 'Go to Settings > Network, scan for available networks, and enter your WiFi credentials. The robot will automatically connect and save the configuration.',
      category: 'Network',
      helpful: 45,
    },
    {
      id: '2',
      question: 'Why is my robot not responding to commands?',
      answer: 'Check the connection status in the header. Ensure the robot is powered on and within WiFi range. Try refreshing the page or restarting the robot.',
      category: 'Troubleshooting',
      helpful: 38,
    },
    {
      id: '3',
      question: 'How do I create a patrol mission?',
      answer: 'Navigate to the Missions page, click "New Mission", select "Patrol" template, and place waypoints on the map. Configure timing and save the mission.',
      category: 'Missions',
      helpful: 52,
    },
    {
      id: '4',
      question: 'Can I control multiple robots?',
      answer: 'Yes! The Fleet page allows you to manage multiple robots. Each robot needs a unique ID and network configuration.',
      category: 'Fleet Management',
      helpful: 29,
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="w-4 h-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'controls', name: 'Controls', icon: <Settings className="w-4 h-4" /> },
    { id: 'missions', name: 'Missions', icon: <Zap className="w-4 h-4" /> },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'advanced', name: 'Advanced', icon: <Star className="w-4 h-4" /> },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: HelpArticle['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-400" />;
      case 'tutorial': return <Play className="w-4 h-4 text-green-400" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: HelpArticle['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-400';
      case 'intermediate': return 'text-yellow-400 border-yellow-400';
      case 'advanced': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-900/50 neon-border">
        <CardContent className="p-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-3xl font-bold text-white mb-2">Help & Documentation</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Find answers, tutorials, and guides to help you get the most out of your robot dashboard.
          </p>
          
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-800/50 border-blue-500/30 text-lg h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-slate-900/50 neon-border mt-6">
            <CardHeader>
              <CardTitle className="text-blue-400">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-green-400 border-green-400/30">
                <Download className="w-4 h-4 mr-2" />
                Download Manual
              </Button>
              <Button variant="outline" className="w-full justify-start text-purple-400 border-purple-400/30">
                <Video className="w-4 h-4 mr-2" />
                Video Tutorials
              </Button>
              <Button variant="outline" className="w-full justify-start text-blue-400 border-blue-400/30">
                <MessageCircle className="w-4 h-4 mr-2" />
                Community Forum
              </Button>
              <Button variant="outline" className="w-full justify-start text-yellow-400 border-yellow-400/30">
                <ExternalLink className="w-4 h-4 mr-2" />
                API Documentation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Help Articles */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400">
                Help Articles ({filteredArticles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
                  <p>Try adjusting your search terms or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(article.type)}
                          <Badge variant="outline" className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{article.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-slate-200 mb-2">{article.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{article.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{article.readTime} min read</span>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-200">{faq.question}</h4>
                      <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                        {faq.category}
                      </Badge>
                    </div>
                    <p className="text-slate-400 mb-3">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{faq.helpful} people found this helpful</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-400 border-green-400/30 text-xs">
                          Helpful
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400/30 text-xs">
                          Not Helpful
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-slate-900/50 neon-border">
            <CardHeader>
              <CardTitle className="text-blue-400">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h4 className="font-semibold text-slate-200 mb-1">Live Chat</h4>
                  <p className="text-sm text-slate-400 mb-3">Get instant help from our support team</p>
                  <Button size="sm" className="bg-blue-600/20 text-blue-400 border-blue-400/30">
                    Start Chat
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <Book className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h4 className="font-semibold text-slate-200 mb-1">Documentation</h4>
                  <p className="text-sm text-slate-400 mb-3">Comprehensive technical documentation</p>
                  <Button size="sm" className="bg-green-600/20 text-green-400 border-green-400/30">
                    View Docs
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <ExternalLink className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h4 className="font-semibold text-slate-200 mb-1">Community</h4>
                  <p className="text-sm text-slate-400 mb-3">Connect with other users and experts</p>
                  <Button size="sm" className="bg-purple-600/20 text-purple-400 border-purple-400/30">
                    Join Forum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Play, Calendar, User, Clock, Star, Download, ExternalLink } from 'lucide-react';

const ClinicalResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Sample research articles data
  const researchArticles = [
    {
      id: 1,
      title: "Novel Approaches to Cardiovascular Disease Prevention in Primary Care",
      authors: "Dr. Sarah Johnson, Dr. Michael Chen",
      journal: "Journal of Clinical Medicine",
      date: "2024-08-01",
      category: "cardiology",
      abstract: "This comprehensive review examines emerging preventive strategies for cardiovascular disease in primary care settings, including lifestyle interventions and pharmacological approaches.",
      pdfUrl: "#",
      citationCount: 156,
      impactFactor: 4.2
    },
    {
      id: 2,
      title: "Advances in Immunotherapy for Solid Tumors: A Meta-Analysis",
      authors: "Dr. Emily Rodriguez, Dr. James Wilson",
      journal: "Nature Medicine",
      date: "2024-07-28",
      category: "oncology",
      abstract: "A systematic review of recent clinical trials investigating checkpoint inhibitor combinations in various solid tumor types.",
      pdfUrl: "#",
      citationCount: 243,
      impactFactor: 8.1
    },
    {
      id: 3,
      title: "Machine Learning Applications in Diagnostic Radiology",
      authors: "Dr. Alex Thompson, Dr. Maria Gonzalez",
      journal: "Radiology Today",
      date: "2024-07-25",
      category: "radiology",
      abstract: "Exploring the integration of AI-powered diagnostic tools in clinical radiology practice and their impact on accuracy and efficiency.",
      pdfUrl: "#",
      citationCount: 89,
      impactFactor: 3.7
    },
    {
      id: 4,
      title: "Pediatric Mental Health: Early Intervention Strategies",
      authors: "Dr. Rachel Kim, Dr. David Brown",
      journal: "Child Psychology Review",
      date: "2024-07-20",
      category: "pediatrics",
      abstract: "Evidence-based approaches to identifying and treating mental health conditions in children and adolescents.",
      pdfUrl: "#",
      citationCount: 124,
      impactFactor: 5.3
    }
  ];

  // Sample YouTube videos data - Real medical education videos with generic educational IDs
  const youtubeVideos = [
    {
      id: 1,
      title: "ECG/EKG Interpretation Basics - Systematic Approach",
      channel: "Armando Hasudungan",
      duration: "15:32",
      views: "2.1M",
      uploadDate: "2023-06-15",
      category: "cardiology",
      videoId: "M7lc1UVf-VE", // Generic educational video ID
      description: "Learn systematic ECG interpretation with clear explanations and visual aids covering normal rhythms and common abnormalities."
    },
    {
      id: 2,
      title: "Chest X-Ray Interpretation Made Simple",
      channel: "Geeky Medics",
      duration: "18:45",
      views: "1.5M",
      uploadDate: "2023-05-20",
      category: "radiology",
      videoId: "JGwWNGJdvx8", // Generic educational video ID
      description: "Step-by-step approach to chest X-ray interpretation covering normal anatomy and common pathological findings."
    },
    {
      id: 3,
      title: "Basic Life Support (BLS) - CPR Guidelines",
      channel: "ICU Advantage",
      duration: "12:18",
      views: "943K",
      uploadDate: "2024-01-10",
      category: "emergency",
      videoId: "tpiyEe_CqB4", // Generic educational video ID
      description: "Updated BLS CPR techniques following current guidelines with practical demonstrations and key learning points."
    },
    {
      id: 4,
      title: "Pediatric Physical Examination Techniques",
      channel: "Ninja Nerd",
      duration: "22:47",
      views: "785K",
      uploadDate: "2023-08-12",
      category: "pediatrics",
      videoId: "9bZkp7q19f0", // Generic educational video ID
      description: "Comprehensive guide to pediatric physical examination adapted for different age groups with practical tips."
    },
    {
      id: 5,
      title: "Type 2 Diabetes - Pathophysiology and Management",
      channel: "Osmosis",
      duration: "16:25",
      views: "1.2M",
      uploadDate: "2023-04-08",
      category: "endocrinology",
      videoId: "PSNhsHqsCEc", // Generic educational video ID
      description: "Detailed explanation of Type 2 diabetes mechanisms and current treatment strategies including lifestyle and pharmacological interventions."
    },
    {
      id: 6,
      title: "Blood Pressure Measurement - Proper Technique",
      channel: "Zero To Finals",
      duration: "8:34",
      views: "456K",
      uploadDate: "2023-07-03",
      category: "cardiology",
      videoId: "KVjepWQQUPA", // Generic educational video ID
      description: "Learn correct blood pressure measurement technique including equipment setup and common measurement errors to avoid."
    }
  ];

  const categories = [
    { value: 'all', label: 'All Specialties' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'endocrinology', label: 'Endocrinology' }
  ];

  const toggleFavorite = (type, id) => {
    const favoriteKey = `${type}-${id}`;
    setFavorites(prev => 
      prev.includes(favoriteKey) 
        ? prev.filter(fav => fav !== favoriteKey)
        : [...prev, favoriteKey]
    );
  };

  const isFavorite = (type, id) => favorites.includes(`${type}-${id}`);

  const filteredArticles = researchArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.authors.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = youtubeVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clinical Resources Hub</h1>
                <p className="text-sm text-gray-600">Evidence-based medicine at your fingertips</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <span className="text-green-800 font-medium">Online</span>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, videos, or topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Research Articles</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Educational Videos</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Latest Research Articles ({filteredArticles.length})
                  </h2>
                </div>
                
                <div className="grid gap-6">
                  {filteredArticles.map(article => (
                    <div key={article.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-green-600 cursor-pointer">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="w-4 h-4 mr-1" />
                            <span className="mr-4">{article.authors}</span>
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="mr-4">{article.date}</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {categories.find(cat => cat.value === article.category)?.label}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">{article.abstract}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-4">Journal: {article.journal}</span>
                            <span className="mr-4">Citations: {article.citationCount}</span>
                            <span>Impact Factor: {article.impactFactor}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleFavorite('article', article.id)}
                            className={`p-2 rounded-full ${
                              isFavorite('article', article.id)
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Educational Videos ({filteredVideos.length})
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <div className="aspect-video bg-gray-800 flex items-center justify-center">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{video.channel}</span>
                          <div className="flex items-center space-x-2">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{video.uploadDate}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {categories.find(cat => cat.value === video.category)?.label}
                          </span>
                          <button
                            onClick={() => toggleFavorite('video', video.id)}
                            className={`p-1 rounded-full ${
                              isFavorite('video', video.id)
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalResourcesPage;
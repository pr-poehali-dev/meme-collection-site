import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Meme {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: 'popular' | 'new' | 'old';
  tags: string[];
}

const translations: Record<string, {
  title: string;
  subtitle: string;
  search: string;
  categories: {
    all: string;
    popular: string;
    new: string;
    favorites: string;
    old: string;
  };
  selectLanguage: string;
  favorite: string;
  unfavorite: string;
}> = {
  en: {
    title: 'MemeVerse',
    subtitle: 'Find any meme by description',
    search: 'Search memes...',
    categories: {
      all: 'All',
      popular: 'Popular',
      new: 'New',
      favorites: 'Favorites',
      old: 'Classics'
    },
    selectLanguage: 'Select your language',
    favorite: 'Add to favorites',
    unfavorite: 'Remove from favorites'
  },
  ru: {
    title: 'МемВселенная',
    subtitle: 'Найди любой мем по описанию',
    search: 'Поиск мемов...',
    categories: {
      all: 'Все',
      popular: 'Популярные',
      new: 'Новые',
      favorites: 'Избранное',
      old: 'Классика'
    },
    selectLanguage: 'Выберите язык',
    favorite: 'В избранное',
    unfavorite: 'Удалить из избранного'
  },
  es: {
    title: 'MemeVerso',
    subtitle: 'Encuentra cualquier meme por descripción',
    search: 'Buscar memes...',
    categories: {
      all: 'Todos',
      popular: 'Populares',
      new: 'Nuevos',
      favorites: 'Favoritos',
      old: 'Clásicos'
    },
    selectLanguage: 'Selecciona tu idioma',
    favorite: 'Añadir a favoritos',
    unfavorite: 'Quitar de favoritos'
  },
  fr: {
    title: 'MemeVers',
    subtitle: 'Trouvez n\'importe quel meme par description',
    search: 'Rechercher des memes...',
    categories: {
      all: 'Tous',
      popular: 'Populaires',
      new: 'Nouveaux',
      favorites: 'Favoris',
      old: 'Classiques'
    },
    selectLanguage: 'Sélectionnez votre langue',
    favorite: 'Ajouter aux favoris',
    unfavorite: 'Retirer des favoris'
  },
  de: {
    title: 'MemeWelt',
    subtitle: 'Finde jeden Meme durch Beschreibung',
    search: 'Memes suchen...',
    categories: {
      all: 'Alle',
      popular: 'Beliebt',
      new: 'Neu',
      favorites: 'Favoriten',
      old: 'Klassiker'
    },
    selectLanguage: 'Wähle deine Sprache',
    favorite: 'Zu Favoriten hinzufügen',
    unfavorite: 'Aus Favoriten entfernen'
  },
  ja: {
    title: 'ミームバース',
    subtitle: '説明でミームを検索',
    search: 'ミームを検索...',
    categories: {
      all: 'すべて',
      popular: '人気',
      new: '新着',
      favorites: 'お気に入り',
      old: 'クラシック'
    },
    selectLanguage: '言語を選択',
    favorite: 'お気に入りに追加',
    unfavorite: 'お気に入りから削除'
  },
  ko: {
    title: '밈버스',
    subtitle: '설명으로 밈 찾기',
    search: '밈 검색...',
    categories: {
      all: '전체',
      popular: '인기',
      new: '최신',
      favorites: '즐겨찾기',
      old: '클래식'
    },
    selectLanguage: '언어 선택',
    favorite: '즐겨찾기 추가',
    unfavorite: '즐겨찾기 제거'
  }
};

const SAMPLE_MEMES: Meme[] = [
  {
    id: 1,
    title: 'Distracted Boyfriend',
    description: 'Man looking at another woman while his girlfriend looks disapproving',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    category: 'popular',
    tags: ['relationship', 'choice', 'distraction']
  },
  {
    id: 2,
    title: 'Drake Hotline Bling',
    description: 'Drake rejecting something vs approving something else',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    category: 'popular',
    tags: ['preference', 'choice', 'approval']
  },
  {
    id: 3,
    title: 'Woman Yelling at Cat',
    description: 'Angry woman pointing at confused cat at dinner table',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    category: 'new',
    tags: ['argument', 'confusion', 'cat']
  },
  {
    id: 4,
    title: 'Success Kid',
    description: 'Baby making fist pump gesture on beach',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop',
    category: 'old',
    tags: ['success', 'victory', 'baby']
  },
  {
    id: 5,
    title: 'Surprised Pikachu',
    description: 'Pikachu with shocked expression',
    imageUrl: 'https://images.unsplash.com/photo-1606604748010-c0de0d30ff3c?w=400&h=300&fit=crop',
    category: 'popular',
    tags: ['shock', 'surprise', 'pokemon']
  },
  {
    id: 6,
    title: 'This Is Fine',
    description: 'Dog sitting in room on fire saying everything is fine',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=300&fit=crop',
    category: 'popular',
    tags: ['chaos', 'denial', 'dog']
  },
  {
    id: 7,
    title: 'Expanding Brain',
    description: 'Brain getting bigger with increasingly complex ideas',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    category: 'new',
    tags: ['intelligence', 'progression', 'brain']
  },
  {
    id: 8,
    title: 'Hide the Pain Harold',
    description: 'Older man with forced smile hiding internal pain',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
    category: 'old',
    tags: ['pain', 'smile', 'hiding']
  }
];

const Index = () => {
  const [language, setLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<number[]>([]);

  const t = translations[language || 'en'];

  const filteredMemes = useMemo(() => {
    let filtered = SAMPLE_MEMES;

    if (selectedCategory === 'favorites') {
      filtered = filtered.filter(meme => favorites.includes(meme.id));
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(meme => meme.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meme => 
        meme.title.toLowerCase().includes(query) ||
        meme.description.toLowerCase().includes(query) ||
        meme.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center neon-text">
                🌍 Select Language / Выберите язык
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Choose your preferred language
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.keys(translations).map((lang) => (
                <Button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  variant="outline"
                  className="h-16 text-lg font-medium neon-border hover:neon-glow transition-all"
                >
                  {lang === 'en' && '🇬🇧 English'}
                  {lang === 'ru' && '🇷🇺 Русский'}
                  {lang === 'es' && '🇪🇸 Español'}
                  {lang === 'fr' && '🇫🇷 Français'}
                  {lang === 'de' && '🇩🇪 Deutsch'}
                  {lang === 'ja' && '🇯🇵 日本語'}
                  {lang === 'ko' && '🇰🇷 한국어'}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold neon-text animate-glow-pulse">
              {t.title}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(null)}
              className="neon-border"
            >
              <Icon name="Globe" className="mr-2" size={16} />
              {language.toUpperCase()}
            </Button>
          </div>
          <p className="text-muted-foreground text-lg mb-6">{t.subtitle}</p>
          
          <div className="relative">
            <Icon 
              name="Search" 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" 
              size={20} 
            />
            <Input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg neon-border focus:neon-glow transition-all"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'popular', 'new', 'favorites', 'old'] as const).map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm whitespace-nowrap transition-all ${
                selectedCategory === category 
                  ? 'neon-glow' 
                  : 'hover:neon-border'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'favorites' && (
                <Icon name="Heart" size={14} className="mr-1" />
              )}
              {t.categories[category]}
              {category === 'favorites' && favorites.length > 0 && (
                <span className="ml-1">({favorites.length})</span>
              )}
            </Badge>
          ))}
        </div>

        {filteredMemes.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No memes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMemes.map((meme, index) => (
              <Card
                key={meme.id}
                className="group overflow-hidden neon-border hover:neon-glow transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(meme.id);
                    }}
                  >
                    <Icon
                      name="Heart"
                      size={18}
                      className={favorites.includes(meme.id) ? 'fill-current text-secondary' : ''}
                    />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {meme.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {meme.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {meme.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

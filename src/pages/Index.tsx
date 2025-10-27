import { useState, useMemo, useEffect } from 'react';
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
  mediaUrl: string;
  mediaType: 'image' | 'video';
  category: 'popular' | 'new' | 'old';
  tags: string[];
  isFavorite?: boolean;
  viewsCount?: number;
  favoritesCount?: number;
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
  loading: string;
  noMemes: string;
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
    unfavorite: 'Remove from favorites',
    loading: 'Loading memes...',
    noMemes: 'No memes found'
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
    unfavorite: 'Удалить из избранного',
    loading: 'Загрузка мемов...',
    noMemes: 'Мемы не найдены'
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
    unfavorite: 'Quitar de favoritos',
    loading: 'Cargando memes...',
    noMemes: 'No se encontraron memes'
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
    unfavorite: 'Retirer des favoris',
    loading: 'Chargement des memes...',
    noMemes: 'Aucun meme trouvé'
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
    unfavorite: 'Aus Favoriten entfernen',
    loading: 'Memes werden geladen...',
    noMemes: 'Keine Memes gefunden'
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
    unfavorite: 'お気に入りから削除',
    loading: 'ミームを読み込んでいます...',
    noMemes: 'ミームが見つかりません'
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
    unfavorite: '즐겨찾기 제거',
    loading: '밈 로딩 중...',
    noMemes: '밈을 찾을 수 없습니다'
  }
};

const MEMES_API_URL = 'https://functions.poehali.dev/6670d844-fe29-4657-be22-1a8556a88064';

const Index = () => {
  const [language, setLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);

  const t = translations[language || 'en'];

  useEffect(() => {
    if (language) {
      loadMemes();
    }
  }, [language, selectedCategory]);

  const loadMemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`${MEMES_API_URL}?${params.toString()}`, {
        headers: {
          'X-User-Id': userId
        }
      });
      const data = await response.json();
      setMemes(data.memes || []);
    } catch (error) {
      console.error('Failed to load memes:', error);
      setMemes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemes = useMemo(() => {
    if (!searchQuery.trim()) return memes;
    
    const query = searchQuery.toLowerCase();
    return memes.filter(meme => 
      meme.title.toLowerCase().includes(query) ||
      meme.description.toLowerCase().includes(query) ||
      meme.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, memes]);

  const toggleFavorite = async (memeId: number) => {
    try {
      const response = await fetch(MEMES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          action: 'toggle_favorite',
          meme_id: memeId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMemes(prev => prev.map(meme => 
          meme.id === memeId 
            ? { ...meme, isFavorite: data.isFavorite }
            : meme
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const favoritesCount = memes.filter(m => m.isFavorite).length;

  if (!language) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center text-primary">
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
                  className="h-16 text-lg font-medium border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
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
            <h1 className="text-4xl font-bold text-primary">
              {t.title}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(null)}
              className="border-primary/50 hover:border-primary"
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
              className="pl-10 h-12 text-lg border-primary/30 focus:border-primary transition-all"
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
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'favorites' && (
                <Icon name="Heart" size={14} className="mr-1" />
              )}
              {t.categories[category]}
              {category === 'favorites' && favoritesCount > 0 && (
                <span className="ml-1">({favoritesCount})</span>
              )}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Icon name="Loader2" size={64} className="mx-auto mb-4 text-primary animate-spin" />
            <p className="text-xl text-muted-foreground">{t.loading}</p>
          </div>
        ) : filteredMemes.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">{t.noMemes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMemes.map((meme, index) => (
              <Card
                key={meme.id}
                className="group overflow-hidden border hover:border-primary/50 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {meme.mediaType === 'image' ? (
                    <img
                      src={meme.mediaUrl}
                      alt={meme.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={meme.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      loop
                      muted
                    />
                  )}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 text-xs"
                  >
                    <Icon
                      name={meme.mediaType === 'image' ? 'Image' : 'Video'}
                      size={12}
                      className="mr-1"
                    />
                    {meme.mediaType === 'image' ? 'IMG' : 'VID'}
                  </Badge>
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
                      className={meme.isFavorite ? 'fill-current text-secondary' : ''}
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

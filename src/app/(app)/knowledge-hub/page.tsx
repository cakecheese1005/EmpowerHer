'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { articles as staticArticles } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  imageHint?: string;
  published?: boolean;
}

export default function KnowledgeHubPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      // Try to load from Firestore first
      const articlesQuery = query(
        collection(db, 'articles'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(articlesQuery);
      
      if (!snapshot.empty) {
        const firestoreArticles: Article[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Untitled',
          category: doc.data().category || 'General',
          summary: doc.data().summary || '',
          imageUrl: doc.data().imageUrl || getDefaultImage(doc.data().category),
          imageHint: doc.data().imageHint,
          published: doc.data().published,
        }));
        setArticles(firestoreArticles);
      } else {
        // Fallback to static articles
        setArticles(staticArticles.map(a => ({ ...a, published: true })));
      }
    } catch (error) {
      console.warn('Failed to load articles from Firestore, using static articles:', error);
      // Fallback to static articles on error
      setArticles(staticArticles.map(a => ({ ...a, published: true })));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (category: string): string => {
    const imageMap: Record<string, string> = {
      'Medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&q=80',
      'Nutrition': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
      'Fitness': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&q=80',
      'Mental Health': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    };
    return imageMap[category] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&q=80';
  };

  const filteredArticles = articles.filter(article => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="grid gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Hub</h1>
          <p className="text-muted-foreground">Information and resources to help you understand and manage PCOS.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-10" disabled />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-full flex flex-col overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Hub</h1>
        <p className="text-muted-foreground">Information and resources to help you understand and manage PCOS.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search articles..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery 
                ? `No articles found matching "${searchQuery}". Try a different search term.`
                : 'No articles available at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link href={`/knowledge-hub/${article.id}`} key={article.id}>
              <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                <div className="relative w-full h-48">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">{article.category}</Badge>
                  <CardTitle className="mt-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription>{article.summary}</CardDescription>
                </CardContent>
                <CardFooter>
                  <p className="text-sm font-medium text-primary">Read More &rarr;</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

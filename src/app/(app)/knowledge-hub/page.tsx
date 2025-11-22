import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { articles } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function KnowledgeHubPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Hub</h1>
        <p className="text-muted-foreground">Information and resources to help you understand and manage PCOS.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search articles..." className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link href="#" key={article.id}>
            <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <Image
                src={article.imageUrl}
                alt={article.title}
                width={600}
                height={400}
                className="h-48 w-full object-cover"
                data-ai-hint={article.imageHint}
              />
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
    </div>
  );
}

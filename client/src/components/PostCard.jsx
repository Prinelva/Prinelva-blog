import React from 'react';
import {Link} from 'react-router-dom';
import PostTimestamp from './PostTimestamp';

const categoryCovers={
    education:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85',
    politics:'/media/categories/politics.png',
    technologies:'/media/categories/technologies.svg',
    religion:'/media/categories/religion.png',
    arts:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85',
    music:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85',
    videos:'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=85',
    business:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
    news:'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=85',
    technology:'/media/categories/technology.svg',
    css:'/media/categories/css.svg',
    sports:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    fashion:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
    react:'/media/categories/react.svg',
    nodejs:'/media/categories/nodejs.svg',
};

export default function PostCard({ post }) {
    const categorySlug=post.category?.slug?.toLowerCase();
    const coverImage=post.coverImage||categoryCovers[categorySlug]||
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80';
    return (
        <article className="card overflow-hidden">
            <Link to={`/post/${post.slug}`}>
                <img src={coverImage} alt={`${post.category?.name||'Blog'}: ${post.title}`}
                    loading="lazy" className="h-48 w-full object-cover" />
            </Link>
            <div className="p-5">
                <div className="mb-2 flex flex-wrap gap-2 text-xs text-indigo-600">
                    {post.tags?.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}
                </div>
                <Link to={`/post/${post.slug}`}>
                    <h2 className="text-xl font-bold hover:text-indigo-600">{post.title}</h2>
                </Link>
                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{post.excerpt || post.content.replace(/<[^>]+>/g, ' ').slice(0, 150)}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{post.author?.name}</span>
                    <span>{post.views} views</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Published <PostTimestamp post={post}/>
                </p>
            </div>
        </article>
    );
}

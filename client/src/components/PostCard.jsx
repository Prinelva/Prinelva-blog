import React from 'react';
import {Link} from 'react-router-dom';
import PostTimestamp from './PostTimestamp';
import {categoryCovers} from '../lib/categoryCovers';

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

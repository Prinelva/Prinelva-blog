import React from 'react';

export default function PostTimestamp({post,className=''}) {
    const value=post.publishedAt||post.createdAt;
    if(!value)return null;
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return null;
    return <time className={className} dateTime={date.toISOString()}>
        {date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}
    </time>;
}

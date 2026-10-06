import React from 'react';
import {Link} from 'react-router-dom';

const cultureHighlights=[
    {
        name:'Igbo',
        description:'Contemporary Igbo style, community, and cultural life.',
        image:'/media/categories/culture-igbo.jpg',
        source:'https://commons.wikimedia.org/wiki/File:Lagos_Igbo_Hangout_3.0_at_Festac,_Lagos_-_2026_106.jpg',
        creator:'MediaMOF',
        license:'CC BY-SA 4.0',
        licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
        alt:'Igbo people gathered at a contemporary cultural event in Lagos',
    },
    {
        name:'Hausa',
        description:'Modern Hausa dress and textile craftsmanship.',
        image:'/media/categories/culture-hausa.jpg',
        source:'https://commons.wikimedia.org/wiki/File:Hausa_Dress_2025_04.jpg',
        creator:'Matazu Multimedia',
        license:'CC0',
        licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
        alt:'A contemporary Hausa dress design',
    },
    {
        name:'Yoruba',
        description:'Young designers reimagining Yoruba adire.',
        image:'/media/categories/culture-yoruba.jpg',
        source:'https://commons.wikimedia.org/wiki/File:A_group_of_young_fashion_models_wearing_Yoruba_adire_attires.jpg',
        creator:'Tunde Akangbe',
        license:'CC BY-SA 4.0',
        licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
        alt:'Young fashion models wearing Yoruba adire outfits',
    },
];

export default function CultureGallery({linkImages=true}){
    return <div className="grid gap-6 md:grid-cols-3">
        {cultureHighlights.map(({name,description,image,source,creator,license,licenseUrl,alt})=><article
            key={name} className="card overflow-hidden">
            {linkImages?<Link to="/category/culture" aria-label={`Open the Culture category featuring ${name} culture`}>
                <img src={image} alt={alt} loading="lazy" className="h-72 w-full object-cover transition-transform duration-300 hover:scale-105"/>
            </Link>:<img src={image} alt={alt} loading="lazy" className="h-72 w-full object-cover"/>}
            <div className="p-5">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
                <p className="mt-4 text-xs text-slate-500">
                    Photo by <a href={source} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">{creator}</a>
                    {' · '}<a href={licenseUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">{license}</a>
                    {license==='CC BY-SA 4.0'&&' · Resized'}
                </p>
            </div>
        </article>)}
    </div>;
}

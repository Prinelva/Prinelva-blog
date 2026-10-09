import Category from '../models/Category.js';

const defaultCategories=[
    {name:'Education',slug:'education',description:'Learning, teaching, and ideas for lifelong education.'},
    {name:'Politics',slug:'politics',description:'Civic life, public policy, and thoughtful political discussion.'},
    {name:'Technologies',slug:'technologies',description:'Technology, digital tools, and their impact on everyday life.'},
    {name:'Religion',slug:'religion',description:'Faith, religious traditions, and reflections on meaning and community.'},
    {name:'Arts',slug:'arts',description:'Visual art, creativity, and the ideas that shape artistic expression.'},
    {name:'Music',slug:'music',description:'Music, listening, instruments, and the people behind the sound.'},
    {name:'Videos',slug:'videos',description:'Video storytelling, production, and guides to watching and creating.'},
    {name:'Business',slug:'business',description:'Business ideas, responsible growth, and practical entrepreneurship.'},
    {name:'News',slug:'news',description:'Current affairs, explainers, and updates from around the community.'},
    {name:'Sports',slug:'sports',description:'Sports stories, training ideas, and memorable moments from the world of competition.'},
    {name:'Fashion',slug:'fashion',description:'Personal style, modern trends, and thoughtful ways to build a wardrobe.'},
    {name:'Culture',slug:'culture',description:'Contemporary Nigerian culture, creative traditions, and community stories.'},
    {name:'Job',slug:'job',description:'Career opportunities, job search advice, and workplace insights.'},
];

export async function ensureDefaultCategories(){
    await Category.bulkWrite(defaultCategories.map(category=>({
        updateOne:{
            filter:{slug:category.slug},
            update:{$setOnInsert:category},
            upsert:true,
        },
    })));
}

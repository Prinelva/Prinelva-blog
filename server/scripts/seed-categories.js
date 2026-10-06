import 'dotenv/config';
import mongoose from 'mongoose';
import {connectDB} from '../src/config/db.js';
import Category from '../src/models/Category.js';
import Post from '../src/models/Post.js';
import User from '../src/models/User.js';

const sampleContent=[
    {
        name:'Education',slug:'education',description:'Learning, teaching, and ideas for lifelong education.',
        postSlug:'small-learning-habits-that-make-a-lasting-difference',
        coverImage:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=85',
        title:'Small learning habits that make a lasting difference',
        excerpt:'A practical look at building steady study habits that support curiosity, understanding, and lifelong learning.',
        content:'<p>Learning is easier to sustain when it becomes part of an ordinary day. A short, focused session gives you room to return to an idea, ask better questions, and notice what you understand.</p><h2>Make learning manageable</h2><p>Choose one clear topic, set aside a regular time, and keep a note of questions to explore next. Small, consistent steps make progress easier to see.</p><h2>Reflect and revisit</h2><p>At the end of a study session, write a few sentences in your own words. Revisit those notes later and connect them to something new. Understanding grows through practice and reflection.</p>',
    },
    {
        name:'Politics',slug:'politics',description:'Civic life, public policy, and thoughtful political discussion.',
        postSlug:'how-to-evaluate-a-public-policy-proposal',
        coverImage:'/media/categories/politics.png',
        title:'How to evaluate a public policy proposal',
        excerpt:'A simple framework for reading proposals carefully, checking evidence, and understanding who may be affected.',
        content:'<p>Public policy decisions shape shared services and daily life. A useful first step is to read the proposal itself and identify the problem it aims to address.</p><h2>Look for evidence</h2><p>Check which information supports the proposal, where it came from, and whether other credible sources reach similar conclusions.</p><h2>Consider the trade-offs</h2><p>Ask who benefits, who bears the costs, how success would be measured, and when the results will be reviewed. Respectful discussion improves when people can point to the same facts while acknowledging different priorities.</p>',
    },
    {
        name:'Technologies',slug:'technologies',description:'Technology, digital tools, and their impact on everyday life.',
        postSlug:'choosing-technology-that-solves-a-real-problem',
        coverImage:'/media/categories/technologies.svg',
        title:'Choosing technology that solves a real problem',
        excerpt:'Start with the need, compare practical trade-offs, and choose tools that people can maintain and use well.',
        content:'<p>New technology can be exciting, but the most useful choice is the one that addresses a real need. Describe the task before comparing products or platforms.</p><h2>Compare the essentials</h2><p>Consider accessibility, reliability, privacy, cost, and the time required to learn and maintain a tool. A simple option that fits your workflow can be more effective than a feature-heavy alternative.</p><h2>Review after use</h2><p>Try a small pilot, gather feedback from the people who will use it, and revisit your decision as needs change.</p>',
    },
    {
        name:'Religion',slug:'religion',description:'Faith, religious traditions, and reflections on meaning and community.',
        postSlug:'building-understanding-through-interfaith-conversation',
        coverImage:'/media/categories/religion.png',
        title:'Building understanding through interfaith conversation',
        excerpt:'Curiosity, listening, and respectful questions can help people learn about faith traditions and shared values.',
        content:'<p>Conversations about religion are most meaningful when people feel heard rather than judged. Every tradition includes histories and practices that are best understood through careful listening.</p><h2>Ask with respect</h2><p>Invite someone to share what a practice means to them, and avoid assuming that one person speaks for an entire community.</p><h2>Find room for learning</h2><p>Notice both meaningful differences and shared concerns such as care, service, and belonging. Respectful conversation can strengthen understanding without asking anyone to set aside their beliefs.</p>',
    },
    {
        name:'Arts',slug:'arts',description:'Visual art, creativity, and the ideas that shape artistic expression.',
        postSlug:'finding-inspiration-in-the-everyday',
        coverImage:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85',
        title:'Finding inspiration in the everyday',
        excerpt:'Simple ways to notice details, collect ideas, and turn ordinary observations into creative starting points.',
        content:'<p>Creative ideas often begin with noticing: the shape of a shadow, a colour combination, a phrase, or a familiar place seen differently.</p><h2>Keep an idea journal</h2><p>Save quick sketches, notes, and references without asking each one to become a finished work. A collection of small observations can reveal connections over time.</p><h2>Make room to experiment</h2><p>Try a new material or process on a small scale. Experiments are useful even when they do not become a final piece, because they show you what to explore next.</p>',
    },
    {
        name:'Music',slug:'music',description:'Music, listening, instruments, and the people behind the sound.',
        postSlug:'a-closer-way-to-listen-to-a-new-piece-of-music',
        coverImage:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85',
        title:'A closer way to listen to a new piece of music',
        excerpt:'Listen for rhythm, texture, and structure to discover new details in music from any genre.',
        content:'<p>A familiar song can sound different when you give one element your full attention. On the first listen, notice the overall mood and movement.</p><h2>Follow one layer</h2><p>Listen again for a single part: percussion, bass, melody, harmony, or the spaces between sounds. Consider how that layer changes as the piece develops.</p><h2>Notice the structure</h2><p>Listen for repeated phrases, contrast, and shifts in intensity. There is no single correct interpretation; careful listening is an invitation to discover what stands out to you.</p>',
        media:[{
            type:'audio',
            url:'/media/fur-elise-public-domain-sample.ogg',
            downloadUrl:'/media/fur-elise-public-domain-sample.ogg',
            name:'Für Elise — public-domain sample',
            mimeType:'audio/ogg',
            size:222643,
            sourceUrl:'https://commons.wikimedia.org/wiki/File:F%C3%BCr-Elise-Audio-Sample-measures-1-4.ogg',
            license:'Public domain',
        }],
    },
    {
        name:'Videos',slug:'videos',description:'Video storytelling, production, and guides to watching and creating.',
        postSlug:'planning-a-clear-and-engaging-short-video',
        coverImage:'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=85',
        title:'Planning a clear and engaging short video',
        excerpt:'A simple outline and a few production checks help make short videos easier to follow and share.',
        content:'<p>A short video works best when viewers can quickly understand what it is about. Start by writing one sentence that describes what you want them to learn or feel.</p><h2>Plan the sequence</h2><p>Arrange the main points into a beginning, a few clear steps, and a concise ending. A simple shot list helps you gather the footage you need without overcomplicating production.</p><h2>Check the details</h2><p>Before publishing, review the sound, captions, framing, and rights for any music or images. Clear audio and accurate captions help more people enjoy the result.</p>',
        media:[{
            type:'video',
            url:'/media/sample-flower-video.mp4',
            downloadUrl:'/media/sample-flower-video.mp4',
            name:'Flower video sample (CC0)',
            mimeType:'video/mp4',
            size:1128375,
            sourceUrl:'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video',
            license:'CC0',
        }],
    },
    {
        name:'Business',slug:'business',description:'Business ideas, responsible growth, and practical entrepreneurship.',
        postSlug:'a-practical-first-plan-for-a-small-business-idea',
        coverImage:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
        title:'A practical first plan for a small business idea',
        excerpt:'Test the customer need, estimate basic costs, and learn from a small experiment before scaling a new idea.',
        content:'<p>A business idea becomes clearer when you can explain who it helps and what problem it solves. Start by talking with potential customers and listening for the challenges they already face.</p><h2>Test your assumptions</h2><p>Write down the most important assumptions about demand, pricing, and delivery. Look for a small, affordable way to test each one before investing heavily.</p><h2>Track what matters</h2><p>Record costs, customer feedback, and repeat interest. These observations help you decide what to improve and whether the idea is ready to grow.</p>',
    },
    {
        name:'News',slug:'news',description:'Current affairs, explainers, and updates from around the community.',
        postSlug:'a-quick-checklist-for-checking-a-news-story',
        coverImage:'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=85',
        title:'A quick checklist for checking a news story',
        excerpt:'Pause before sharing: find the original source, check the date, and compare reporting from credible outlets.',
        content:'<p>When a striking story appears in your feed, take a moment to check it before sharing. Look for the original report and see whether it names its sources.</p><h2>Check context and timing</h2><p>Confirm when the story was published and whether images or quotations are being shown in their original context. An old report can circulate again as if it were new.</p><h2>Compare independent reporting</h2><p>Look for confirmation from other reputable news organisations. If important details remain unclear, say so rather than filling gaps with guesses.</p>',
    },
    {
        name:'Sports',slug:'sports',description:'Sports stories, training ideas, and memorable moments from the world of competition.',
        postSlug:'what-team-sports-teach-us-about-working-together',
        coverImage:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
        title:'What team sports teach us about working together',
        excerpt:'Good teamwork grows from clear communication, shared effort, and learning how to support one another.',
        content:'<p>Team sports bring people together around a shared goal. Every player contributes differently, and the team improves when those contributions work in harmony.</p><h2>Communicate and adapt</h2><p>Players need to share information, pay attention to one another, and adjust when the situation changes. The same habits help groups solve problems beyond the field.</p><h2>Make room for every role</h2><p>Winning takes more than one standout performance. Practice, encouragement, and trust help each person do their part and give the whole team a better chance to succeed.</p>',
    },
    {
        name:'Fashion',slug:'fashion',description:'Personal style, modern trends, and thoughtful ways to build a wardrobe.',
        postSlug:'building-a-modern-wardrobe-that-feels-like-you',
        coverImage:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
        title:'Building a modern wardrobe that feels like you',
        excerpt:'Create a confident everyday style by choosing versatile pieces, experimenting with proportion, and wearing what feels authentic.',
        content:'<p>Personal style is less about following every trend and more about finding clothes that fit your life. Begin with a few versatile pieces you enjoy wearing, then use colour, texture, and accessories to make them your own.</p><h2>Build around what works</h2><p>Notice which shapes and fabrics feel comfortable and suit your routine. A thoughtful wardrobe makes it easier to combine pieces without sacrificing personality.</p><h2>Try something new</h2><p>Use one fresh detail, such as a bold layer or unexpected colour, to explore current trends at your own pace. Style is most compelling when it feels like you.</p>',
    },
    {
        name:'Culture',slug:'culture',description:'Contemporary Nigerian culture, creative traditions, and community stories.',
        postSlug:'igbo-community-and-contemporary-cultural-life',
        coverImage:'/media/categories/culture-igbo.jpg',
        title:'Igbo community and contemporary cultural life',
        excerpt:'A look at how gatherings, fashion, music, and shared experiences create space for Igbo heritage in modern city life.',
        content:'<p>Culture is carried forward through people meeting, sharing stories, and making new memories together. Contemporary gatherings create room for Igbo language, fashion, music, food, and community life to be experienced across generations.</p><h2>Making space to connect</h2><p>Community events bring together different ages and experiences. They can help younger people explore heritage in ways that feel welcoming and relevant to their own lives.</p><h2>Tradition in the present</h2><p>Culture continues to grow as people reinterpret familiar practices and create new ones. Listening to the people involved is one way to appreciate that variety without assuming one event represents every Igbo person.</p>',
    },
    {
        name:'Culture',slug:'culture',description:'Contemporary Nigerian culture, creative traditions, and community stories.',
        postSlug:'modern-hausa-style-and-textile-craft',
        coverImage:'/media/categories/culture-hausa.jpg',
        title:'Modern Hausa style and textile craft',
        excerpt:'Explore the colour, detail, and personal choices found in contemporary Hausa dress and design.',
        content:'<p>Clothing can be a form of personal expression as well as a connection to family and community. Contemporary Hausa dress brings together colour, fabric, tailoring, and individual choices in many different ways.</p><h2>Detail and design</h2><p>Look closely at the cut, surface patterns, and finishing to appreciate the care involved in a garment. Designers and wearers each bring their own ideas to how a look comes together.</p><h2>Style keeps changing</h2><p>Fashion is not fixed in time. New materials, settings, and preferences shape how people dress, while people decide for themselves which influences they want to adopt.</p>',
    },
    {
        name:'Culture',slug:'culture',description:'Contemporary Nigerian culture, creative traditions, and community stories.',
        postSlug:'yoruba-adire-and-new-creative-voices',
        coverImage:'/media/categories/culture-yoruba.jpg',
        title:'Yoruba adire and new creative voices',
        excerpt:'Meet the expressive patterns of Yoruba adire and the contemporary designers bringing the textile into new settings.',
        content:'<p>Adire is a Yoruba resist-dyed textile tradition recognised for its distinctive patterns. Contemporary makers and designers continue to explore the medium, connecting established techniques with new garments and creative settings.</p><h2>Patterns with character</h2><p>Each design offers a chance to notice the interplay of colour, shape, and process. Learning about a textile is richer when its makers and cultural context are part of the story.</p><h2>Creative work continues</h2><p>Designers can honour a tradition while experimenting with form and presentation. Their work shows how cultural practices can remain active and meaningful as they reach new audiences.</p>',
    },
];

await connectDB();
try{
    const admin=await User.findOne({role:'admin'}).sort({createdAt:1}).select('_id');
    if(!admin)throw new Error('Create an administrator account before seeding sample category posts.');

    await Category.findOneAndUpdate(
        {slug:'job'},
        {$set:{name:'Job',description:'Career opportunities, job search advice, and workplace insights.'},$setOnInsert:{slug:'job'}},
        {new:true,upsert:true,runValidators:true},
    );

    for(const sample of sampleContent){
        const {name,slug:categorySlug,description,postSlug,...post}=sample;
        const {media,coverImage,...postFields}=post;
        const category=await Category.findOneAndUpdate(
            {slug:categorySlug},
            {$set:{name,description},$setOnInsert:{slug:categorySlug}},
            {new:true,upsert:true,runValidators:true},
        );
        const incompletePost=await Post.findOne({title:post.title,slug:{$exists:false}});
        if(incompletePost){
            incompletePost.slug=postSlug;
            incompletePost.category=category._id;
            incompletePost.author=admin._id;
            incompletePost.status='published';
            incompletePost.publishedAt=new Date();
            incompletePost.tags=[categorySlug];
            incompletePost.coverImage=coverImage;
            if(media)incompletePost.media=media;
            await incompletePost.save();
            await Post.deleteMany({title:post.title,slug:{$in:[null,'']}});
            continue;
        }
        await Post.updateOne(
            {slug:postSlug},
            {$setOnInsert:{
                ...postFields,
                slug:postSlug,
                category:category._id,
                coverImage,
                author:admin._id,
                status:'published',
                featured:false,
                tags:[categorySlug],
                publishedAt:new Date(),
                ...(media?{media}:{}),
            }},
            {upsert:true},
        );
        const updates={coverImage};
        if(media)updates.media=media;
        await Post.updateOne({slug:postSlug},{$set:updates});
        await Post.deleteMany({title:post.title,slug:{$in:[null,'']}});
    }
    const categoryCount=new Set([...sampleContent.map(({slug})=>slug),'job']).size;
    console.log(`Ensured ${categoryCount} categories and ${sampleContent.length} sample posts.`);
}finally{
    await mongoose.disconnect();
}

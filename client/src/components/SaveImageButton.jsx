import React,{useState} from 'react';
import {Download} from 'lucide-react';

function imageFilename(title,type){
    const safeTitle=title.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').trim()||'post-image';
    const extension=type.split('/')[1]?.split('+')[0]||'jpg';
    return `${safeTitle}.${extension==='jpeg'?'jpg':extension}`;
}

export default function SaveImageButton({src,title}){
    const [saving,setSaving]=useState(false);
    const [message,setMessage]=useState('');

    async function saveImage(){
        if(saving)return;
        setSaving(true);
        setMessage('');
        try{
            const response=await fetch(src);
            if(!response.ok)throw new Error(`Image request failed with status ${response.status}.`);
            const blob=await response.blob();
            if(!blob.type.startsWith('image/'))throw new Error('The selected file is not an image.');
            const filename=imageFilename(title,blob.type);
            const imageFile=new File([blob],filename,{type:blob.type});

            if(navigator.share&&navigator.canShare?.({files:[imageFile]})){
                await navigator.share({files:[imageFile],title});
                setMessage('Image shared. Choose your device’s save-to-photos or gallery option.');
                return;
            }

            const downloadUrl=URL.createObjectURL(blob);
            const link=document.createElement('a');
            link.href=downloadUrl;
            link.download=filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
            setMessage('Image downloaded. Check your Downloads folder, then save it to Photos or Gallery if needed.');
        }catch(error){
            if(error.name==='AbortError')return;
            console.error('Could not save post image:',error);
            setMessage('Could not save this image. Open it in a new tab and use your browser’s Save Image option.');
        }finally{
            setSaving(false);
        }
    }

    return <div className="mt-3">
        <button type="button" onClick={saveImage} disabled={saving}
            className="btn inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 disabled:opacity-50">
            <Download size={17} aria-hidden="true"/>
            {saving?'Preparing image...':'Save image'}
        </button>
        {message&&<p role="status" className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
    </div>;
}

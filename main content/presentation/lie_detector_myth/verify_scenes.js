const fs=require('fs');
const script=fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/台本作成/嘘発見器は嘘を検出できない/script.md','utf8');
const html=fs.readFileSync('d:/myfolder/動画生成/ふぁくとラボ/main content/presentation/lie_detector_myth/index.html','utf8');
const scriptScenes=[];
let cur=null;
script.split('\n').forEach(l=>{
  if(l.includes('`')&&l.includes('SCENE:'))return;
  const m=l.match(/<!-- SCENE: (.+?) -->/);
  if(m){if(cur)scriptScenes.push(cur);cur={title:m[1]};return;}
});
if(cur)scriptScenes.push(cur);
const htmlComments=[];
const re=/<!-- Scene (\d+): (.+?) -->/g;
let cm;
while((cm=re.exec(html))!==null)htmlComments.push({id:+cm[1],desc:cm[2]});
console.log('台本SCENE: '+scriptScenes.length+' / HTML: '+htmlComments.length);
if(scriptScenes.length!==htmlComments.length){console.log('シーン数不一致! 台本='+scriptScenes.length+' HTML='+htmlComments.length);process.exit(1);}
let ok=true;
for(let i=0;i<scriptScenes.length;i++){
  const st=scriptScenes[i].title.split('|').pop().trim().substring(0,15);
  const ht=htmlComments[i]?.desc.substring(0,20)||'MISSING';
  const match=ht.includes(st.substring(0,8))||st.includes(ht.substring(0,8));
  console.log((match?'OK':'NG')+' Scene '+i+': script=['+scriptScenes[i].title+'] html=['+htmlComments[i]?.desc+']');
  if(!match)ok=false;
}
if(!ok){console.log('\nMISMATCH!');process.exit(1);}
console.log('\nAll scenes OK');

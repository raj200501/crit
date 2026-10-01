// Renders index.html frame by frame and encodes demo/out/family-health-tree-demo.{gif,mp4}
const {execSync}=require('child_process');const path=require('path');const fs=require('fs');
let pw;try{pw=require('playwright')}catch{pw=require(path.join(execSync('npm root -g').toString().trim(),'playwright'))}
(async()=>{const FPS=+process.env.FPS||20,dir=path.join(__dirname,'frames'),out=path.join(__dirname,'out');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(out,{recursive:true});
const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
await p.goto('file://'+path.join(__dirname,'index.html')+'?cap=1');await p.evaluate(()=>document.fonts.ready);const T=await p.evaluate(()=>T);
for(let i=0;i<T*FPS;i++){await p.evaluate(t=>R(t),i/FPS);await p.locator('#st').screenshot({path:path.join(dir,`f${String(i).padStart(4,'0')}.png`)})}
await b.close();
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f%04d.png -vf scale=1920:1080:flags=lanczos -c:v libx264 -pix_fmt yuv420p -crf 17 ${out}/family-health-tree-demo.mp4`);
execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${dir}/f%04d.png -vf "scale=1280:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" -loop 0 ${out}/family-health-tree-demo.gif`);
fs.rmSync(dir,{recursive:true,force:true});console.log('done');})();

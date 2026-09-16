// Minimal 3D engine. Geometry is lit in world space and rendered with a depth buffer.
const canvas=$('#world');const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
let yaw=.68,pitch=.71,zoom=22, vp, width=0,height=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function setZoom(d){zoom=Math.max(16,Math.min(31,zoom+d));}
$('#left').onclick=()=>yaw-=.22;$('#right').onclick=()=>yaw+=.22;$('#zoomIn').onclick=()=>setZoom(-1.5);$('#zoomOut').onclick=()=>setZoom(1.5);$('#home').onclick=()=>{yaw=.68;pitch=.71;zoom=22;};
const sub=(a,b)=>a.map((x,i)=>x-b[i]), norm=a=>{let d=Math.hypot(...a);return a.map(x=>x/d);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function mul(a,b){let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function look(eye,at){let z=norm(sub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
const rgb=h=>{let n=parseInt(h.replace('#',''),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
let verts=[], dynamicStart=0;function triangle(a,b,c,color){const n=norm(cross(sub(b,a),sub(c,a)));[a,b,c].forEach(v=>verts.push(...v,...n,...color));}
function box(x,y,z,w,h,d,color,rot=0){let c=rgb(color),co=Math.cos(rot),si=Math.sin(rot);let pts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,k])=>[x+a*w/2*co+k*d/2*si,y+b*h/2,z-a*w/2*si+k*d/2*co]);[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(q=>{triangle(pts[q[0]],pts[q[1]],pts[q[2]],c);triangle(pts[q[0]],pts[q[2]],pts[q[3]],c);});}
function cylinder(x,y,z,r,h,color,n=12,axis='y',r2=r){let c=rgb(color),point=(a,up,rr)=>axis==='x'?[x+up,y+Math.cos(a)*rr,z+Math.sin(a)*rr]:[x+Math.cos(a)*rr,y+up,z+Math.sin(a)*rr];for(let i=0;i<n;i++){let a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,p=point(a,-h/2,r),q=point(b,-h/2,r),s=point(a,h/2,r2),t=point(b,h/2,r2);triangle(p,s,t,c);triangle(p,t,q,c);triangle(point(0,h/2,0),t,s,c);triangle(point(0,-h/2,0),p,q,c);}}
function tree(x,z,size=1){cylinder(x,.6*size,z,.1*size,1.2*size,'#977a50',7);cylinder(x,1.5*size,z,.7*size,1.6*size,'#53805a',7,'y',.04);cylinder(x,2.15*size,z,.5*size,1.2*size,'#719a5f',7,'y',.02);}
function bush(x,z){cylinder(x,.4,z,.46,.8,'#769756',8,'y',.27);}
function building(x,z,w,d,h,color){box(x,h/2,z,w,h,d,color);box(x,h+.12,z,w+.25,.24,d+.25,'#f1ebd9');box(x,h+.31,z,w-.4,.14,d-.4,'#456657');for(let j=0;j<3;j++){let xx=x-w*.29+j*w*.29;box(xx,h*.55,z+d/2+.018,w*.22,h*.36,.06,'#548b8a');box(xx,h*.55,z+d/2+.056,.05,h*.38,.03,'#dbe3cf');}box(x+w/2+.02,h*.5,z,.04,h*.55,d*.65,'#4f8080');box(x,h*.14,z+d/2+.2,w+.4,.2,.5,'#e6e5cf');}
function model(){
 box(0,-.8,0,21,1.15,17,'#b0bf91');box(0,-.23,0,21.2,.16,17.2,'#d5dfb4');box(0,-.07,0,20.8,.18,16.8,'#a6bb83');
 box(0,.04,1.9,19.8,.1,2.3,'#7f9583');box(0,.045,-2.25,2.3,.11,10.5,'#7f9583');
 for(let x=-9;x<10;x+=1.65)box(x,.11,1.9,.75,.012,.08,'#e4e5bf');for(let z=-6;z<1;z+=1.6)box(0,.12,z,.08,.01,.7,'#e4e5bf');
 for(let x=-9;x<=9;x+=.68){box(x,.12,3.15,.42,.12,.18,x%1.36<.68?'#d7d7b7':'#f3ecb9');}
 box(-5,.08,-4.5,6.3,.2,4.8,'#d3d4b6');building(-5,-4.7,4.8,2.5,2.05,'#efe9d6');
 box(-5,1.72,-3.41,3.6,.48,.08,'#2d765d');box(-6.7,.54,-3.08,.35,1,.2,'#577f59');bush(-7.5,-3);
 box(4.7,.1,-4.7,6.5,.21,4.9,'#d0d3b5');building(4.8,-4.8,4.3,2.8,2.6,'#e6dcc1');
 // Solar modules on the verification office roof.
 for(let j=0;j<4;j++){box(3.5+j*.82,2.99,-4.8,.7,.13,1.7,'#294f59',0);for(let k=0;k<3;k++)box(3.5+j*.82,3.062,-5.3+k*.5,.68,.01,.025,'#7fadb0');}
 box(5.2,.1,5,6.2,.18,4,'#c8d4ab');for(let x of[3,7.2])for(let z of[3.9,6.1])cylinder(x,1.14,z,.055,2.2,'#788f63',7);box(5.1,2.3,5,4.8,.15,2.9,'#e7c75e');box(5.1,1.14,5.5,3,.15,.8,'#bda97b');for(let x of[4,6])box(x,.57,5.5,.13,1.1,.45,'#6b7d5b');
 for(let x of[4.2,5.1,6])box(x,1.26,5.5,.55,.065,.5,'#f9f3dd');
 // Concrete mixer, oriented along the road.
 box(-5.1,.67,4.7,3.6,.3,1.45,'#425b50');box(-3.7,1.23,4.7,1.05,1.05,1.5,'#e9bc47');box(-3.14,1.38,4.7,.04,.5,1.18,'#548a8c');box(-3.7,1.42,5.46,.62,.46,.03,'#538487');box(-3.7,1.42,3.94,.62,.46,.03,'#538487');box(-3.13,.8,4.7,.1,.2,1.6,'#e6e5cd');
 cylinder(-5.35,1.37,4.7,.75,1.7,'#eee9d4',14,'x',.48);cylinder(-5.15,1.37,4.7,.73,.25,'#dfad46',14,'x',.68);box(-6.65,.97,4.7,.7,.12,.4,'#a8afa0',-.18);
 for(let x of[-6,-4,-3.5])for(let z of[3.93,5.47]){cylinder(x,.55,z,.39,.18,'#364c43',12,'y');box(x,.5,z,.53,.59,.24,'#354941');cylinder(x,.54,z,.14,.63,'#b7bda3',10,'x');}
 // Small unfinished structure and tower crane.
 box(7.9,.2,-.25,2.4,.35,2.4,'#d1cbb0');for(let x of[7,8.8])for(let z of[-1.1,.7])box(x,1.35,z,.18,2.5,.18,'#c3be9e');box(7.9,2.55,-.2,2.5,.2,2.3,'#d6d0b5');
 const cx=8.9,cz=-1.8;box(cx,2.1,cz,.24,4.2,.25,'#d8a742');for(let y=.3;y<4;y+=.55){box(cx,y,cz,.7,.085,.5,'#d8a742');}box(7.2,4.35,cz,5.2,.18,.27,'#dfb34e');box(cx,4.65,cz,.7,.65,.7,'#e9c257');box(7.3,3.66,cz,.04,1.3,.04,'#546858');box(7.3,3,cz,.18,.17,.18,'#68765c');
 // Materials, planting, safety cones, fence and site lighting.
 for(let j=0;j<3;j++){box(-8.6,.16+j*.2,5.4,1.15,.16,1.2,'#b89c6b');for(let k=0;k<3;k++)box(-8.98+k*.36,.29+j*.2,5.4,.3,.11,1,'#d4c7a3');}
 for(let [x,z] of[[-2.3,3.6],[-2.3,5.8],[2,3.3],[7.8,3.1],[-7.1,3.4]]){box(x,.1,z,.4,.12,.4,'#536854');cylinder(x,.35,z,.16,.5,'#df9246',8,'y',.03);cylinder(x,.38,z,.108,.095,'#f0edcc',8,'y',.085);}
 for(let x=-9;x<=9;x+=1.4){box(x,.46,-7.5,.07,.9,.07,'#698967');}box(0,.78,-7.5,18.8,.07,.07,'#6c8a61');box(0,.35,-7.5,18.8,.07,.07,'#6c8a61');
 for(let [x,z,s] of[[-9,-6,1.1],[-9,-2,.9],[-8,7,1.1],[-4,7.1,.75],[.5,6.5,.85],[9,6.8,1.15],[9.5,-6.6,.8],[1.4,-6.7,.85],[-2.2,-6.9,.7]])tree(x,z,s);
 for(let [x,z] of[[-8.3,-6],[-8.6,-5.5],[-7.6,7],[-3,7.2],[8.7,6.8],[7.9,-6.4],[2.2,-6.8]])bush(x,z);
 for(let x of[-1.6,1.7]){cylinder(x,1.38,-1.4,.045,2.75,'#557762',7);box(x,2.77,-1.4,.45,.1,.22,'#f1dfa0');}

 // Meter, condenser fan, diesel tank, steel bundles and water / waste infrastructure.
 box(-7.3,1.3,-3.4,.65,1.05,.3,'#dae3d7');box(-7.3,1.5,-3.22,.42,.3,.035,'#355c58');
 box(-3.1,.55,-3.1,.95,.85,.55,'#ede8d9');cylinder(-3.1,.63,-2.8,.3,.08,'#6b8c83',16); 
 box(4.6,.5,-2.7,1.7,.8,.9,'#e4b54c');box(4.6,.97,-2.7,1.65,.13,.95,'#345b4b');
 for(let k=0;k<5;k++)cylinder(-7.5+k*.22,.35,3.7,.09,2,'#71847e',8,'x');
 cylinder(1.3,.65,-5.4,.65,1.2,'#78a9a2',16);box(1.3,1.28,-5.4,1.1,.08,1.1,'#d9e4d6');box(1.3,.65,-4.6,.12,1.1,.12,'#a9beb2');box(1.5,1.12,-4.6,.45,.12,.12,'#a9beb2');
 for(let j=0;j<3;j++){box(3.7+j*1.05,.55,6.8,.8,1,.75,['#557f60','#d4ab54','#6a99a1'][j]);box(3.7+j*1.05,1.1,6.8,.9,.12,.83,'#e7e4cc');}
 dynamicStart=verts.length;
}
// Smooth ellipsoid meshes: reusable topology with analytically correct normals.
const sphereCache=new Map();
function soft(x,y,z,rx,ry,rz,color,segments=16,rings=10){
 const key=segments+':'+rings;let mesh=sphereCache.get(key);
 if(!mesh){mesh=[];const point=(i,j)=>{let a=i/rings*Math.PI,b=j/segments*Math.PI*2;return [Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];};
 for(let i=0;i<rings;i++)for(let j=0;j<segments;j++){let a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);if(i>0)mesh.push(a,b,d);if(i<rings-1)mesh.push(b,c,d);}sphereCache.set(key,mesh);}
 const col=rgb(color);for(const v of mesh){const n=norm([v[0]/rx,v[1]/ry,v[2]/rz]);verts.push(x+v[0]*rx,y+v[1]*ry,z+v[2]*rz,...n,...col);}
}

let walkPhase=0,walkWeight=0,heading=0;
function advanceWalker(dt){
 const dx=target[0]-avatar[0],dz=target[2]-avatar[2],distance=Math.hypot(dx,dz);
 const waitingForTruck=(active===2&&performance.now()/1000-vehicleStart<4.3)||(active===1&&performance.now()/1000-carStart<4.3);
 const travel=waitingForTruck?0:Math.min(distance,2.4*dt);
 if(distance>.001&&!waitingForTruck){
  const wanted=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(wanted-heading),Math.cos(wanted-heading));
  heading+=delta*Math.min(1,dt*12);
  avatar[0]+=dx/distance*travel;avatar[2]+=dz/distance*travel;
  walkPhase+=travel/1.15*Math.PI*2;
 }
 const moving=distance>.001&&!waitingForTruck?1:0;
 walkWeight+=(moving-walkWeight)*Math.min(1,dt*14);
 if(!moving&&walkWeight<.001)walkWeight=0;
 return travel;
}
function character(worldX,worldZ,t){
 const first=verts.length,x=0,z=0;
 const swing=Math.sin(walkPhase)*walkWeight;
 const y=.02+(reduced?0:Math.abs(Math.sin(walkPhase))*walkWeight*.035);
 // Each foot swings forward while lifted, then returns along the ground.
 for(let side of[-1,1]){
  const phase=walkPhase+(side===1?Math.PI:0),stride=Math.cos(phase)*.23*walkWeight;
  const lift=Math.max(0,Math.sin(phase))*.14*walkWeight;
  const hip=[side*.15,y+.47,0],ankle=[side*.15,.13+lift,stride];
  const start=verts.length,cy=(hip[1]+ankle[1])/2,cz=(hip[2]+ankle[2])/2;
  const length=Math.hypot(hip[1]-ankle[1],hip[2]-ankle[2]);
  soft(side*.15,cy,cz,.135,length*.6,.14,'#4c5144',12,8);
  const angle=Math.atan2(hip[2]-ankle[2],hip[1]-ankle[1]),co=Math.cos(angle),si=Math.sin(angle);
  for(let k=start;k<verts.length;k+=9){let yy=verts[k+1]-cy,zz=verts[k+2]-cz;verts[k+1]=cy+co*yy-si*zz;verts[k+2]=cz+si*yy+co*zz;let ny=verts[k+4],nz=verts[k+5];verts[k+4]=co*ny-si*nz;verts[k+5]=si*ny+co*nz;}
  soft(side*.15,.09+lift,stride+.10,.16,.10,.24,'#755332',12,8);soft(side*.15,.035+lift,stride+.10,.165,.035,.245,'#303d35',12,6);
  // Arms counter-swing from shoulders.
  const armStart=verts.length,shoulderY=y+.9,angleArm=-side*swing*.48;
  soft(side*.39,y+.74,0,.135,.23,.15,'#385447',12,8);soft(side*.40,y+.54,.02,.105,.17,.11,'#edbd94',12,8);soft(side*.40,y+.40,.04,.12,.12,.11,'#efc49e',12,8);
  const ca=Math.cos(angleArm),sa=Math.sin(angleArm);
  for(let k=armStart;k<verts.length;k+=9){let yy=verts[k+1]-shoulderY,zz=verts[k+2];verts[k+1]=shoulderY+ca*yy-sa*zz;verts[k+2]=sa*yy+ca*zz;let ny=verts[k+4],nz=verts[k+5];verts[k+4]=ca*ny-sa*nz;verts[k+5]=sa*ny+ca*nz;}
 }
// Compact padded vest, big rounded head and safety helmet.
 soft(0,y+.70,0,.345,.34,.25,'#e69837');
 soft(0,y+.95,0,.22,.12,.19,'#375648');
 soft(0,y+1.29,.025,.34,.35,.30,'#efc49e',24,16);
 for(let side of[-1,1]){
  soft(side*.33,y+1.30,.02,.055,.075,.055,'#eab88f',12,8);
  soft(side*.12,y+1.36,.288,.040,.052,.017,'#453c2d',12,8);
  
  soft(side*.113,y+1.373,.304,.010,.012,.006,'#fff9ec',8,6);
  soft(side*.12,y+1.455,.27,.060,.018,.018,'#3b3027',12,6);
  soft(side*.19,y+1.25,.265,.055,.029,.012,'#efb294',12,6);
 }
 soft(0,y+1.30,.303,.047,.053,.040,'#efbd92',16,10);
 for(let j=0;j<7;j++){const u=(j-3)/3;soft(u*.065,y+1.18+u*u*.020,.285,.014,.009,.009,'#aa7459',8,6);}
 
 soft(0,y+1.59,-.01,.367,.20,.32,'#ef9d30',24,14);
 soft(0,y+1.49,.06,.408,.045,.355,'#ffb743',24,8);
 soft(0,y+1.66,.015,.028,.13,.28,'#ffc25c',12,10);
 // Reflective tape follows the vest front, with pockets and a leaf badge.
 for(let side of[-1,1]){
  soft(side*.22,y+.77,.191,.035,.22,.037,'#fff1bd',12,8);
  soft(side*.16,y+.55,.208,.112,.072,.053,'#d6842f',12,8);
 }
 soft(0,y+.66,.239,.30,.037,.027,'#f5edc9',16,8);
 box(0,y+.78,.256,.015,.31,.014,'#a76729');
 soft(.11,y+.86,.245,.047,.06,.018,'#f9f1d8',12,8);
 soft(.11,y+.865,.264,.022,.031,.009,'#4a8651',10,6);
 const co=Math.cos(heading),si=Math.sin(heading);
 for(let k=first;k<verts.length;k+=9){let xx=verts[k],zz=verts[k+2];verts[k]=worldX+co*xx+si*zz;verts[k+2]=worldZ-si*xx+co*zz;let nx=verts[k+3],nz=verts[k+5];verts[k+3]=co*nx+si*nz;verts[k+5]=-si*nx+co*nz;}
}
function marker(x,z,t,i){let c=stationDone(i)?'#659452':'#efc345';cylinder(x,.025,z,1,.035,c,32);cylinder(x,.045,z,.78,.04,'#c9d6aa',32);if(!stationDone(i)){let y=2.5+(reduced?0:Math.sin(t*2.5)*.12);cylinder(x,y,z,.18,.35,'#edbb44',4,'y',.02);}}

function siteAction(t){
 if(active===1){
 const elapsed=Math.max(0,t-carStart),q=reduced?1:Math.min(1,elapsed/4);
 // Smooth deceleration along a cubic turn, with heading from its tangent.
 const u=1-Math.pow(1-q,2),v=1-u;
 const x=v*v*v*9+3*v*v*u*5+3*v*u*u*5+u*u*u*5;
 const z=v*v*v*1.9+3*v*v*u*1.9+3*v*u*u*1.1+u*u*u*.1;
 const dx=3*v*v*(5-9),dz=6*v*u*(1.1-1.9)+3*u*u*(.1-1.1);
 const angle=Math.atan2(dz,dx)-Math.PI;
 const firstCar=verts.length;
 // Car faces local -X. The entire chassis turns as one rigid body.
 box(0,.64,0,2.2,.5,1.05,'#e7b94f');box(.1,1.06,0,1.15,.46,.94,'#e9c970');
 box(.1,1.12,.48,.93,.28,.018,'#64968f');box(.1,1.12,-.48,.93,.28,.018,'#64968f');
 for(let side of[-1,1])for(let axle of[-.72,.72]){
  const wheelStart=verts.length;
  box(axle,.34,side*.54,.45,.45,.16,'#344b40');
  box(axle,.34,side*.63,.19,.19,.015,'#b9c5af');
  const roll=u*24,cr=Math.cos(roll),sr=Math.sin(roll);
  for(let k=wheelStart;k<verts.length;k+=9){const xx=verts[k]-axle,yy=verts[k+1]-.34;verts[k]=axle+cr*xx-sr*yy;verts[k+1]=.34+sr*xx+cr*yy;const nx=verts[k+3],ny=verts[k+4];verts[k+3]=cr*nx-sr*ny;verts[k+4]=sr*nx+cr*ny;}
 }
 box(-.99,.72,0,.04,.13,.76,'#f7e3ad');
 box(1.11,.73,-.33,.015,.12,.18,q>.75?'#ef755a':'#a75b40');box(1.11,.73,.33,.015,.12,.18,q>.75?'#ef755a':'#a75b40');
 const ca=Math.cos(angle),sa=Math.sin(angle);
 for(let k=firstCar;k<verts.length;k+=9){let xx=verts[k],zz=verts[k+2];verts[k]=x+ca*xx-sa*zz;verts[k+2]=z+sa*xx+ca*zz;let nx=verts[k+3],nz=verts[k+5];verts[k+3]=ca*nx-sa*nz;verts[k+5]=sa*nx+ca*nz;}

 if(fuelRunning){for(let j=0;j<6;j++){const u=reduced?j/6:(t*.6+j/6)%1;box(4.6+u*.4,.73,-2.2+u*1.75,.04,.04,.09,'#eac956');}}
 }

 // A gravel truck enters on the road and stops; it remains distinct from the concrete case.
 if(active===2){const elapsed=Math.max(0,t-vehicleStart),progress=reduced?1:Math.min(elapsed/4,1),x=8-progress*12,z=1.9;
 box(x,.55,z,3.5,.23,1.35,'#385e4c');box(x-1.25,1.1,z,.9,.95,1.28,'#dfac44');box(x-1.71,1.25,z,.03,.42,.92,'#8db7b2');
 box(x+.5,1.03,z,2.25,.65,1.35,'#84917a');box(x+.5,1.4,z,2.1,.15,1.18,'#c5b997');
 for(let j=0;j<9;j++)box(x-.35+(j%3)*.65,1.58+Math.sin(j)*.08,z-.35+Math.floor(j/3)*.32,.38,.3,.27,'#b8b397',j*.3);
 for(let a of[-1.1,1])for(let b of[-.7,.7]){box(x+a,.42,z+b,.57,.57,.18,'#304c42');box(x+a,.42,z+b*1.03,.22,.22,.03,'#d2d5bd',reduced?0:progress*15);}
 }
 if(waterRunning){for(let j=0;j<9;j++){const fall=reduced?j/9:((t*1.5+j/9)%1);box(1.7,1.06-fall*.9,-4.6,.045,.085,.045,'#62b9cf');}}
 if(active===0&&lightsOn){for(let j=0;j<3;j++)box(-6.39+j*1.39,1.13,-3.405,.96,.62,.012,'#f2d67a');}
 if(active===1){const vibration=reduced?0:Math.sin(t*28)*.013;box(4.6,.97+vibration,-2.7,1.65,.13,.95,'#345b4b');cylinder(4.6,1.08,-2.7,.07,.05,'#e3c456',8);}
}

if(gl){
 const vertex=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uVP;varying vec3 vColor;varying float vLight;void main(){gl_Position=uVP*vec4(aPos,1.0);vColor=aColor;vLight=.57+.43*max(dot(normalize(aNormal),normalize(vec3(-.6,1.0,.5))),0.0);}`;
 const fragment=`precision mediump float;varying vec3 vColor;varying float vLight;void main(){gl_FragColor=vec4(vColor*vLight,1.0);}`;
 function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);['aPos','aNormal','aColor'].forEach((n,i)=>{let a=gl.getAttribLocation(program,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12);});let uVP=gl.getUniformLocation(program,'uVP');gl.enable(gl.DEPTH_TEST);gl.clearColor(.914,.941,.871,1);model();const base=new Float32Array(verts);
 let pointer=null, last=0;canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(pointer){yaw+=(e.clientX-pointer.x)*.006;pitch=Math.max(.35,Math.min(1.15,pitch+(e.clientY-pointer.y)*.004));pointer={x:e.clientX,y:e.clientY};}});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(e.deltaY*.015);},{passive:false});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>location.reload());
 function frame(ms){const t=ms/1000,dt=Math.min((ms-last)/1000,.06);last=ms;width=canvas.clientWidth;height=canvas.clientHeight;const ratio=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);gl.viewport(0,0,canvas.width,canvas.height);}const aspect=width/height,mobile=width<620;const viewSize=mobile?zoom*2.4:zoom;const eye=[Math.sin(yaw)*24*Math.cos(pitch),24*Math.sin(pitch),Math.cos(yaw)*24*Math.cos(pitch)];let shift=mobile?0:width<1000?1:1.3;vp=mul(ortho(-viewSize*aspect/2+shift,viewSize*aspect/2+shift,-viewSize/2+(mobile?-1.8:1.3),viewSize/2+(mobile?-1.8:1.3),.1,90),look(eye,[0,0,0]));gl.uniformMatrix4fv(uVP,false,vp);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 verts=[];advanceWalker(dt);checkArrival();character(avatar[0],avatar[2],t);siteAction(t);tasks.forEach((s,i)=>marker(s.pos[0],s.pos[2]+1,t,i));const dyn=new Float32Array(verts);const all=new Float32Array(base.length+dyn.length);all.set(base);all.set(dyn,base.length);gl.bufferData(gl.ARRAY_BUFFER,all,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,all.length/9);
 $$('.pin').forEach((el,i)=>{const p=tasks[i].pos;let v=[p[0],p[1]+.65,p[2],1],r=[0,0,0,0];for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[j]+=vp[k*4+j]*v[k];el.style.left=(r[0]/r[3]+1)*width/2+'px';el.style.top=(1-r[1]/r[3])*height/2+'px';});requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}else{$('#fallback').hidden=false;$('#pins').style.display='none';}

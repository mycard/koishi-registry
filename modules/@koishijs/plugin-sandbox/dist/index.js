import{computed as L,defineComponent as B,openBlock as i,createElementBlock as k,createElementVNode as c,toDisplayString as y,createVNode as u,unref as o,ref as $,watch as M,resolveComponent as m,createBlock as w,withCtx as p,Fragment as T,renderList as W,normalizeClass as q,KeepAlive as G}from"../vue.js";import{createStorage as J,receive as S,MessageContent as P,Schema as U,store as z,clone as Q,deepEqual as R,send as V,VirtualList as X,ChatInput as Y,message as Z,icons as ee}from"../client.js";const se={private:"\u79C1\u804A\u6A21\u5F0F",guild:"\u7FA4\u804A\u6A21\u5F0F",profile:"\u7528\u6237\u8BBE\u7F6E"},e=J("sandbox",1,()=>({user:"",index:0,messages:{},panelType:"private"})),v=L(()=>e.panelType==="guild"?"#":"@"+e.user);S("sandbox",a=>{var r,n;((r=e.messages)[n=a.channel]||(r[n]=[])).push(a)});S("sandbox/delete",({id:a,channel:r})=>{const n=e.messages[r];n&&(e.messages[r]=n.filter(f=>f.id!==a))});S("sandbox/clear",()=>{e.messages[v.value]=[]});const te=["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Hank","Ivy","Jack","Kathy","Lily","Mandy","Nancy","Oscar","Peggy","Quinn","Randy","Sandy","Toby","Uma","Vicky","Wendy","Xander","Yvonne","Zoe"],ne={class:"chat-message"},ae={class:"avatar"},oe={class:"nickname"},le={class:"message-box"},ce=B({__name:"message",props:{data:null},setup(a){return(r,n)=>(i(),k("div",ne,[c("div",ae,y(a.data.user[0]),1),c("div",oe,y(a.data.user),1),c("div",le,[u(o(P),{content:a.data.content},null,8,["content"])])]))}});const E=(a,r)=>{const n=a.__vccOpts||a;for(const[f,x]of r)n[f]=x;return n},re=E(ce,[["__scopeId","data-v-cc500173"]]),ie={class:"user-container"},ue={class:"avatar"},de={class:"nick"},_e=["onClick"],me={class:"card-header"},pe=["onClick"],ve=c("div",null,"\u70B9\u51FB\u300C\u6DFB\u52A0\u7528\u6237\u300D\u5F00\u59CB\u4F53\u9A8C",-1),fe={class:"card-footer"},he=B({__name:"index",setup(a){const r=U.object({authority:U.natural().description("\u6743\u9650\u7B49\u7EA7").default(1)}),n=L(()=>Object.keys(e.messages).filter(s=>s.startsWith("@")).map(s=>s.slice(1))),f=L(()=>Object.fromEntries(n.value.map(s=>[s,{name:s}]))),x=10;function O(){if(n.value.length>=x)return Z.error("\u53EF\u521B\u5EFA\u7684\u7528\u6237\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\u3002");let s;do s=te[e.index++],e.index%=x;while(n.value.includes(s));e.user=s,e.messages["@"+s]=[],V("sandbox/user",e.user,{})}function A(s){const t=n.value.indexOf(s);delete e.messages["@"+s],V("sandbox/user",e.user,null),e.user===s&&(e.user=n.value[t]||"")}const h=$(""),d=$(0);function j(s){if(s.key==="ArrowUp"){const t=e.messages[v.value].filter(g=>g.user===e.user);let _=t.length-d.value;t[_-1]&&(d.value++,h.value=t[_-1].content)}else if(s.key==="ArrowDown"){const t=e.messages[v.value].filter(g=>g.user===e.user);let _=t.length-d.value;t[_+1]?(d.value--,h.value=t[_+1].content):d.value&&(d.value=0,h.value="")}}const b=$();M(()=>{var s;return(s=z.sandbox)==null?void 0:s[e.user]},s=>{b.value=Q(s)},{immediate:true}),M(b,s=>{var t;R(s,(t=z.sandbox)==null?void 0:t[e.user])||V("sandbox/user",e.user,s)},{deep:true});function D(s){d.value=0,V("sandbox/message",e.user,v.value,s)}return(s,t)=>{const _=m("k-icon"),g=m("k-tab-group"),F=m("el-scrollbar"),H=m("k-empty"),I=m("k-form"),K=m("k-content"),N=m("k-layout");return i(),w(N,{class:"page-sandbox"},{left:p(()=>[c("div",{class:"card-header k-menu-item",onClick:O},"\u6DFB\u52A0\u7528\u6237"),c("div",ie,[u(F,null,{default:p(()=>[u(g,{data:o(f),modelValue:o(e).user,"onUpdate:modelValue":t[0]||(t[0]=l=>o(e).user=l)},{default:p(({name:l})=>[c("div",ue,y(l[0]),1),c("div",de,y(l),1),c("div",{class:"close",onClick:C=>A(l)},[u(_,{name:"times-full"})],8,_e)]),_:1},8,["data","modelValue"])]),_:1})])]),default:p(()=>[c("div",me,[(i(true),k(T,null,W(o(se),(l,C)=>(i(),k("span",{key:C,class:q(["k-horizontal-tab-item",{active:o(e).panelType===C}]),onClick:we=>o(e).panelType=C},y(l),11,pe))),128))]),(i(),w(G,null,[o(n).length?o(e).panelType==="profile"?(i(),w(K,{key:"profile"+o(v)},{default:p(()=>[u(I,{instant:"",modelValue:b.value,"onUpdate:modelValue":t[1]||(t[1]=l=>b.value=l),schema:o(r),"show-header":false},null,8,["modelValue","schema"])]),_:1})):(i(),k(T,{key:2},[u(o(X),{data:o(e).messages[o(v)]||[],pinned:""},{default:p(l=>[u(re,{data:l},null,8,["data"])]),_:1},8,["data"]),c("div",fe,[u(o(Y),{modelValue:h.value,"onUpdate:modelValue":t[2]||(t[2]=l=>h.value=l),onSend:D,onKeydown:j},null,8,["modelValue"])])],64)):(i(),w(H,{key:"empty"},{default:p(()=>[ve]),_:1}))],1024))]),_:1})}}});const ge={},ke={class:"k-icon",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 448 512"},ye=c("path",{fill:"currentColor",d:"M437.2 403.5L319.1 215l.0001-135C319.1 71.16 312.8 64 303.1 64S288 71.16 288 79.1L287.1 215c0 5.973 1.672 11.83 4.826 16.9L347.6 320H100.4l54.79-88.1C158.3 226.8 160 220.1 160 215L160 79.1C160 71.16 152.8 64 144 64S128 71.16 128 79.1L128 215l-117.2 188.5C-18.48 450.6 15.27 512 70.89 512h306.2C432.7 512 466.5 450.5 437.2 403.5zM410.9 460C407.6 466 397.6 480 377.1 480H70.89c-20.51 0-30.48-13.95-33.82-19.95c-7.025-12.63-6.691-27.46 .873-39.65L80.48 352h287l42.55 68.41C417.6 432.6 417.1 447.4 410.9 460zM112 32h224C344.8 32 352 24.84 352 16S344.8 0 336 0h-224C103.2 0 96 7.156 96 16S103.2 32 112 32z"},null,-1),xe=[ye];function be(a,r){return i(),k("svg",ke,xe)}const Ce=E(ge,[["render",be]]);ee.register("activity:flask",Ce);const Le=a=>{a.page({name:"\u6C99\u76D2",path:"/sandbox",icon:"activity:flask",order:300,authority:4,component:he})};export{Le as default};

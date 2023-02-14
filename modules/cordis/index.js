import{defineProperty as k}from"https://registry.koishi.chat/modules/cosmokit/index.js";import{defineProperty as v,remove as R}from"https://registry.koishi.chat/modules/cosmokit/index.js";import{defineProperty as H}from"https://registry.koishi.chat/modules/cosmokit/index.js";import{deepEqual as I,defineProperty as m,remove as b}from"https://registry.koishi.chat/modules/cosmokit/index.js";import{defineProperty as L}from"https://registry.koishi.chat/modules/cosmokit/index.js";var A=Object.defineProperty,C=(t,e,s)=>e in t?A(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s,l=(t,e)=>A(t,"name",{value:e,configurable:!0}),f=(t,e,s)=>(C(t,typeof e!="symbol"?e+"":e,s),s);function x(t){return t!==null&&t!==!1&&t!==void 0}l(x,"isBailed");var S=class{constructor(t){this.root=t,v(this,n.current,t),v(this.on("internal/hook",function(e,s,r){let i=r?"unshift":"push",{scope:o}=this[n.current],{runtime:c,disposables:a}=o;if(e==="ready"&&this.isActive)o.ensure(async()=>s());else{if(e==="dispose")return a[i](s),v(s,"name","event <dispose>"),()=>R(a,s);if(e==="fork")return c.forkables[i](s),o.collect("event <fork>",()=>R(c.forkables,s))}}),n.static,t.scope)}isActive=!1;_tasks=new Set;_hooks={};queue(t){this[n.current].scope.ensure(async()=>t)}async flush(){for(;this._tasks.size;)await Promise.all(Array.from(this._tasks))}*getHooks(t,e){let s=this._hooks[t]||[];for(let[r,i]of s.slice()){let o=e?.[n.filter];o&&!o.call(e,r)||(yield i)}}async parallel(...t){let e=typeof t[0]=="object"?t.shift():null,s=t.shift();await Promise.all([...this.getHooks(s,e)].map(async r=>{await r.apply(e,t)}))}emit(...t){let e=typeof t[0]=="object"?t.shift():null,s=t.shift();for(let r of this.getHooks(s,e))r.apply(e,t)}async serial(...t){let e=typeof t[0]=="object"?t.shift():null,s=t.shift();for(let r of this.getHooks(s,e)){let i=await r.apply(e,t);if(x(i))return i}}bail(...t){let e=typeof t[0]=="object"?t.shift():null,s=t.shift();for(let r of this.getHooks(s,e)){let i=r.apply(e,t);if(x(i))return i}}register(t,e,s,r){let i=this.root.config.maxListeners;e.length>=i&&this.root.emit("internal/warning",`max listener count (${i}) for ${t} exceeded, which may be caused by a memory leak`);let o=this[n.current];return e[r?"unshift":"push"]([o,s]),o.state.collect(t,()=>this.unregister(e,s))}unregister(t,e){let s=t.findIndex(([r,i])=>i===e);if(s>=0)return t.splice(s,1),!0}on(t,e,s=!1){let r=this.bail(this,"internal/hook",t,e,s);if(r)return r;let i=this._hooks[t]||=[],o=typeof t=="string"?`event <${t}>`:"event (Symbol)";return this.register(o,i,e,s)}once(t,e,s=!1){let r=this.on(t,function(...i){return r(),e.apply(this,i)},s);return r}off(t,e){return this.unregister(this._hooks[t]||[],e)}async start(){this.isActive=!0;let t=this._hooks.ready||[];for(;t.length;){let[e,s]=t.shift();e.scope.ensure(async()=>s())}await this.flush()}async stop(){this.isActive=!1,this.root.scope.reset()}};l(S,"Lifecycle");f(S,"methods",["on","once","off","before","after","parallel","emit","serial","bail","start","stop"]);function _(t){return!(!t.prototype||t.prototype.constructor!==t)}l(_,"isConstructor");function g(t){return Object.getPrototypeOf(t).constructor}l(g,"getConstructor");function d(t,e){if(e===!1)return;e===!0&&(e=void 0),e??={};let s=t.Config||t.schema;return s&&t.schema!==!1&&(e=s(e)),e}l(d,"resolveConfig");var P=class{constructor(t,e){this.parent=t,this.config=e,this.uid=t.registry?t.registry.counter:0,this.ctx=this.context=t.extend({scope:this}),this.proxy=new Proxy({},{get:(s,r)=>Reflect.get(this.config,r)})}uid;ctx;disposables=[];error;status="pending";proxy;context;acceptors=[];tasks=new Set;hasError=!1;get _config(){return this.runtime.isReactive?this.proxy:this.config}collect(t,e){let s=m(()=>(b(this.disposables,s),e()),"name",t);return this.disposables.push(s),s}restart(){this.reset(),this.start()}_getStatus(){return this.uid===null?"disposed":this.hasError?"failed":this.tasks.size?"loading":this.ready?"active":"pending"}_updateStatus(t){let e=this.status;t?.(),this.status=this._getStatus(),e!==this.status&&this.context.emit("internal/status",this,e)}ensure(t){let e=t().catch(s=>{this.context.emit("internal/warning",s),this.cancel(s)}).finally(()=>{this._updateStatus(()=>this.tasks.delete(e)),this.context.events._tasks.delete(e)});this._updateStatus(()=>this.tasks.add(e)),this.context.events._tasks.add(e)}cancel(t){this.error=t,this._updateStatus(()=>this.hasError=!0),this.reset()}setup(){this.runtime.using.length&&(m(this.context.on("internal/before-service",t=>{this.runtime.using.includes(t)&&(this._updateStatus(),this.reset())}),n.static,this),m(this.context.on("internal/service",t=>{this.runtime.using.includes(t)&&this.start()}),n.static,this))}get ready(){return this.runtime.using.every(t=>this.ctx[t])}reset(){this.disposables=this.disposables.splice(0,1/0).filter(t=>{if(this.uid!==null&&t[n.static]===this)return!0;t()})}accept(...t){let e=Array.isArray(t[0])?t.shift():null,s={keys:e,callback:t[0],...t[1]};return this.acceptors.push(s),s.immediate&&s.callback?.(this.config),this.collect(`accept <${e?.join(", ")||"*"}>`,()=>b(this.acceptors,s))}decline(t){return this.accept(t,()=>!0)}checkUpdate(t,e){if(e)return[!0,!0];if(e===!1)return[!1,!1];let s=Object.create(null),r=l(h=>{let u=s[h]??=!I(this.config[h],t[h]);return o||=u,u},"checkPropertyUpdate"),i=new Set,o=!1,c=!1,a=this.runtime.isReactive||null;for(let{keys:h,callback:u,passive:p}of this.acceptors){if(!h)a||=!p;else if(p)h?.forEach(y=>i.add(y));else{let y=!1;for(let F of h)y||=r(F);if(!y)continue}u?.(t)&&(c=!0)}for(let h in{...this.config,...t})if(a!==!1&&!(h in s)&&!i.has(h)){let u=r(h);a===null&&(c||=u)}return[o,c]}};l(P,"EffectScope");var E=class extends P{constructor(t,e,s){super(t,e),this.runtime=s,this.dispose=m(t.scope.collect(`fork <${t.runtime.name}>`,()=>{this.uid=null,this.reset();let r=b(s.disposables,this.dispose);return b(s.children,this)&&!s.children.length&&t.registry.delete(s.plugin),this.context.emit("internal/fork",this),r}),n.static,s),s.children.push(this),s.disposables.push(this.dispose),this.context.emit("internal/fork",this),s.isReusable&&this.setup(),this.start()}dispose;start(){if(this.ready){this._updateStatus(()=>this.hasError=!1);for(let t of this.runtime.forkables)this.ensure(async()=>t(this.context,this._config))}}update(t,e){let s=this.config,r=this.runtime.isForkable?this:this.runtime;if(r.config!==s)return;let i=d(this.runtime.plugin,t),[o,c]=r.checkUpdate(i,e);this.context.emit("internal/before-update",this,t),this.config=i,r.config=i,o&&this.context.emit("internal/update",this,s),c&&r.restart()}};l(E,"ForkScope");var w=class extends P{constructor(t,e,s){super(t[n.current],s),this.plugin=e,t.set(e,this),e&&this.setup()}runtime=this;schema;using=[];forkables=[];children=[];isReusable=!1;isReactive=!1;get isForkable(){return this.forkables.length>0}get name(){if(!this.plugin)return"root";let{name:t}=this.plugin;return!t||t==="apply"?"anonymous":t}fork(t,e){return new E(t,e,this)}dispose(){return this.uid=null,this.reset(),this.context.emit("internal/runtime",this),!0}setup(){this.schema=this.plugin.Config||this.plugin.schema,this.using=this.plugin.using||[],this.isReusable=this.plugin.reusable,this.isReactive=this.plugin.reactive,this.context.emit("internal/runtime",this),this.isReusable?this.forkables.push(this.apply):super.setup(),this.restart()}apply=(t,e)=>{let s=this.plugin;if(typeof s!="function")this.ensure(async()=>s.apply(t,e));else if(_(s)){let r=new s(t,e),i=r[n.immediate];i&&(t[i]=r),r.fork&&this.forkables.push(r.fork.bind(r))}else this.ensure(async()=>s(t,e))};reset(){super.reset();for(let t of this.children)t.reset()}start(){if(this.ready){this._updateStatus(()=>this.hasError=!1),!this.isReusable&&this.plugin&&this.apply(this.context,this._config);for(let t of this.children)t.start()}}update(t,e){this.isForkable&&this.context.emit("internal/warning",`attempting to update forkable plugin "${this.plugin.name}", which may lead to unexpected behavior`);let s=this.config,r=d(this.runtime.plugin||g(this.context),t),[i,o]=this.checkUpdate(r,e),c=this.children.find(a=>a.config===s);this.config=r,c&&(this.context.emit("internal/before-update",c,t),c.config=r,i&&this.context.emit("internal/update",c,s)),o&&this.restart()}};l(w,"MainScope");function U(t){return t&&typeof t=="object"&&typeof t.apply=="function"}l(U,"isApplicable");var j=class extends Map{constructor(t,e){super(),this.root=t,H(this,n.current,t),t.scope=new w(this,null,e),t.scope.runtime.isReactive=!0}_counter=0;get counter(){return++this._counter}resolve(t){return t&&(typeof t=="function"?t:t.apply)}get(t){return super.get(this.resolve(t))}has(t){return super.has(this.resolve(t))}set(t,e){return super.set(this.resolve(t),e)}delete(t){t=this.resolve(t);let e=this.get(t);return e?(super.delete(t),e.dispose()):!1}using(t,e){return this.plugin({using:t,apply:e,name:e.name})}plugin(t,e){if(typeof t!="function"&&!U(t))throw new Error('invalid plugin, expect function or object with an "apply" method');if(e=d(t,e),!e)return;let s=this[n.current],r=this.get(t);return r?(r.isForkable||this.root.emit("internal/warning",`duplicate plugin detected: ${t.name}`),r.fork(s,e)):(r=new w(this,t,e),r.fork(s,e))}dispose(t){return this.delete(t)}};l(j,"Registry");f(j,"methods",["using","plugin","dispose"]);var $=class{constructor(t){let e=d(g(this),t),s=l(r=>{if(r){s(Object.getPrototypeOf(r));for(let i of Object.getOwnPropertySymbols(r))this[i]=new r[i](this,e)}},"attach");this.root=this,this.mapping=Object.create(null),s(this[$.internal])}[Symbol.for("nodejs.util.inspect.custom")](){return`Context <${this.runtime.name}>`}get events(){return this.lifecycle}get state(){return this.scope}extend(t={}){return Object.assign(Object.create(this),t)}isolate(t){let e=Object.create(this.mapping);for(let s of t)e[s]=Symbol(s);return this.extend({mapping:e})}},n=$;l(n,"Context");f(n,"config",Symbol("config"));f(n,"events",Symbol("events"));f(n,"static",Symbol("static"));f(n,"filter",Symbol("filter"));f(n,"source",Symbol("source"));f(n,"current",Symbol("current"));f(n,"internal",Symbol("internal"));f(n,"immediate",Symbol("immediate"));(t=>{function e(i,o){for(let c of o.methods||[])k(t.prototype,c,function(...a){return this[i][c](...a)});for(let c of o.properties||[])Object.defineProperty(t.prototype,c,{configurable:!0,get(){return this[i][c]},set(a){this[i][c]=a}})}t.mixin=e,l(e,"mixin");function s(i,o={}){let c=typeof i=="symbol"?i:Symbol(i);if(Object.defineProperty(this.prototype,i,{configurable:!0,get(){let a=this.mapping[i]||c,h=this.root[a];if(h)return k(h,t.current,this),h},set(a){let h=this.mapping[i]||c,u=this.root[h];if(u===a)return;let p=Object.create(null);if(p[t.filter]=O=>this.mapping[i]===O.mapping[i],a&&u&&typeof i=="string")throw new Error(`service ${i} has been registered`);typeof i=="string"&&this.emit(p,"internal/before-service",i,a),this.root[h]=a,a&&typeof a=="object"&&k(a,t.source,this),typeof i=="string"&&this.emit(p,"internal/service",i,u)}}),_(o)){let a=r(this.prototype);a[c]=o}e(i,o)}t.service=s,l(s,"service");function r(i){if(Object.prototype.hasOwnProperty.call(i,t.internal))return i[t.internal];let o=r(Object.getPrototypeOf(i));return i[t.internal]=Object.create(o)}l(r,"ensureInternal")})(n||(n={}));n.prototype[n.internal]=Object.create(null);n.service("registry",j);n.service("lifecycle",S);n.mixin("state",{properties:["config","runtime"],methods:["collect","accept","decline"]});var M=class{constructor(t,e,s){this.ctx=t,g(t.root).service(e),L(this,n.current,t),s&&(this[n.immediate]=e),t.on("ready",async()=>{await Promise.resolve(),await this.start(),t[e]=this}),t.on("dispose",async()=>{t[e]=null,await this.stop()})}start(){}stop(){}get caller(){return this[n.current]}};l(M,"Service");export{n as Context,P as EffectScope,E as ForkScope,S as Lifecycle,w as MainScope,j as Registry,M as Service,g as getConstructor,U as isApplicable,x as isBailed,_ as isConstructor,d as resolveConfig};

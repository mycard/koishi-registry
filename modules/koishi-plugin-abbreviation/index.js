var c=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var g=Object.prototype.hasOwnProperty;var h=(n,t)=>()=>(n&&(t=n(n=0)),t);var b=(n,t)=>()=>(t||n((t={exports:{}}).exports,t),t.exports);var u=(n,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of m(t))!g.call(n,i)&&i!==o&&c(n,i,{get:()=>t[i],enumerable:!(a=f(t,i))||a.enumerable});return n},p=(n,t,o)=>(u(n,t,"default"),o&&u(o,t,"default"));var j=n=>u(c({},"__esModule",{value:!0}),n);var r={};import*as P from"https://registry.koishi.chat/modules/koishi/index.js";var l=h(()=>{p(r,P)});var k=b(e=>{Object.defineProperty(e,"__esModule",{value:!0});e.apply=e.Config=e.name=void 0;var d=(l(),j(r));e.name="abbr";e.Config=d.Schema.object({endpoint:d.Schema.string().role("link").default("https://lab.magiconch.com/api/nbnhhsh/guess").description("API 地址。")});function v(n){return n.trans?n.trans.join(", "):n.inputting?n.inputting.join(", "):"未找到对应的缩写。"}function _(n,t){n.command("abbr <text:text>","中文缩写查询").action(async(o,a)=>{if(!a)return"请输入文本。";let i=await n.http.post(t.endpoint,{text:a});return i?.length?i.map(s=>`${s.name}：${v(s)}`).join(`
`):"未提取到输入文本。"})}e.apply=_});export default k();

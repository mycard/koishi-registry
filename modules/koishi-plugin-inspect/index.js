var p=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var o=Object.getOwnPropertyNames;var g=Object.prototype.hasOwnProperty;var h=(t,e)=>()=>(t&&(e=t(t=0)),e);var l=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var d=(t,e,r,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of o(e))!g.call(t,n)&&n!==r&&p(t,n,{get:()=>e[n],enumerable:!(i=f(e,n))||i.enumerable});return t},u=(t,e,r)=>(d(t,e,"default"),r&&d(r,e,"default"));var D=t=>d(p({},"__esModule",{value:!0}),t);var c={};import*as _ from"https://registry.koishi.chat/modules/koishi/index.js";var m=h(()=>{u(c,_)});var s=l((b,x)=>{x.exports={commands:{inspect:{description:"查看用户、频道或消息的详细信息",usage:`inspect @user
inspect #channel
inspect`,messages:{invalid:"参数无法解析。",user:"用户 ID：{id}",channel:"频道 ID：{id}",message:`消息 ID：{messageId}
频道 ID：{channelId}
群组 ID：{guildId}
用户 ID：{userId}
自身 ID：{selfId}`}}}}});var q=l(a=>{Object.defineProperty(a,"__esModule",{value:!0});a.apply=a.Config=a.name=void 0;var I=(m(),D(c));a.name="inspect";a.Config=I.Schema.object({});function y(t){t.i18n.define("zh",s()),t.command("inspect").action(({session:e},r)=>{if(e.quote)return e.text(".message",{...e.quote,selfId:e.selfId});if(r){let{type:i,data:n}=I.segment.parse(r)[0];return i==="at"?e.text(".user",n):i==="sharp"?e.text(".channel",n):e.text(".invalid")}return e.text(".message",e)})}a.apply=y});export default q();

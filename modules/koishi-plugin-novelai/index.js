var ie=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var ze=Object.getOwnPropertyNames;var Ie=Object.prototype.hasOwnProperty;var Ee=(t,e)=>()=>(t&&(e=t(t=0)),e);var x=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var V=(t,e,n,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of ze(e))!Ie.call(t,o)&&o!==n&&ie(t,o,{get:()=>e[o],enumerable:!(s=Pe(e,o))||s.enumerable});return t},W=(t,e,n)=>(V(t,e,"default"),n&&V(n,e,"default"));var $=t=>V(ie({},"__esModule",{value:!0}),t);var q={};import*as nt from"https://registry.koishi.chat/modules/koishi/index.js";var O=Ee(()=>{W(q,nt)});var ne=x((st,Te)=>{Te.exports=["colorbook","Papercutcraft","Xynthii-Diffusion","Redshift Diffusion","Mega Merge Diffusion","Borderlands","Voxel Art Diffusion","Elden Ring Diffusion","Cyberpunk Anime Diffusion","Future Diffusion","Microworlds","Vintedois Diffusion","mo-di-diffusion","Min Illust Background","Robo-Diffusion","stable_diffusion_inpainting","Dawgsmix","Zeipher Female Model","AIO Pixel Art","Dungeons and Diffusion","trinart","Yiffy","Midjourney PaintArt","App Icon Diffusion","Smoke Diffusion","Inkpunk Diffusion","Supermarionation","DnD Item","Zack3D","Fantasy Card Diffusion","stable_diffusion","Synthwave","Furry Epoch","Asim Simpsons","PortraitPlus","Anything Diffusion","Tron Legacy Diffusion","Clazy","Valorant Diffusion","Stable Diffusion 2 Depth","Papercut Diffusion","ChromaV5","stable_diffusion_2.1","Archer Diffusion","Dark Victorian Diffusion","Guohua Diffusion","Analog Diffusion","vectorartz","Classic Animation Diffusion","Eimis Anime Diffusion","Ranma Diffusion","Microscopic","Dreamlike Diffusion","GTA5 Artwork Diffusion","Midjourney Diffusion","Poison","kurzgesagt","Samdoesarts Ultmerge","Dreamlike Photoreal","Trinart Characters","Arcane Diffusion","JWST Deep Space Diffusion","RPG","Hassanblend","waifu_diffusion","ModernArt Diffusion","Darkest Diffusion","Balloon Art","Comic-Diffusion","BubblyDubbly","Eternos","Van Gogh Diffusion","Double Exposure Diffusion","Squishmallow Diffusion","Funko Diffusion","Hentai Diffusion","Ghibli Diffusion","Seek.art MEGA","Knollingcase","Spider-Verse Diffusion","ACertainThing","Wavyfusion","Nitro Diffusion"]});var H=x(l=>{"use strict";Object.defineProperty(l,"__esModule",{value:!0});l.parseInput=l.parseForbidden=l.Config=l.PromptConfig=l.upscalers=l.sampler=l.orients=l.models=l.hordeModels=l.orientMap=l.modelMap=void 0;var r=(O(),$(q));l.modelMap={safe:"safe-diffusion",nai:"nai-diffusion",furry:"nai-diffusion-furry"};l.orientMap={landscape:{height:512,width:768},portrait:{height:768,width:512},square:{height:640,width:640}};l.hordeModels=ne();var je=["nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers","extra digit, fewer digits, cropped, worst quality, low quality","normal quality, jpeg artifacts, signature, watermark, username, blurry"].join(", ");l.models=Object.keys(l.modelMap);l.orients=Object.keys(l.orientMap);var I;(function(t){t.nai={k_euler_a:"Euler ancestral",k_euler:"Euler",k_lms:"LMS",ddim:"DDIM",plms:"PLMS"},t.sd={k_euler_a:"Euler a",k_euler:"Euler",k_lms:"LMS",k_heun:"Heun",k_dpm_2:"DPM2",k_dpm_2_a:"DPM2 a",k_dpmpp_2s_a:"DPM++ 2S a",k_dpmpp_2m:"DPM++ 2M",k_dpm_fast:"DPM fast",k_dpm_ad:"DPM adaptive",k_dpmpp_sde:"DPM++ SDE",k_lms_ka:"LMS Karras",k_dpm_2_ka:"DPM2 Karras",k_dpm_2_a_ka:"DPM2 a Karras",k_dpmpp_2s_a_ka:"DPM++ 2S a Karras",k_dpmpp_2m_ka:"DPM++ 2M Karras",k_dpmpp_sde_ka:"DPM++ SDE Karras",ddim:"DDIM",plms:"PLMS"},t.horde={k_lms:"LMS",k_heun:"Heun",k_euler:"Euler",k_euler_a:"Euler a",k_dpm_2:"DPM2",k_dpm_2_a:"DPM2 a",k_dpm_fast:"DPM fast",k_dpm_adaptive:"DPM adaptive",k_dpmpp_2m:"DPM++ 2M",k_dpmpp_2s_a:"DPM++ 2S a",k_lms_ka:"LMS Karras",k_heun_ka:"Heun Karras",k_euler_ka:"Euler Karras",k_euler_a_ka:"Euler a Karras",k_dpm_2_ka:"DPM2 Karras",k_dpm_2_a_ka:"DPM2 a Karras",k_dpm_fast_ka:"DPM fast Karras",k_dpm_adaptive_ka:"DPM adaptive Karras",k_dpmpp_2m_ka:"DPM++ 2M Karras",k_dpmpp_2s_a_ka:"DPM++ 2S a Karras"};function e(s){return r.Schema.union(Object.entries(s).map(([o,d])=>r.Schema.const(o).description(d))).description("默认的采样器。").default("k_euler_a")}t.createSchema=e;function n(s){return s==="k_euler_a"?"k_euler_ancestral":s in t.nai?s:"k_euler_ancestral"}t.sd2nai=n})(I=l.sampler||(l.sampler={}));l.upscalers=["None","Lanczos","Nearest","LDSR","ESRGAN_4x","R-ESRGAN General 4xV3","R-ESRGAN General WDN 4xV3","R-ESRGAN AnimeVideo","R-ESRGAN 4x+","R-ESRGAN 4x+ Anime6B","R-ESRGAN 2x+","ScuNET GAN","ScuNET PSNR","SwinIR 4x"];l.PromptConfig=r.Schema.object({basePrompt:r.Schema.string().role("textarea").description("默认附加的标签。").default("masterpiece, best quality"),negativePrompt:r.Schema.string().role("textarea").description("默认附加的反向标签。").default(je),forbidden:r.Schema.string().role("textarea").description("违禁词列表。请求中的违禁词将会被自动删除。").default(""),placement:r.Schema.union([r.Schema.const("before").description("置于最前"),r.Schema.const("after").description("置于最后")]).description("默认附加标签的位置。").default("after"),translator:r.Schema.boolean().description("是否启用自动翻译。").default(!0),latinOnly:r.Schema.boolean().description("是否只接受英文输入。").default(!1),maxWords:r.Schema.natural().description("允许的最大单词数量。").default(0)}).description("输入设置");l.Config=r.Schema.intersect([r.Schema.object({type:r.Schema.union([r.Schema.const("token").description("授权令牌"),r.Schema.const("naifu").description("naifu"),r.Schema.const("sd-webui").description("sd-webui"),r.Schema.const("stable-horde").description("Stable Horde")]).description("登录方式。")}).description("登录设置"),r.Schema.union([r.Schema.intersect([r.Schema.union([r.Schema.object({type:r.Schema.const("token"),token:r.Schema.string().description("授权令牌。").role("secret").required()}),r.Schema.object({type:r.Schema.const("login"),email:r.Schema.string().description("账号邮箱。").required(),password:r.Schema.string().description("账号密码。").role("secret").required()})]),r.Schema.object({endpoint:r.Schema.string().description("API 服务器地址。").default("https://api.novelai.net"),headers:r.Schema.dict(String).role("table").description("要附加的额外请求头。").default({referer:"https://novelai.net/","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"})})]),r.Schema.object({type:r.Schema.const("naifu"),token:r.Schema.string().description("授权令牌。").role("secret"),endpoint:r.Schema.string().description("API 服务器地址。").required(),headers:r.Schema.dict(String).role("table").description("要附加的额外请求头。")}),r.Schema.object({type:r.Schema.const("sd-webui"),endpoint:r.Schema.string().description("API 服务器地址。").required(),headers:r.Schema.dict(String).role("table").description("要附加的额外请求头。")}),r.Schema.object({type:r.Schema.const("stable-horde"),endpoint:r.Schema.string().description("API 服务器地址。").default("https://stablehorde.net/"),token:r.Schema.string().description("授权令牌 (API Key)。").role("secret").default("0000000000"),nsfw:r.Schema.union([r.Schema.const("disallow").description("禁止"),r.Schema.const("censor").description("屏蔽"),r.Schema.const("allow").description("允许")]).description("是否允许 NSFW 内容。").default("allow"),trustedWorkers:r.Schema.boolean().description("是否只请求可信任工作节点。").default(!1),pollInterval:r.Schema.number().role("time").description("轮询进度间隔时长。").default(r.Time.second)})]),r.Schema.union([r.Schema.object({type:r.Schema.const("sd-webui"),sampler:I.createSchema(I.sd),upscaler:r.Schema.union(l.upscalers).description("默认的放大算法。").default("Lanczos"),restoreFaces:r.Schema.boolean().description("是否启用人脸修复。").default(!1),hiresFix:r.Schema.boolean().description("是否启用高分辨率修复。").default(!1)}).description("参数设置"),r.Schema.object({type:r.Schema.const("stable-horde"),sampler:I.createSchema(I.horde),model:r.Schema.union(l.hordeModels)}).description("参数设置"),r.Schema.object({type:r.Schema.const("naifu"),sampler:I.createSchema(I.nai)}).description("参数设置"),r.Schema.object({model:r.Schema.union(l.models).description("默认的生成模型。").default("nai"),sampler:I.createSchema(I.nai)}).description("参数设置")]),r.Schema.object({scale:r.Schema.number().description("默认对输入的服从度。").default(11),textSteps:r.Schema.natural().description("文本生图时默认的迭代步数。").default(28),imageSteps:r.Schema.natural().description("以图生图时默认的迭代步数。").default(50),maxSteps:r.Schema.natural().description("允许的最大迭代步数。").default(64),resolution:r.Schema.union([r.Schema.const("portrait").description("肖像 (768x512)"),r.Schema.const("landscape").description("风景 (512x768)"),r.Schema.const("square").description("方形 (640x640)"),r.Schema.object({width:r.Schema.natural().description("图片宽度。").default(640),height:r.Schema.natural().description("图片高度。").default(640)}).description("自定义")]).description("默认生成的图片尺寸。").default("portrait"),maxResolution:r.Schema.natural().description("允许生成的宽高最大值。").default(1024)}),l.PromptConfig,r.Schema.object({output:r.Schema.union([r.Schema.const("minimal").description("只发送图片"),r.Schema.const("default").description("发送图片和关键信息"),r.Schema.const("verbose").description("发送全部信息")]).description("输出方式。").default("default"),maxIterations:r.Schema.natural().description("允许的最大绘制次数。").default(1),maxRetryCount:r.Schema.natural().description("连接失败时最大的重试次数。").default(3),requestTimeout:r.Schema.number().role("time").description("当请求超过这个时间时会中止并提示超时。").default(r.Time.minute),recallTimeout:r.Schema.number().role("time").description("图片发送后自动撤回的时间 (设置为 0 以禁用此功能)。").default(0),maxConcurrency:r.Schema.number().description("单个频道下的最大并发数量 (设置为 0 以禁用此功能)。").default(0)}).description("高级设置")]);function qe(t){return t.trim().toLowerCase().replace(/，/g,",").replace(/！/g,"!").split(/(?:,\s*|\s*\n\s*)/g).filter(Boolean).map(e=>{let n=e.endsWith("!");return n&&(e=e.slice(0,-1)),e=e.replace(/[^a-z0-9]+/g," ").trim(),{pattern:e,strict:n}})}l.parseForbidden=qe;var se=/@@__BACKSLASH__@@/g;function Le(t,e,n,s){if(t=t.toLowerCase().replace(/\\\\/g,se.source).replace(/，/g,",").replace(/（/g,"(").replace(/）/g,")"),e.type==="sd-webui"?t=t.split("\\{").map(c=>c.replace(/\{/g,"(")).join("\\{").split("\\}").map(c=>c.replace(/\}/g,")")).join("\\}"):t=t.split("\\(").map(c=>c.replace(/\(/g,"{")).join("\\(").split("\\)").map(c=>c.replace(/\)/g,"}")).join("\\)"),t=t.replace(se,"\\").replace(/_/g," "),e.latinOnly&&/[^\s\w"'“”‘’.,:|\\()\[\]{}-]/.test(t))return[".latin-only"];let o=[],d=(c,A)=>{let j=A.split(/,\s*/g);e.placement==="before"&&j.reverse();for(let P of j)P=P.trim().toLowerCase(),!(!P||c.includes(P))&&(e.placement==="before"?c.unshift(P):c.push(P))},k=t.match(/(,\s*|\s+)(-u\s+|--undesired\s+|negative prompts?:\s*)([\s\S]+)/m);k?.[3]&&(t=t.slice(0,k.index).trim(),d(o,k[3]));let y=t.split(/,\s*/g).filter(c=>{if(c=c.replace(/[\x00-\x7f]/g,A=>A.replace(/[^0-9a-zA-Z]/," ")).replace(/\s+/," ").trim(),!c)return!1;for(let{pattern:A,strict:j}of n){if(j&&c.split(/\W+/g).includes(A))return!1;if(!j&&c.includes(A))return!1}return!0});return Math.max(oe(y),oe(o))>(e.maxWords||1/0)?[".too-many-words"]:(s||(d(y,e.basePrompt),d(o,e.negativePrompt)),[null,y.join(", "),o.join(", ")])}l.parseInput=Le;function oe(t){return t.join(" ").replace(/[^a-z0-9]+/g," ").trim().split(" ").length}});var le=x(()=>{});var ue=x(()=>{});var de=x(m=>{"use strict";var Re=m&&m.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(m,"__esModule",{value:!0});m.forceDataPrefix=m.resizeInput=m.closestMultiple=m.login=m.NetworkError=m.calcEncryptionKey=m.calcAccessKey=m.download=m.getImageSize=m.project=void 0;var Z=(O(),$(q)),M=le(),Fe=Re(ue());function Ne(t,e){let n={};for(let s in e)n[s]=t[e[s]];return n}m.project=Ne;function Ce(t){if(typeof Buffer<"u")return(0,Fe.default)(Buffer.from(t));let e=new Blob([t]),n=new Image;return n.src=URL.createObjectURL(e),(0,Z.pick)(n,["width","height"])}m.getImageSize=Ce;var Y=1048576,Ue=10485760,ce=["image/jpeg","image/png"];async function Oe(t,e,n={}){if(e.startsWith("data:")){let[,s,o]=e.match(/^data:(image\/\w+);base64,(.*)$/);if(!ce.includes(s))throw new E(".unsupported-file-type");let d=atob(o),k=new Uint8Array(d.length);for(let y=0;y<d.length;y++)k[y]=d.charCodeAt(y);return{buffer:k,base64:o,dataUrl:e}}else{let s=await t.http.head(e,{headers:n});if(+s["content-length"]>Ue)throw new E(".file-too-large");let o=s["content-type"];if(!ce.includes(o))throw new E(".unsupported-file-type");let d=await t.http.get(e,{responseType:"arraybuffer",headers:n}),k=(0,Z.arrayBufferToBase64)(d);return{buffer:d,base64:k,dataUrl:`data:${o};base64,${k}`}}}m.download=Oe;async function Ke(t,e){return await M.ready,(0,M.crypto_pwhash)(64,new Uint8Array(Buffer.from(e)),(0,M.crypto_generichash)(M.crypto_pwhash_SALTBYTES,e.slice(0,6)+t+"novelai_data_access_key"),2,2e6,M.crypto_pwhash_ALG_ARGON2ID13,"base64").slice(0,64)}m.calcAccessKey=Ke;async function Be(t,e){return await M.ready,(0,M.crypto_pwhash)(128,new Uint8Array(Buffer.from(e)),(0,M.crypto_generichash)(M.crypto_pwhash_SALTBYTES,e.slice(0,6)+t+"novelai_data_encryption_key"),2,2e6,M.crypto_pwhash_ALG_ARGON2ID13,"base64")}m.calcEncryptionKey=Be;var E=class extends Error{constructor(e,n={}){super(e),this.params=n}};m.NetworkError=E;E.catch=t=>e=>{if(Z.Quester.isAxiosError(e)){let n=e.response?.status;for(let s in t)if(n===+s)throw new E(t[s])}throw e};async function Ge(t){return t.config.type==="token"?(await t.http.get(t.config.endpoint+"/user/subscription",{timeout:3e4,headers:{authorization:"Bearer "+t.config.token}}).catch(E.catch({401:".invalid-token"})),t.config.token):(t.config.type,t.config.token)}m.login=Ge;function U(t,e=64){let n=Math.floor(t/e)*e,s=Math.ceil(t/e)*e,o=t-n<s-t?n:s;return Number.isNaN(o)?0:o<=0?e:o}m.closestMultiple=U;function Ve(t){let{width:e,height:n}=t;if(e%64===0&&n%64===0&&e*n<=Y)return{width:e,height:n};let s=e/n;if(s>1){let d=U(512*s);if(d*512<=Y)return{width:d,height:512}}else{let d=U(512/s);if(512*d<=Y)return{width:512,height:d}}return s>1?{width:1024,height:U(1024/s)}:{width:U(1024*s),height:1024}}m.resizeInput=Ve;function We(t,e="image/png"){return t.startsWith("data:")?t:`data:${e};base64,`+t}m.forceDataPrefix=We});var pe=x((mt,$e)=>{$e.exports={commands:{novelai:{description:"AI 画图",usage:`输入用逗号隔开的英文标签，例如 Mr.Quin, dark sword, red eyes。
查找标签可以使用 Danbooru。
快来给仓库点个 star 吧：https://github.com/koishijs/novelai-bot`,options:{enhance:"图片增强模式",model:"设定生成模型",resolution:"设定图片尺寸",override:"禁用默认标签",sampler:"设置采样器",seed:"设置随机种子",steps:"设置迭代步数",scale:"设置对输入的服从度",strength:"图片修改幅度",noise:"图片噪声强度",hiresFix:"启用高分辨率修复",undesired:"排除标签",noTranslator:"禁用自动翻译",iterations:"设置绘制次数"},messages:{"exceed-max-iteration":"超过最大绘制次数。","expect-prompt":"请输入标签。","expect-image":"请输入图片。","latin-only":"只接受英文输入。","too-many-words":"输入的单词数量过多。","forbidden-word":"输入含有违禁词。","concurrent-jobs":`<random>
  <>等会再约稿吧，我已经忙不过来了……</>
  <>是数位板没电了，才…才不是我不想画呢！</>
  <>那你得先教我画画（理直气壮</>
</random>`,waiting:`<random>
  <>少女绘画中……</>
  <>在画了在画了</>
  <>你就在此地不要走动，等我给你画一幅</>
</random>`,pending:"在画了在画了，不过前面还有 {0} 个稿……","invalid-size":"增强功能仅适用于被生成的图片。普通的 img2img 请直接使用「约稿」而不是「增强」。","invalid-resolution":"非法的图片尺寸。宽高必须都为 64 的倍数。","custom-resolution-unsupported":"不支持自定义图片尺寸。","file-too-large":"文件体积过大。","unsupported-file-type":"不支持的文件格式。","download-error":"图片解析失败。","unknown-error":"发生未知错误。","response-error":"发生未知错误 ({0})。","empty-response":"服务器返回了空白图片，请稍后重试。","request-failed":"请求失败 ({0})，请稍后重试。","request-timeout":"请求超时。","invalid-password":"邮箱或密码错误。","invalid-token":"令牌无效或已过期，请联系管理员。",unauthorized:"令牌未授权，可能需要续费，请联系管理员。"}},"novelai.upscale":{description:"AI 放大图片",options:{scale:"设置放大倍数",resolution:"设定放大尺寸",crop:"是否裁剪以适应尺寸",upscaler:"设置放大模型",upscaler2:"设置放大模型 2",upscaler2visibility:"设置放大模型 2 的可见度",upscaleFirst:"先放大再执行面部修复"},messages:{"expect-image":"请输入图片。","download-error":"图片解析失败。","unknown-error":"发生未知错误。"}}}}});var me=x((ht,He)=>{He.exports={commands:{novelai:{description:"AI 繪圖",usage:`輸入以逗號分割的英文提示詞，例如 portrait, blonde hair, red eyes。
查找可用的提示詞標籤可以使用 Danbooru。
快來給專案標星收藏吧：https://github.com/koishijs/novelai-bot`,options:{enhance:"圖像增強模式",model:"設定生成模型",resolution:"設定圖像尺寸",override:"禁用預設標籤",sampler:"設定採樣器",seed:"設定隨機種子",steps:"設定迭代步數",scale:"設定提示詞的相關性",strength:"圖像修改幅度",noise:"圖像雜訊強度",hiresFix:"啟用高分辨率修復",undesired:"反向提示詞",noTranslator:"禁用自動翻譯",iterations:"設定繪畫次數"},messages:{"exceed-max-iteration":"超過最大繪畫次數","expect-prompt":"請輸入提示詞。","expect-image":"請輸入圖像。","latin-only":"僅接受英文提示詞。","too-many-words":"輸入的提示詞數量過多","forbidden-word":"提示詞中含有違禁詞彙。","concurrent-jobs":`<random>
  <>等下再畫吧，我已經忙不過來了……</>
  <>我…我纔不是不會畫畫，只是沒時間！</>
  <>我先喝杯咖啡可以嗎，好睏～</>
</random>`,waiting:`<random>
  <>少女繪畫中</>
  <>莫行開，我即時來畫！</>
</random>`,pending:"好酒沉甕底。您還需等我完成前面 {0} 個稿件。","invalid-size":"增強功能僅適用於 Novel AI 生成圖。若要使用 img2img 功能請直接使用「約稿」而非「增強」。","invalid-resolution":"圖像尺寸無效。寬度與高度都須爲 64 的倍數。","custom-resolution-unsupported":"不支援自訂圖像尺寸。","file-too-large":"文件體積過大。","unsupported-file-type":"不支援的檔案格式。","download-error":"圖像解析失敗。","unknown-error":"發生未知的錯誤。","response-error":"發生未知的錯誤 ({0})。","empty-response":"伺服器返回了空圖像，請稍後重試。","request-failed":"擷取資料失敗 ({0})，請稍後重試。","request-timeout":"擷取資料超時。","invalid-password":"電郵地址或密碼不正確。","invalid-token":"令牌無效或已過期，請聯繫管理員。",unauthorized:"令牌未經授權，可能關聯帳戶需要續費，請聯繫管理員。"}},"novelai.upscale":{description:"AI 放大圖像",options:{scale:"設定放大倍率",resolution:"設定放大尺寸",crop:"是否裁剪以適應尺寸",upscaler:"設定放大模型",upscaler2:"設定放大模型 2",upscaler2visibility:"設定放大模型 2 的可視度",upscaleFirst:"先放大再執行面部修復"},messages:{"expect-image":"請輸入圖像。","download-error":"圖像解析失敗。","unknown-error":"發生未知的錯誤。"}}}}});var he=x((ft,Ye)=>{Ye.exports={commands:{novelai:{description:"Generate Images from Novel AI",usage:`Enter "novelai" with English prompt or tags, e.g. a girl in the forest, blonde hair, red eyes, white dress, etc.
You can also use comma separated tags like those on Danbooru.
Star it: https://github.com/koishijs/novelai-bot`,options:{enhance:"Image Enhance Mode",model:"Set Model for Generation",resolution:"Set Image Resolution",override:"Disable Default Prompts",sampler:"Set Sampler",seed:"Set Random Seed",steps:"Set Iteration Steps",scale:"Set CFG Scale",strength:"Set Denoising Strength",noise:"Set Noising Strength",hiresFix:"Enable Hires Fix.",undesired:"Negative Prompt",noTranslator:"Disable Auto Translation",iterations:"Set Batch Count."},messages:{"exceed-max-iteration":"Exceeded max batch count.","expect-prompt":"Expect a prompt.","expect-image":"Expect an image.","latin-only":"Invalid prompt, only English words can be used.","too-many-words":"Too many words in prompt.","forbidden-word":"Forbidden words in prompt.","concurrent-jobs":`<random>
  <>Too busy to handle your request...</>
  <>Brb power nap :zzz:</>
  <>(*~*) Have no time to draw a new one.</>
</random>`,waiting:`<random>
  <>The illustrator starts painting.</>
  <>Monet and Da Vinci, whose style is better for this?</>
</random>`,pending:`<plural count={0}>
  <>Sure.</>
  <>Sure, but please wait for me to complete this one before.</>
  <>Bruh, there are {0} jobs pending!</>
</plural>`,"invalid-size":'The Enhance mode can only be used for images generated. Use "novelai" without enhance option if you are using normal img2img.',"invalid-resolution":"Invalid resolution for image generation. The width and height of image should be multiple of 64.","custom-resolution-unsupported":"Custom resolution is not supported.","file-too-large":"File is too large.","unsupported-file-type":"Unsupported file type.","download-error":"Parsing image failed.","unknown-error":"An unknown error occurred.","response-error":"An unknown error occurred ({0}).","empty-response":"The server didn't return a valid image.","request-failed":"Request failed ({0}).","request-timeout":"Request timeout.","invalid-password":"Incorrect email address or password.","invalid-token":"The token is invalid or expired. Please contact your administrator.",unauthorized:"The token is unauthorized, this happens while your account didn't have a valid subscription. Please contact your administrator."}},"novelai.upscale":{description:"Upscale Images by AI",options:{scale:"Set Upscale By",resolution:"Set Upscale To",crop:"Crop Image Before Upscaling",upscaler:"Set Upscaler",upscaler2:"Set Upscaler",upscaler2visibility:"Set Visibility of Upscaler 2",upscaleFirst:"Upscale Image Before Restoring Face"},messages:{"expect-image":"Expect an image.","download-error":"Parsing image failed.","unknown-error":"An unknown error occurred."}}}}});var fe=x((gt,Ze)=>{Ze.exports={commands:{novelai:{description:"Générer des images sur IA",usage:`Entrez « novelai » avec les descriptions textuelles (anglais : prompt) de la scène que vous souhaitez générer.
De nombreux modèles exigent que les descriptions textuelles soient en anglais, par ex. a girl in the forest, blonde hair, red eyes, white dress.
Vous pouvez utiliser des balises séparées par des virgules, comme sur Danbooru.
Donnez-lui une étoile : https://github.com/koishijs/novelai-bot`,options:{enhance:"Mode d'amélioration de l'image",model:"Définir le modèle pour la génération",resolution:"Définir la taille de l'image",override:"Remplacer les descriptions textuelles de base",sampler:"Définir l'échantillonneur",seed:"Définir la graine aléatoire",steps:"Définir les étapes de l'itération",scale:"Définir CFG Scale",strength:"Définir l'intensité du débruitage",noise:"Définir l'intensité du bruit",hiresFix:"Activer la correction pour la résolution haute.",undesired:"Définir les descriptions textuelles négatives",noTranslator:"Désactiver la traduction automatique",iterations:"Définir le nombre des générations"},messages:{"exceed-max-iteration":"Trop du nombre des générations.","expect-prompt":"Attendrez-vous les descriptions textuelles valides.","expect-image":"Attendrez-vous une image.","latin-only":"Les descriptions textuelles ne sont pas valides, vous ne pouvez utiliser que des mots anglais.","too-many-words":"Trop de mots saisis.","forbidden-word":"Les descriptions textuelles contiennent des mots prohibés.","concurrent-jobs":`<random>
  <>Trop occupé pour répondre à votre demande...</>
  <>Courte sieste :zzz:</>
  <>(*~*) Pas le temps d'en dessiner un nouveau.</>
</random>`,waiting:`<random>
  <>D'accord. Je dessine de belles images pour vous.</>
  <>Votre demande est en cours de génération, veuillez attendre un moment.</>
  <>L'illustrateur commence à peindre.</>
  <>Monet et Da Vinci, quel style convient le mieux à cette image ?</>
</random>`,pending:`<plural count={0}>
  <>D'accord.</>
  <>D'accord, mais attendez que je complète la dernière demande.</>
  <>>_< Il y a {0} travaux en cours.</>
</plural>`,"invalid-size":"Le mode d'amélioration de l'image peut être utilisé seulement pour les images générées. Si vous utilisez le mode de img2img, utilisez « novelai » sans l'option « --enhance ».","invalid-resolution":"La taille de l'image n'est pas valide. La largeur et la hauteur de l'image doivent être des multiples de 64.","custom-resolution-unsupported":"La personnalisation de la résolution n'est pas prise en charge.","file-too-large":"Le fichier est trop important.","unsupported-file-type":"Le format de fichier non reconnu.","download-error":"Une erreur d'analyse syntaxique de l'image s'est produite.","unknown-error":"Une erreur inconnue s'est produite.","response-error":"Une erreur inconnue s'est produite : ({0}).","empty-response":"Le serveur répond avec l'image invalide.","request-failed":"La demande a échoué : ({0}).","request-timeout":"Le délai d'attente de la demande dépassé.","invalid-password":"L'adresse électronique ou mot de passe introduit est incorrect.","invalid-token":"Le token est invalide ou a expiré. Veuillez contacter l'administrateur.",unauthorized:"Le token n'est pas autorisé, peut-être que ce token n'a pas d'abonnement valide. Veuillez contacter l'administrateur."}},"novelai.upscale":{description:"Agrandir des images sur IA",options:{scale:"Mise à l'échelle de",resolution:"Mise à l'échelle à",crop:"Recadrer à la taille avant de l'agrandissement.",upscaler:"Définir l'agrandisseur",upscaler2:"Définir l'agrandisseur 2",upscaler2visibility:"Définir la visibilité de l'agrandisseur 2",upscaleFirst:"Agrandir les images avant de restaurer les visages"},messages:{"expect-image":"Attendrez-vous une image.","download-error":"Une erreur d'analyse syntaxique de l'image s'est produite.","unknown-error":"Une erreur inconnue s'est produite."}}}}});var ge=x((bt,Qe)=>{Qe.exports={commands:{novelai:{description:"AI で絵を描く",usage:`コンマで区切られた英語の生成呪文 (プロンプト) を入力してください。例：1girl, red eyes, black hair。
モデルに用いられる単語は Danbooru のタグとほとんど同じです。
興味があったら、レポジトリにスターを付けてください：https://github.com/koishijs/novelai-bot`,options:{enhance:"向上 (enhance) モードを有効",model:"モデルを指定",resolution:"画像解像度を設定",override:"デフォルトプロンプトを無効にする",sampler:"サンプラーを指定",seed:"シード値を設定",steps:"ステップ数を設定",scale:"CFG スケール値を設定",strength:"ノイズ除去強度を設定",noise:"ノイズ強度を設定",hiresFix:"高解像度修正を有効",undesired:"反対呪文 (ネガティブプロンプト) を設定",noTranslator:"自動翻訳を無効",iterations:"画像生成数を設定"},messages:{"exceed-max-iteration":"画像生成数が最大に超えました。","expect-prompt":"生成呪文を入力してください。","expect-image":"画像を入力してください。","latin-only":"英数字だけが入力可能です。","too-many-words":"入力した単語が多すぎる。","forbidden-word":"一部の入力した単語が禁止されている。","concurrent-jobs":`<random>
  <>後でね～今、猫の手も借りたいなの！</>
  <>描けるの、た、タブレットが起動できませんだから。</>
  <>じゃ、まず絵を教えて。</>
</random>`,waiting:`<random>
  <>私はプロ絵師だから、どんな絵でも描けるの。</>
  <>仕事している…</>
</random>`,pending:"仕事している前に {0} つの絵が完遂するべきです。","invalid-size":"向上モードは AI 生成画像のみに用いられる。img2img (指定画像から生成) を使いたければ、「--enhance」を追加せずにコマンドを再実行してください。","invalid-resolution":"無効な解像度。幅と高さが 64 の倍数である必要があります。","custom-resolution-unsupported":"カスタム画像解像度は使用できません。","file-too-large":"ファイルのサイズが大きすぎる。","unsupported-file-type":"ファイルのタイプがサポートされていません。","download-error":"画像のダウンロードに失敗しました。","unknown-error":"不明なエラーが発生しました。","response-error":"不明なエラーが発生しました ({0})。","empty-response":"サーバーが無効な画像を返されました、後で試してください。","request-failed":"リクエストが失敗しました ({0})，後で試してください。","request-timeout":"リクエストがタイムアウトしました。","invalid-password":"メールアドレスやパスワードが間違っています。","invalid-token":"期間切れたまたは無効なトークンです。管理者に連絡してください。",unauthorized:"アカウント契約が期間切れるか、トークンが認可されていません。管理者に連絡してください。"}},"novelai.upscale":{description:"AI で画像拡大",options:{scale:"拡大倍率を設定",resolution:"拡大目標解像度を設定",crop:"拡大する前に画像をクロップする",upscaler:"拡大モデルを設定",upscaler2:"拡大モデル２を設定",upscaler2visibility:"拡大モデル２の可視度を設定",upscaleFirst:"拡大する前にフェイス修正を行う"},messages:{"expect-image":"画像を入力してください。","download-error":"画像のダウンロードに失敗しました。","unknown-error":"不明なエラーが発生しました。"}}}}});var rt=x(S=>{var Xe=S&&S.__createBinding||(Object.create?function(t,e,n,s){s===void 0&&(s=n);var o=Object.getOwnPropertyDescriptor(e,n);(!o||("get"in o?!e.__esModule:o.writable||o.configurable))&&(o={enumerable:!0,get:function(){return e[n]}}),Object.defineProperty(t,s,o)}:function(t,e,n,s){s===void 0&&(s=n),t[s]=e[n]}),Je=S&&S.__exportStar||function(t,e){for(var n in t)n!=="default"&&!Object.prototype.hasOwnProperty.call(e,n)&&Xe(e,t,n)};Object.defineProperty(S,"__esModule",{value:!0});S.apply=S.name=S.reactive=void 0;var h=(O(),$(q)),w=H(),f=de();Je(H(),S);S.reactive=!0;S.name="novelai";var F=new h.Logger("novelai");function et(t,e){if(h.Quester.isAxiosError(e)){if(e.response?.status===402)return t.text(".unauthorized");if(e.response?.status)return t.text(".response-error",[e.response.status]);if(e.code==="ETIMEDOUT")return t.text(".request-timeout");if(e.code)return t.text(".request-failed",[e.code])}return F.error(e),t.text(".unknown-error")}function tt(t,e){t.i18n.define("zh",pe()),t.i18n.define("zh-TW",me()),t.i18n.define("en",he()),t.i18n.define("fr",fe()),t.i18n.define("ja",ge());let n,s=Object.create(null),o=new Set;t.accept(["forbidden"],i=>{n=(0,w.parseForbidden)(i.forbidden)},{immediate:!0});let d=null,k=()=>d||(d=(0,f.login)(t));t.accept(["token","type","email","password"],()=>d=null);let y=()=>!["login","token"].includes(e.type),c=i=>typeof e.allowAnlas=="boolean"?!e.allowAnlas:i.user.authority<e.allowAnlas,A=(...i)=>a=>i.some(g=>g(a)),j=i=>{let a=+i;if(a*0===0&&Math.floor(a)===a&&a>0&&a<=(e.maxSteps||1/0))return a;throw new Error},P=(i,a)=>{if(i in w.orientMap)return w.orientMap[i];let g=i.match(/^(\d+)[x×](\d+)$/);if(!g)throw new Error;let z=(0,f.closestMultiple)(+g[1]),v=(0,f.closestMultiple)(+g[2]);if(Math.max(z,v)>(e.maxResolution||1/0))throw new h.SessionError("commands.novelai.messages.invalid-resolution");return{width:z,height:v,custom:!0}},N=t.command("novelai <prompts:text>").alias("nai").userFields(["authority"]).shortcut("画画",{fuzzy:!0}).shortcut("畫畫",{fuzzy:!0}).shortcut("约稿",{fuzzy:!0}).shortcut("約稿",{fuzzy:!0}).shortcut("增强",{fuzzy:!0,options:{enhance:!0}}).shortcut("增強",{fuzzy:!0,options:{enhance:!0}}).option("enhance","-e",{hidden:A(c,y)}).option("model","-m <model>",{type:w.models,hidden:y}).option("resolution","-r <resolution>",{type:P}).option("output","-o",{type:["minimal","default","verbose"]}).option("override","-O",{hidden:c}).option("sampler","-s <sampler>").option("seed","-x <seed:number>").option("steps","-t <step>",{type:j,hidden:c}).option("scale","-c <scale:number>").option("noise","-n <noise:number>",{hidden:A(c,y)}).option("strength","-N <strength:number>",{hidden:c}).option("hiresFix","-H",{hidden:()=>e.type!=="sd-webui"}).option("undesired","-u <undesired>").option("noTranslator","-T",{hidden:()=>!t.translator||!e.translator}).option("iterations","-i <iterations:posint>",{fallback:1,hidden:()=>e.maxIterations<=1}).action(async({session:i,options:a},g)=>{var z;if(!g?.trim())return i.execute("help novelai");if(a.resolution?.custom&&c(i))return i.text(".custom-resolution-unsupported");if(a.iterations&&a.iterations>e.maxIterations)return i.text(".exceed-max-iteration",[e.maxIterations]);let v,D;if(c(i))delete a.enhance,delete a.steps,delete a.noise,delete a.strength,delete a.override;else{if(g=h.segment.transform(g,{image(u){return v=u.url,""}}),a.enhance&&!v)return i.text(".expect-image");if(!g.trim()&&!e.basePrompt)return i.text(".expect-prompt")}if(e.translator&&t.translator&&!a.noTranslator)try{g=await t.translator.translate({input:g,target:"en"})}catch(u){F.warn(u)}let[_,K,Q]=(0,w.parseInput)(g,e,n,a.override);if(_)return i.text(_);let B;try{B=await k()}catch(u){return u instanceof f.NetworkError?i.text(u.message,u.params):(F.error(u),i.text(".unknown-error"))}let X=w.modelMap[a.model],p={seed:a.seed||Math.floor(Math.random()*Math.pow(2,32)),prompt:K,n_samples:1,uc:Q,ucPreset:2,qualityToggle:!1,scale:a.scale??11,steps:a.steps??(v?e.imageSteps:e.textSteps)};if(v){try{D=await(0,f.download)(t,v)}catch(u){return u instanceof f.NetworkError?i.text(u.message,u.params):(F.error(u),i.text(".download-error"))}if(a.enhance){let u=(0,f.getImageSize)(D.buffer);if(u.width+u.height!==1280)return i.text(".invalid-size");Object.assign(p,{height:u.height*1.5,width:u.width*1.5,noise:a.noise??0,strength:a.strength??.2})}else a.resolution||(a.resolution=(0,f.resizeInput)((0,f.getImageSize)(D.buffer))),Object.assign(p,{height:a.resolution.height,width:a.resolution.width,noise:a.noise??.2,strength:a.strength??.7})}else a.resolution||(a.resolution=typeof e.resolution=="string"?w.orientMap[e.resolution]:e.resolution),Object.assign(p,{height:a.resolution.height,width:a.resolution.width});(a.hiresFix||e.hiresFix)&&(p.strength??(p.strength=.75));let we=()=>Math.random().toString(36).slice(2),C=Array(a.iterations).fill(0).map(we);if(e.maxConcurrency){let u=s[z=i.cid]||(s[z]=new Set);if(u.size>=e.maxConcurrency)return i.text(".concurrent-jobs");C.forEach(L=>u.add(L))}i.send(o.size?i.text(".pending",[o.size]):i.text(".waiting")),C.forEach(u=>o.add(u));let J=u=>{s[i.cid]?.delete(u),o.delete(u)},ye=(()=>{switch(e.type){case"sd-webui":return D?"/sdapi/v1/img2img":"/sdapi/v1/txt2img";case"stable-horde":return"/api/v2/generate/async";case"naifu":return"/generate-stream";default:return"/ai/generate-image"}})(),_e=()=>{switch(e.type){case"login":case"token":case"naifu":return p.sampler=w.sampler.sd2nai(a.sampler),p.image=D?.base64,e.type==="naifu"?p:{model:X,input:K,parameters:(0,h.omit)(p,["prompt"])};case"sd-webui":return{sampler_index:w.sampler.sd[a.sampler],init_images:D&&[D.dataUrl],restore_faces:e.restoreFaces??!1,enable_hr:a.hiresFix??e.hiresFix??!1,...(0,f.project)(p,{prompt:"prompt",batch_size:"n_samples",seed:"seed",negative_prompt:"uc",cfg_scale:"scale",steps:"steps",width:"width",height:"height",denoising_strength:"strength"})};case"stable-horde":return{prompt:p.prompt,params:{sampler_name:a.sampler.replace("_ka",""),cfg_scale:p.scale,denoising_strength:p.strength,seed:p.seed.toString(),height:p.height,width:p.width,post_processing:[],karras:a.sampler.includes("_ka"),steps:p.steps,n:1},nsfw:e.nsfw!=="disallow",trusted_workers:e.trustedWorkers,censor_nsfw:e.nsfw==="censor",models:[a.model],source_image:D?.base64,source_processing:D?"img2img":void 0,r2:!0}}},Se=()=>{switch(e.type){case"login":case"token":case"naifu":return{Authorization:`Bearer ${B}`};case"stable-horde":return{apikey:B}}},ke=async()=>{let u=async()=>{let b=await t.http.axios((0,h.trimSlash)(e.endpoint)+ye,{method:"POST",timeout:e.requestTimeout,headers:{...e.headers,...Se()},data:_e()});if(e.type==="sd-webui")return(0,f.forceDataPrefix)(b.data.images[0]);if(e.type==="stable-horde"){let T=b.data.id,R=()=>t.http.get((0,h.trimSlash)(e.endpoint)+"/api/v2/generate/check/"+T).then(G=>G.done),xe=G=>new Promise(Ae=>setTimeout(Ae,G));for(;await R()===!1;)await xe(e.pollInterval);let te=await t.http.get((0,h.trimSlash)(e.endpoint)+"/api/v2/generate/status/"+T),re=te.generations[0].img;if(!re.startsWith("http"))return(0,f.forceDataPrefix)(te.generations[0].img,"image/webp");let ae=await t.http.axios(re,{responseType:"arraybuffer"}),Me=Buffer.from(ae.data).toString("base64");return(0,f.forceDataPrefix)(Me,ae.headers["content-type"])}return(0,f.forceDataPrefix)(b.data?.slice(27))},L,ve=0;for(;;)try{L=await u();break}catch(b){if(h.Quester.isAxiosError(b)&&b.code&&b.code!=="ETIMEDOUT"&&++ve<e.maxRetryCount)continue;return await i.send(et(i,b))}if(!L.trim())return await i.send(i.text(".empty-response"));function De(){if(a.output==="minimal")return h.segment.image(L);let b={userId:i.userId,nickname:i.author?.nickname||i.username},T=(0,h.segment)("figure"),R=[`seed = ${p.seed}`];return a.output==="verbose"&&(y()||R.push(`model = ${X}`),R.push(`sampler = ${a.sampler}`,`steps = ${p.steps}`,`scale = ${p.scale}`),p.image&&R.push(`strength = ${p.strength}`,`noise = ${p.noise}`)),T.children.push((0,h.segment)("message",b,R.join(`
`))),T.children.push((0,h.segment)("message",b,`prompt = ${K}`)),a.output==="verbose"&&T.children.push((0,h.segment)("message",b,`undesired = ${Q}`)),T.children.push((0,h.segment)("message",b,h.segment.image(L))),T}let ee=await i.send(De());ee.length&&e.recallTimeout&&t.setTimeout(()=>{for(let b of ee)i.bot.deleteMessage(i.channelId,b)},e.recallTimeout)};for(;C.length;)try{await ke(),J(C.pop()),p.seed++}catch(u){throw C.forEach(J),u}});t.accept(["scale","model","sampler","output"],i=>{let a=()=>{switch(i.type){case"sd-webui":return w.sampler.sd;case"stable-horde":return w.sampler.horde;default:return w.sampler.nai}};N._options.output.fallback=i.output,N._options.scale.fallback=i.scale,N._options.model.fallback=i.model,N._options.sampler.fallback=i.sampler,N._options.sampler.type=Object.keys(a())},{immediate:!0});let be=t.intersect(()=>e.type==="sd-webui").command("novelai.upscale").shortcut("放大",{fuzzy:!0}).option("scale","-s <scale:number>",{fallback:2}).option("resolution","-r <resolution>",{type:P}).option("crop","-C, --no-crop",{value:!1,fallback:!0}).option("upscaler","-1 <upscaler>",{type:w.upscalers}).option("upscaler2","-2 <upscaler2>",{type:w.upscalers}).option("visibility","-v <visibility:number>").option("upscaleFirst","-f",{fallback:!1}).action(async({session:i,options:a},g)=>{let z;if(h.segment.transform(g,{image(_){return z=_.url,""}}),!z)return i.text(".expect-image");let v;try{v=await(0,f.download)(t,z)}catch(_){return _ instanceof f.NetworkError?i.text(_.message,_.params):(F.error(_),i.text(".download-error"))}let D={image:v.dataUrl,resize_mode:a.resolution?1:0,show_extras_results:!0,upscaling_resize:a.scale,upscaling_resize_h:a.resolution?.height,upscaling_resize_w:a.resolution?.width,upscaling_crop:a.crop,upscaler_1:a.upscaler,upscaler_2:a.upscaler2??"None",extras_upscaler_2_visibility:a.visibility??1,upscale_first:a.upscaleFirst};try{let{data:_}=await t.http.axios((0,h.trimSlash)(e.endpoint)+"/sdapi/v1/extra-single-image",{method:"POST",timeout:e.requestTimeout,headers:{...e.headers},data:D});return h.segment.image((0,f.forceDataPrefix)(_.image))}catch(_){return F.warn(_),i.text(".unknown-error")}});t.accept(["upscaler"],i=>{be._options.upscaler.fallback=i.upscaler},{immediate:!0})}S.apply=tt});export default rt();

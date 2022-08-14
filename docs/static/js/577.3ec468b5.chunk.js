(()=>{"use strict";var e,t,r={577:(e,t,r)=>{var n=r(336),a=r.n(n);const i=(0,r(269).X3)("hitpoints",1,{upgrade(e){e.createObjectStore("assorted");e.createObjectStore("events",{keyPath:"id"}).createIndex("unsynced","unsynced"),e.createObjectStore("recipes",{keyPath:"id"})}});function o(){return i}const s={async get(e,t){if(t)return t.objectStore("assorted").get(e);return(await o()).get("assorted",e)},async set(e,t,r){r&&await r.objectStore("assorted").put(t,e);const n=await o();await n.put("assorted",t,e)}};function c(e){const t=new Intl.Collator("en",{ignorePunctuation:!0}).compare;return[...e].sort(((e,r)=>t(e.name,r.name))).map((e=>e.id))}function d(e){const t={};return e.forEach((e=>{e.tags.forEach((r=>{t[r]||(t[r]=[]),t[r]?.push(e.id)}))})),t}function p(e){const t=a()((t=>{t.field("name"),t.field("ingredients"),e.forEach((e=>{const r=e.ingredients.map((e=>"Ingredient"===e.type&&e.name)).join(" ");t.add({id:e.id,name:e.name,ingredients:r})}))}));return JSON.stringify(t)}onmessage=()=>{!async function(){const e=new Date,t=await o(),r=(await t.getAll("recipes")).filter((e=>!e.deleted)),n=new Map;r.forEach(((e,t)=>{const r=t.toString();n.set(r,e.id),e.id=r}));const a={order:c(r),tags:d(r),text:p(r),idMap:n},i=t.transaction("assorted","readwrite"),u=await s.get("recipeSearchIndexCursor",i);if(u&&e<u)return void await i.done;await Promise.all([s.set("recipeSearchIndex",a,i),s.set("recipeSearchIndexCursor",e,i)]),await i.done,new BroadcastChannel("recipeIndex").postMessage(a)}()}}},n={};function a(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={exports:{}};return r[e](i,i.exports,a),i.exports}a.m=r,a.x=()=>{var e=a.O(void 0,[771],(()=>a(577)));return e=a.O(e)},e=[],a.O=(t,r,n,i)=>{if(!r){var o=1/0;for(p=0;p<e.length;p++){for(var[r,n,i]=e[p],s=!0,c=0;c<r.length;c++)(!1&i||o>=i)&&Object.keys(a.O).every((e=>a.O[e](r[c])))?r.splice(c--,1):(s=!1,i<o&&(o=i));if(s){e.splice(p--,1);var d=n();void 0!==d&&(t=d)}}return t}i=i||0;for(var p=e.length;p>0&&e[p-1][2]>i;p--)e[p]=e[p-1];e[p]=[r,n,i]},a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.f={},a.e=e=>Promise.all(Object.keys(a.f).reduce(((t,r)=>(a.f[r](e,t),t)),[])),a.u=e=>"static/js/"+e+".4ad965c5.chunk.js",a.miniCssF=e=>{},a.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;a.g.importScripts&&(e=a.g.location+"");var t=a.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=e+"../../"})(),(()=>{var e={577:1};a.f.i=(t,r)=>{e[t]||importScripts(a.p+a.u(t))};var t=globalThis.webpackChunk_hitpoints_client=globalThis.webpackChunk_hitpoints_client||[],r=t.push.bind(t);t.push=t=>{var[n,i,o]=t;for(var s in i)a.o(i,s)&&(a.m[s]=i[s]);for(o&&o(a);n.length;)e[n.pop()]=1;r(t)}})(),t=a.x,a.x=()=>a.e(771).then(t);a.x()})();
//# sourceMappingURL=577.3ec468b5.chunk.js.map
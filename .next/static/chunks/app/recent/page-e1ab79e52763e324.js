(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[655],{9633:function(e,t,a){Promise.resolve().then(a.bind(a,1483))},7648:function(e,t,a){"use strict";a.d(t,{default:function(){return s.a}});var r=a(2972),s=a.n(r)},1483:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return d}});var r=a(7437),s=a(9291),n=a(3560),c=a(8469),i=a(9169),l=a(3874);function d(){const{recent:e}=(0,i.b)(),t=e.map(e=>l.ns.get(e)).filter(Boolean);return(0,r.jsxs)("div",{className:"container-shell space-y-8",children:[(0,r.jsx)(s.m,{eyebrow:"Recent",title:"Recently used tools",description:"Your last used tools appear here."}),t.length?(0,r.jsx)("div",{className:"grid gap-4 md:grid-cols-2 xl:grid-cols-4",children:t.map(e=>e?(0,r.jsx)(c.t,{tool:e},e.slug):null)}):(0,r.jsx)(n.u,{title:"Nothing recent yet",description:"Open a tool page to start building your history."})]})}},3560:function(e,t,a){"use strict";a.d(t,{u:function(){return n}});var r=a(7437),s=a(9820);function n(e){let{title:t,description:a}=e;return(0,r.jsx)(s.Zb,{children:(0,r.jsxs)(s.aY,{className:"py-10 text-center",children:[(0,r.jsx)("p",{className:"text-base font-medium text-slate-950 dark:text-slate-50",children:t}),a?(0,r.jsx)("p",{className:"mt-2 text-sm text-slate-600 dark:text-slate-400",children:a}):null]})})}},9291:function(e,t,a){"use strict";a.d(t,{m:function(){return s}});var r=a(7437);function s(e){let{eyebrow:t,title:a,description:s,right:n}=e;return(0,r.jsxs)("div",{className:"flex flex-col gap-5 md:flex-row md:items-end md:justify-between",children:[(0,r.jsxs)("div",{className:"max-w-3xl space-y-3",children:[t?(0,r.jsx)("p",{className:"text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400",children:t}):null,(0,r.jsx)("h1",{className:"text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl",children:a}),s?(0,r.jsx)("p",{className:"max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base",children:s}):null]}),n?(0,r.jsx)("div",{className:"flex shrink-0 items-center gap-2",children:n}):null]})}},8469:function(e,t,a){"use strict";a.d(t,{t:function(){return d}});var r=a(7437),s=a(7648),n=a(9820),c=a(4286),i=a(3448);
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const l=(0,a(5480).Z)("arrow-up-right",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);function d(e){let{tool:t}=e;const a=(0,c._)(t.icon);return(0,r.jsx)(s.default,{href:"/".concat(t.category,"/").concat(t.slug),className:"group block",children:(0,r.jsx)(n.Zb,{className:"h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",children:(0,r.jsxs)(n.Ol,{children:[(0,r.jsxs)("div",{className:"mb-4 flex items-center justify-between",children:[(0,r.jsx)("div",{className:"inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950",children:(0,r.jsx)(a,{className:"h-5 w-5"})}),(0,r.jsx)(l,{className:"h-4 w-4 text-slate-400 transition group-hover:text-slate-950 dark:text-slate-500 dark:group-hover:text-slate-50"})]}),(0,r.jsx)("p",{className:"text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400",children:(0,i.Gm)(t.category)}),(0,r.jsx)(n.ll,{className:"mt-3 text-base",children:t.title}),(0,r.jsx)(n.SZ,{className:"mt-2",children:t.shortDescription})]})})})}},9169:function(e,t,a){"use strict";a.d(t,{b:function(){return s}});var r=a(2265);function s(){const[e,t]=(0,r.useState)([]);(0,r.useEffect)(()=>{const e=localStorage.getItem("recent-tools");if(e)try{t(JSON.parse(e))}catch(e){}},[]),(0,r.useEffect)(()=>{localStorage.setItem("recent-tools",JSON.stringify(e))},[e]);const a=(0,r.useCallback)(e=>{t(t=>t[0]===e?t:function(e,t){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:12;return[t,...e.filter(e=>e!==t)].slice(0,a)}(t,e,12))},[]);return{recent:e,addRecent:a,setRecent:t}}},4286:function(e,t,a){"use strict";a.d(t,{C:function(){return p},_:function(){return m}});var r=a(8897),s=a(2643),n=a(5480);
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const c=(0,n.Z)("video",[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]]),i=(0,n.Z)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]),l=(0,n.Z)("code-xml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]),d=(0,n.Z)("text-align-start",[["path",{d:"M21 5H3",key:"1fi0y6"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M17 19H3",key:"z6ezky"}]]),o=(0,n.Z)("scale",[["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"m19 8 3 8a5 5 0 0 1-6 0zV7",key:"zcdpyk"}],["path",{d:"M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1",key:"1yorad"}],["path",{d:"m5 8 3 8a5 5 0 0 1-6 0zV7",key:"eua70x"}],["path",{d:"M7 21h10",key:"1b0cd5"}]]),u=(0,n.Z)("folder",[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]]);var h=a(1192);
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const x=(0,n.Z)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);var f=a(9150);
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const y=(0,n.Z)("layout-grid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]);function m(e){var t;return null!==(t={image:r.Z,pdf:s.Z,video:c,social:i,dev:l,text:d,unit:o,file:u,spark:h.Z,shield:x,search:f.Z,grid:y}[e])&&void 0!==t?t:h.Z}function p(e){switch(e){case"image":return r.Z;case"pdf":return s.Z;case"video-audio":return c;case"social":return i;case"dev":return l;case"text":return d;case"unit-money":return o;case"file":return u;default:return h.Z}}},2643:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const r=(0,a(5480).Z)("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},8897:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const r=(0,a(5480).Z)("image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]])},1192:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});
/**
 * @license lucide-react v1.14.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const r=(0,a(5480).Z)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]])}},function(e){e.O(0,[972,905,701,971,117,744],function(){return t=9633,e(e.s=t);var t});var t=e.O();_N_E=t}]);
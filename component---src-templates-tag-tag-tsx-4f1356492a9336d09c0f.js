(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{C41g:function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var a=n("q1tI"),r=n.n(a),s=n("Wbzz"),l=n("awtK");function o(e,t,n){var a=e.get(t);if(void 0===a)throw n(t);return a}function u(e){var t=e.tags,n=Object(s.useStaticQuery)("2463615370").allSitePage.edges,a=new Map(n.map((function(e){return[e.node.context.tag,e.node.context.slug]})));return r.a.createElement(r.a.Fragment,null,function(e){return e.sort((function(e,t){return e.localeCompare(t)}))}(t).map((function(e){return function(e,t){return r.a.createElement(r.a.Fragment,{key:e},r.a.createElement(s.Link,{to:t},"#",e)," ")}(e,o(a,e,(function(e){return Error("Unknown tag name: "+e)})))})))}function i(e){var t,n,a,i=Object(s.useStaticQuery)("1242404783").allSitePage.edges,c=new Map(i.map((function(e){return[e.node.context.series___title,e.node.context.slug]})));return r.a.createElement("header",{className:l.header},r.a.createElement(s.Link,{className:l.title,to:e.slug},r.a.createElement("h2",null,e.title)),r.a.createElement("div",{className:l.subtitle},r.a.createElement("span",{className:l.date},e.date),null===e.series?r.a.createElement(r.a.Fragment,null):(t=e.series.title,n=e.series.part,a=o(c,e.series.title,(function(e){return Error("Unknown series title: "+e)})),r.a.createElement("span",{className:l.series},"Part ",n," of ",r.a.createElement(s.Link,{to:a},t))),r.a.createElement("span",null,r.a.createElement(u,{tags:e.tags}))))}},awtK:function(e,t,n){e.exports={header:"blog-post-header-module--header--2gWNG",title:"blog-post-header-module--title--1sK2E",subtitle:"blog-post-header-module--subtitle--2wyKz",date:"blog-post-header-module--date--1nczg",series:"blog-post-header-module--series--10njw"}},iWTo:function(e,t,n){e.exports={container:"blog-post-list-module--container--UlhTE"}},jK2w:function(e,t,n){"use strict";n.d(t,"a",(function(){return o}));var a=n("q1tI"),r=n.n(a),s=n("C41g"),l=n("iWTo");function o(e){var t=e.posts;return r.a.createElement("div",{className:l.container},t.map((function(e,t){return function(e,t){var n=t.fields.slug,a=t.frontmatter,l=a.title,o=a.series,u=a.date,i=a.tags;return r.a.createElement("article",{key:e},r.a.createElement(s.a,{slug:n,title:l,series:o,tags:i,date:u}))}(t,e.node)})))}},pKh8:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return o})),n.d(t,"query",(function(){return u}));var a=n("q1tI"),r=n.n(a),s=n("B7F5"),l=n("jK2w");function o(e){var t=e.data.allMarkdownRemark.edges;return r.a.createElement(s.a,null,r.a.createElement(l.a,{posts:t}))}var u="1768235221"}}]);
//# sourceMappingURL=component---src-templates-tag-tag-tsx-4f1356492a9336d09c0f.js.map
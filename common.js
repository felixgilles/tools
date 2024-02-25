// ==UserScript==
// @name         Common
// @description  Common script
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

const my_css = GM_getResourceText("Gilles_css");
GM_addStyle(my_css);

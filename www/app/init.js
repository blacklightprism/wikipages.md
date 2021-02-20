import { html, render } from "/app/lib/htm-index-3.0.4.module.js";
import { MainApp } from "/app/MainApp.js";

render(html`<${MainApp}/>`, document.getElementById("app"));


let link = document.createElement('link');
link.rel="stylesheet";
link.href="/publicdata/styles.css";
document.head.appendChild(link);

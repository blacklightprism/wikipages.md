import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { Router } from "/app/lib/preact-router-3.2.1.es.min.js";

import { ContentView } from "/app/components/ContentView.js";
import { UserArea } from "/app/components/UserArea.js";
import { PrivateArea } from "/app/components/PrivateArea.js";

const Home = () => {
  return html`
    <${ContentView} request="/homepage.md" directive="public"/>
  `;
}
const About = () => {
  return html`
    <${ContentView} request="/about.md" directive="public"/>
    <${ContentView} request="/license.md" directive="public"/>
  `;
}
const NotFound404 = () => {
  return html`Oops, it seems like you entered the void (e404). <a href="/">Go back Home</a>`;
}

export class MainApp extends Component {
  constructor() {
    super();
    this.setState({loggedIn: false});
  }
  login(username) {
    this.setState({username: username});
    this.setState({loggedIn: true});
  }
  logout() {
    this.setState({loggedIn: false});
  }
  addThemeChangeButton() {
    let tbtn = document.createElement('button');
    tbtn.onclick = toggleScheme;
    tbtn.style = "float:right; font-size:0.75em;";
    tbtn.innerHTML = " &#x2600;&#xFE0F; <b>//</b> &#x1F311; ";
    let int = setInterval(() => {
      let tb = document.getElementById("themebtn");
      if (tb && !tb.hasChildNodes()) {
        tb.appendChild(tbtn);
        clearInterval(int);
      }
    }, 500);
  }
  componentDidMount() {
    this.addThemeChangeButton();
  }
  componentDidUpdate() {
    this.addThemeChangeButton();
  }
  render (_,{loggedIn, username}) {  //props, state
    return html`
      <${ContentView} class="header" request="/header.md" directive="public"/>
      <${Router}>
        <${Home} path="/" />
        <${ContentView} path="/view/:request*?" directive="public"/>
        <${UserArea} path="/user/:request*?" />
        <${PrivateArea} loggedIn=${loggedIn} path="/me/:request*?" username=${username} licb=${(username)=>this.login(username)} locb=${()=>this.logout()}/>
        <${About} path="/about" />
        <${NotFound404} default />
      </${Router}>
    `;
  }
}

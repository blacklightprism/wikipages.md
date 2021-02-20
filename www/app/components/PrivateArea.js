import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { route } from "/app/lib/preact-router-3.2.1.es.min.js";

import { LoginArea } from "/app/components/LoginArea.js";
import { AdminArea } from "/app/components/AdminArea.js";
import { ContentBrowser } from "/app/components/ContentBrowser.js";
import { ContentEditor } from "/app/components/ContentEditor.js";
import { ContentView } from "/app/components/ContentView.js";

export class PrivateArea extends Component {
  constructor(props) {
    super();
  }
  login(username) {
    this.props.licb(username);
  }
  logout() {
    fetch("/logout/"+this.props.username, {
      method: "delete"
    }).then((response) => {
      response.text().then((answertext) => {
        if(answertext === this.props.username) {
          this.props.locb();
        }
      });
    });
  }
  toggleAdminArea() {
    document.getElementById("adminareawrapper").hidden = !document.getElementById("adminareawrapper").hidden;
  }
  updateProps() {
    let request = this.props.request.split("/");
    this.props.action = request.shift();
    this.props.path = request.join("/") || "index.md";
  }
  edit() {
    route("/me/edit/"+this.props.path);
  }

  render() {  //props, state
    this.updateProps();
    return html`
      <div id="PrivateArea">
        <!--<mini><button onclick=${toggleScheme} style="float:right;"> \u2600\uFE0F <b>//</b> \u{1F311}</button></mini><br/><br/>-->
        ${ !this.props.loggedIn && html`
          <${LoginArea} licb=${(username)=>this.login(username)}/>
          <br/><br/>
          <div style="max-width: 300px; margin: auto"><mini><a class="awoarrow" onclick=${() => {this.toggleAdminArea()}} > Manage Users.. </a></mini></div>
          <div id="adminareawrapper" hidden><${AdminArea}/></div>`}
        ${ this.props.loggedIn && html`
          <a href="/" onclick=${() => {this.logout()}} style="float:right" native>Logout</a>
          <${ContentBrowser} request=${this.props.path} directive="private" username=${this.props.username} locb=${()=>this.logout()}/><br/><br/>`}
        ${ this.props.loggedIn && this.props.action==="view" && html`
          <button class="mirror" onclick=${()=>this.edit()} style="float: right;"> \u270E </button>
          <mini> Viewing file: /${this.props.path} </mini>
          <${ContentView} request=${this.props.path} directive="private" username=${this.props.username} locb=${()=>this.logout()}/>`}
        ${ this.props.loggedIn && this.props.action==="edit" && html`
          <${ContentEditor} request=${this.props.path} directive="private" username=${this.props.username} locb=${()=>this.logout()}/>`}
      </div>
    `;
  }
}

import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { route } from "/app/lib/preact-router-3.2.1.es.min.js";

import { ContentView } from "/app/components/ContentView.js";

export class UserArea extends Component {
  constructor(props) {
    super();
  }
  updateProps() {
    let request = this.props.request.split("/");
    this.props.username = request.shift() || "default";
    this.props.path = request.join("/") || "index.md";
  }
  gotoUser() {
    let user = document.getElementById("usersearch").value;
    route("/user/"+user);
  }
  render() {  //props, state
    this.updateProps();
    return html`
      <div id="UserArea">
        <input id="usersearch" type="text" placeholder="Search User.." onkeydown=${(e) => {if(e.key==='Enter'){e.preventDefault();this.gotoUser()}}}></input><a class="awoarrow" onclick=${()=>{this.gotoUser();}}>Search!</a>
        <br/>
        <${ContentView} request=${this.props.path} directive="user" username=${this.props.username} />
      </div>
    `;
  }
}

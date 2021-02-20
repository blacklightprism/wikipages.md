import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";

export class AdminArea extends Component {
  constructor(props) {
    super();
  }
  execMethod(adminpw, method, username, newusrpw) {
    libcrypto().getHashOfText(adminpw).then((adminpwhash)=>{
      libcrypto().getHashOfText(newusrpw||"fallbackifnotneeded").then((userpwhash)=>{
        if (document.getElementById("ishash").checked === "true") {
          userpwhash = newusrpw;
        }
        fetch("/adminapi", {
          method: "put",
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({adminpwhash: adminpwhash, operation: method, usertoedit: username, newusrpw: userpwhash})
        }).then((response) => {
          response.text().then((answertext) => {
            if(answertext === "operationcompletedsuccessfully") {
              document.getElementById("actionbutton").classList.remove("buttonwaiting");
              document.getElementById("actionbutton").classList.remove("buttonerror");
              document.getElementById("actionbutton").classList.add("buttonok");
              document.getElementById("password").value = "";
            }
            else {
              console.log(answertext);
              document.getElementById("actionbutton").classList.remove("buttonok");
              document.getElementById("actionbutton").classList.remove("buttonwaiting");
              document.getElementById("actionbutton").classList.add("buttonerror");
            }
          });
        });
      });
    });
  }
  usernameStructureValid(username) {
    const usrpattern = new RegExp("[a-z][a-z0-9]{3,}");
    return usrpattern.exec(username);
  }
  passwordStructureValid(pwd) {
    const pwdpattern = new RegExp(".{8,}");
    return pwdpattern.exec(pwd);
  }
  verify(e) {
    e.preventDefault();
    let adminpw = document.getElementById("adminpw").value;
    document.getElementById("adminpw").value = "";
    let method = document.getElementById("method").value;
    let username = document.getElementById("user").value;
    let userpwd = document.getElementById("newusrpw").value;
    if (!this.usernameStructureValid(username) || !this.passwordStructureValid(adminpw)) {
      document.getElementById("actionbutton").classList.remove("buttonok");
      document.getElementById("actionbutton").classList.remove("buttonwaiting");
      document.getElementById("actionbutton").classList.add("buttonerror");
      return;
    }
    if (method === "create" || method === "passwd") {
      if (!this.passwordStructureValid(userpwd)) {
        document.getElementById("actionbutton").classList.remove("buttonok");
        document.getElementById("actionbutton").classList.remove("buttonwaiting");
        document.getElementById("actionbutton").classList.add("buttonerror");
        return;
      }
    }
    document.getElementById("actionbutton").classList.remove("buttonok");
    document.getElementById("actionbutton").classList.remove("buttonerror");
    document.getElementById("actionbutton").classList.add("buttonwaiting");
    this.execMethod(adminpw, method, username, userpwd);
  }
  selectionChanged() {
    let sel = document.getElementById("method").value;
    if (sel === "create" || sel === "passwd") {
      document.getElementById("newusrpw").type = "password";
    } else {
      document.getElementById("newusrpw").type = "hidden";
    }
  }
  render() {  //props, state
    return html`
      <div id="AdminArea"><br/>
        <form><mini>
          <select name="method" id="method" onchange=${()=>{this.selectionChanged()}} required>
            <option value="create">Create User</option>
            <option value="passwd">Change User Password</option>
            <option value="lock">Lock User</option>
            <option value="unlock">Unlock User</option>
            <option value="delete">Delete User</option>
          </select>
          <input id="adminpw" type="password" placeholder="Admin Password" name="adminpw" pattern=".{8,}" required></input>
          <input id="user" type="text" placeholder="Username" name="user" pattern="[a-z][a-z0-9]{3,}" required ></input>
          <input id="newusrpw" type="password" placeholder="New User Password" name="newusrpw" pattern=".{8,}" required></input>
          <input type="checkbox" id="ishash" name="ishash" value="ishash" style="display: inline; width: auto; margin: 1em"></input>
          <label for="ishash" style="display: inline; width: auto; line-heigth: 1em">password is SHA-256 hash</label>
          <button id="actionbutton" onclick=${(e)=>this.verify(e)}>Execute!</button>
        </mini></form>
      </div>
    `;
  }
}

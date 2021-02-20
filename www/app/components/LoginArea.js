import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";

export class LoginArea extends Component {
  constructor(props) {
    super();
    /*let cr = libcrypto("averysecurepassword.");
    cr.encryptText("LoginArea Crypto Test.").then((enc) => {
      let data = btoa(new Uint8Array(enc.data));
      let salt = enc.salt;
      let iv = enc.iv;

      //send and recieve data (data, salt and iv)

      let newdata = Uint8Array.from(atob(data).split(",")).buffer;
      cr.decryptText({data: newdata, salt: salt, iv: iv}).then((dec) => {
        console.log(dec);
      });
    });*/
  }
  login(username,pwd) {
    libcrypto().getHashOfText(pwd).then((hash)=>{
      fetch("/login/"+username, {
        method: "post",
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({pwhash: hash})
      }).then((response) => {
        response.text().then((answertext) => {
          if(answertext === username) {
            document.getElementById("loginbutton").classList.remove("buttonwaiting");
            document.getElementById("loginbutton").classList.remove("buttonerror");
            document.getElementById("loginbutton").classList.add("buttonok");
            localStorage.setItem('username', username);
            document.Crypto = libcrypto(pwd);
            this.props.licb(username);
          }
          else {
            console.log(answertext);
            document.getElementById("loginbutton").classList.remove("buttonok");
            document.getElementById("loginbutton").classList.remove("buttonwaiting");
            document.getElementById("loginbutton").classList.add("buttonerror");
          }
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
  verifyLogin(e) {
    e.preventDefault();
    let username = document.getElementById("username").value;
    let pwd = document.getElementById("password").value;
    if (!this.usernameStructureValid(username) || !this.passwordStructureValid(pwd)) {
      document.getElementById("loginbutton").classList.remove("buttonok");
      document.getElementById("loginbutton").classList.remove("buttonwaiting");
      document.getElementById("loginbutton").classList.add("buttonerror");
      return;
    }
    document.getElementById("loginbutton").classList.remove("buttonok");
    document.getElementById("loginbutton").classList.remove("buttonerror");
    document.getElementById("loginbutton").classList.add("buttonwaiting");
    this.login(username,pwd);
  }
  componentDidMount() {
    document.getElementById("username").value = localStorage.getItem('username');
  }
  render() {  //props, state
    return html`
      <div id="LoginArea">
        <form>
          <label for="username">Username: <mini>( [a-z] + min. 3 [a-z0-9] )</mini></label>
          <input id="username" type="text" placeholder="Username" name="username" pattern="[a-z][a-z0-9]{3,}" required onkeydown=${(e) => {if(e.key==='Enter'){e.preventDefault();document.getElementById("password").focus()}}}></input>
          <label for="password">Password: <mini>(min. 8 Characters)</mini></label>
          <input id="password" type="password" placeholder="Password" name="password" pattern=".{8,}" required></input>
          <button id="loginbutton" onclick=${(e)=>this.verifyLogin(e)}>Login</button>
        </form>
        ${location.protocol !== "https:" && html`<br/><mini><div style="color:red;">Warning: This is not an encrypted connection!</div></mini>`}
      </div>
    `;
  }
}

import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { route } from "/app/lib/preact-router-3.2.1.es.min.js";
import { nanoid } from "/app/lib/nanoid-3.1.10.reducedalphabet.min.js";
import { getContent } from "/app/getContent.js";

export class ContentEditor extends Component {
  constructor() {
    super();
    this.setState({id: "ContentEditor-"+nanoid(5)});
  }
  autoHeight() {
    let element = document.getElementById(this.state.id+"-textarea");
    element.style.height = (element.scrollHeight-20)+"px";
    element.style.height = (element.scrollHeight+2)+"px";
    if (element.style.height === 0) element.style.height = "1em";
  }
  updateView() {
    getContent(this.props.directive,this.props.username,this.props.request).then((content) => {
      if (content === "request error - 403") {
        this.props.locb();
        return;
      }
      if (content !== "" && !this.props.request.startsWith("public/") && this.props.username !== "admin") {
        let [salt, iv, data] = content.split(".");
        if(salt.length !== 32 || iv.length !== 32 || data === "") {
          document.getElementById(this.state.id+"-textarea").value = content;
          this.autoHeight();
          return;
        }
        let buf = new Uint8Array(atob(data).split(",")).buffer;
        document.Crypto.decryptText({data: buf, salt: salt, iv: iv}).then((dec) => {
          document.getElementById(this.state.id+"-textarea").value = dec;
          this.autoHeight();
        });
      } else {
        document.getElementById(this.state.id+"-textarea").value = content;
        this.autoHeight();
      }
    });
  }
  put(val) {
    fetch("/privateuserdata/"+this.props.username+"/"+this.props.request, {
      method: "put",
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data: val})
    }).then((response) => {
      response.text().then((answertext) => {
        if(answertext === "/"+this.props.request) {
          route("/me/view/"+this.props.request);
        }
        else {
          console.log(answertext);
          if (response.status === 403) {
            this.props.locb();
          }
        }
      });
    });
  }
  save() {
    let val = document.getElementById(this.state.id+"-textarea").value;
    val = val.trim();
    if (val === "") val = ".";
    if (!this.props.request.startsWith("public/") && this.props.username !== "admin") {
      document.Crypto.encryptText(val).then((enc) => {
        let data = btoa(new Uint8Array(enc.data));
        val = enc.salt + "." + enc.iv + "." + data;
        this.put(val);
      });
    } else {
      this.put(val);
    }
  }
  discard() {
    route("/me/view/"+this.props.request);
  }
  componentDidMount() {
    this.updateView();
  }
  componentDidUpdate() {
    this.updateView();
  }

  render(_,{id}) {  //props, state
    return html`
      <div id=${id}>
        <button onclick=${()=>this.discard()} style="float: right;">\u2718</button>
        <button onclick=${()=>this.save()} style="float: right;">\u2714</button>
        <mini> Editing file: ${this.props.request} </mini>
        <textarea id=${id}-textarea onkeyup=${()=>this.autoHeight()}></textarea>
      </div>
    `;
  }
}

import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { nanoid } from "/app/lib/nanoid-3.1.10.reducedalphabet.min.js";
import { getContent } from "/app/getContent.js";

export class ContentView extends Component {
  constructor() {
    super();
    this.setState({id: "ContentView-"+nanoid(5)});
  }
  updateView() {
    getContent(this.props.directive,this.props.username,this.props.request).then((content) => {
      if (content === "request error - 403") {
        this.props.locb();
        return;
      }
      if (this.props.directive === "private" && content !== "" && !this.props.request.startsWith("public/") && this.props.username !== "admin") {
        let [salt, iv, data] = content.split(".");
        if(salt.length !== 32 || iv.length !== 32 || data === "") {
          document.getElementById(this.state.id).innerHTML = DOMPurify.sanitize(marked(content));
          return;
        }
        let buf = new Uint8Array(atob(data).split(",")).buffer;
        document.Crypto.decryptText({data: buf, salt: salt, iv: iv}).then((dec) => {
          document.getElementById(this.state.id).innerHTML = DOMPurify.sanitize(marked(dec));
        });
      } else {
        document.getElementById(this.state.id).innerHTML = DOMPurify.sanitize(marked(content));
      }
    });
  }
  componentDidMount() {
    this.updateView();
  }
  componentDidUpdate() {
    this.updateView();
  }

  render(_,{id}) {  //props, state
    return html`
      <div id=${id} class=${this.props.class}></div>
    `;
  }
}

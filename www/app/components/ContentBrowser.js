import { html, Component, render } from "/app/lib/htm-index-3.0.4.module.js";
import { nanoid } from "/app/lib/nanoid-3.1.10.reducedalphabet.min.js";
import { getContent } from "/app/getContent.js";

export class ContentBrowser extends Component {
  constructor(props) {
    super();
    props.dir = "";
    this.setState({dir: "", fl: [], dl: []});
  }
  toggleFilelist() {
    document.getElementById("ContentBrowser-filelist").hidden = !document.getElementById("ContentBrowser-filelist").hidden;
  }
  changeDirectory(dir) {
    let newdir;
    if(dir === "..") {
      newdir = this.props.dir.split("/");
      newdir.pop();
      newdir = newdir.join("/");
    }
    else if (dir === ".") {
      return;
    }
    else {
      newdir = this.props.dir + "/" + dir;
    }
    this.props.dir = newdir;
    this.updateView();
  }
  changeRemote(name,type,method) {
    fetch("/privateuserdata/"+this.props.username+this.props.dir+"/"+name, {
      method: method,
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({type: type})
    }).then((response) => {
      response.text().then((answertext) => {
        if(answertext === this.props.dir+"/"+name) {
          this.updateView();
        }
        else console.log(answertext);
      });
    });
  }
  createFile() {
    let filename = prompt("Specify full name of new file (with file extension)");
    if (filename === null) return;
    if (filename.startsWith(".") || filename.endsWith("index.md")) {
      alert("You cannot create files with name index.md or beginning with a dot.");
      return;
    }
    this.changeRemote(filename, "file","post");
  }
  deleteFile() {
    let filename = prompt("Specify full name of file you want to DELETE (with file extension).");
    if (filename === null) return;
    if (filename.startsWith(".") || filename.endsWith("index.md")) {
      alert("You cannot delete files with name index.md or beginning with a dot.");
      return;
    }
    this.changeRemote(filename, "file","delete");
  }
  createFolder() {
    let foldername = prompt("Specify name of new folder");
    if (foldername === null) return;
    if (foldername.startsWith(".") || foldername.endsWith("public")) {
      alert("You cannot create folders with name public or beginning with a dot.");
      return;
    }
    this.changeRemote(foldername, "folder","post");
  }
  deleteFolder() {
    let foldername = prompt("Specify name of folder you want to DELETE.");
    if (foldername === null) return;
    if (foldername.startsWith(".") || foldername.endsWith("public")) {
      alert("You cannot delete folders with name public or beginning with a dot.");
      return;
    }
    this.changeRemote(foldername, "folder","delete");
  }
  updateView() {
    getContent("privatefiles", this.props.username, this.props.dir).then((data) => {
      if (data === "request error - 403") {
        this.props.locb();
        return;
      }
      data = JSON.parse(data);
      let fl = [];
      let dl = [];
      if (this.props.dir !== "") dl.push("..");
        else dl.push(".");
      data.directories.forEach(dir => {
        dl.push(dir);
      });
      data.files.forEach(file => {
        fl.push(file);
      });
      this.setState({dir: this.props.dir, fl: fl, dl: dl})
    });
  }
  componentDidMount() {
    this.updateView();
  }
  componentDidUpdate(prevProps, prevState) {
    this.props.dir = prevProps.dir;
  }

  render(_,{dir,fl,dl}) {  //props, state
    return html`
      <div id="ContentBrowser">
        Hello ${this.props.username}! Browse your files: <mini><a class="awoarrow" onclick=${() => {this.toggleFilelist()}} > |Show/Hide| </a></mini><br/>
        <div id=ContentBrowser-filelist>
          <mini> Current Directory: ${dir || "/"} </mini> <br/>
          <mini style="padding-left: 0em;"> <a class="awoarrow" onclick=${()=>{this.createFile()}}>Create file..</a> </mini>
          <mini style="padding-left: 0.5em;"> <a class="awoarrow" onclick=${()=>{this.deleteFile()}}>Delete file..</a> </mini>
          <mini style="padding-left: 0.5em;"> <a class="awoarrow" onclick=${()=>{this.createFolder()}}>Create folder..</a> </mini>
          <mini style="padding-left: 0.5em;"> <a class="awoarrow" onclick=${()=>{this.deleteFolder()}}>Delete folder..</a> </mini>
          <br/>
          ${dl.map((directory) => html`<a class="awdirlink" onclick=${()=>{this.changeDirectory(directory)}} > ${directory} </a><br/>`)}
          ${fl.map((file) => html`<a class="awfilelink" href="/me/view${dir}/${file}"> ${file} </a><br/>`)}
        </div>
      </div>
    `;
  }
}

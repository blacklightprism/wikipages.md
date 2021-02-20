function initScrollHandler() {
  document.getElementById("scrollbarwrapper").onscroll = scrollHandler;
  scrollHandler();
}
function scrollHandler() {
  if (document.documentElement.dataset.theme === "dark") {
    document.getElementById("scrollbarwrapper").style.borderColor = "rgba(255, 255, 255, 0.4)";
  } else {
    document.getElementById("scrollbarwrapper").style.borderColor = "rgba(0, 0, 0, 0.4)";
  }
  clearTimeout(this.lastscroll);
  this.lastscroll = setTimeout(function(){
    document.getElementById("scrollbarwrapper").style.borderColor = "rgba(0, 0, 0, 0.0)";
  }, 1500);
} window.onload = initScrollHandler;

var styles = `
  body {
    overflow: hidden;
  }
  #scrollbarwrapper {
    box-sizing: border-box;
    display: block;
    width: 100vw;
    height: 100vh;
    padding: 1.5em;
    padding-top: 0;
    border-color: rgba(0, 0, 0, 0.0);
    transition: border-color 0.5s ease;
    overflow: auto;
  }
  #scrollbarwrapper::-webkit-scrollbar {
    border-right-style: inset;
    border-right-width: calc(100vw + 100vh);
    width: 0.4em;
    height: 0.4em;
    /*border-color: inherit;*/
    border-color: rgba(0, 0, 0, 0.0);
  }
  #scrollbarwrapper::-webkit-scrollbar-thumb {
    border-right-style: inset;
    border-right-width: calc(100vw + 100vh);
    border-radius: 5px;
    border-color: inherit;
    /*border-color: rgba(0, 0, 0, 0.1);*/
  }
  #scrollbarwrapper::-webkit-scrollbar-thumb:hover {
    border-color: rgba(0, 0, 0, 0.4);
  }
  #scrollbarwrapper::-webkit-scrollbar-thumb:active {
    border-color: rgba(0, 0, 0, 0.45);
  }
`;
let styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

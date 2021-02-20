export function getContent(directive,username,requestpath) {
  let uri;
  if (directive === "public") {
    uri = "/publicdata/"+requestpath;
  }
  else if (directive === "user") {
    uri = "/publicuserdata/"+username+"/"+requestpath;
  }
  else if (directive === "private"){
    uri = "/privateuserdata/"+username+"/"+requestpath;
  }
  else {  //directive === "privatefiles"
    uri = "/privateuserfilelist/"+username+requestpath;
  }
  return fetch(uri).then((data) => {
    if (data.status === 200) {
      return data.text();
    } else {
      data.text().then(text=>console.log(text));
      return "request error - "+data.status;
    }
  });
}

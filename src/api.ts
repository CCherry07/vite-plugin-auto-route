

export function getFilesInfo() {
  fetch('/files/info').then(res => res.json()).then(data => {
    console.log(data);
  })
}

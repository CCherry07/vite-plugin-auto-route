

export function getFilesInfo() {
  fetch('/files/info').then(res => res.json()).then(data => {
    console.log(data);
  })
}

export function addRoute() {
  fetch('/add/route', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test',
      path: '/Test',
      dir: '/src/pages'
    })
  }).then(res => res.json()).then(data => {
    console.log(data);
  })
}

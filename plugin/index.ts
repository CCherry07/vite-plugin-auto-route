import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
const VitePluginAutoRoute = (options?): Plugin => {
  return {
    name: 'vite-plugin-auto-route',
    configResolved(config) {
      // console.log('configResolved', config)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // handle router
        // @ts-ignore
        if (req.url.includes('router')) {
          const context = fs.readFileSync('./src/router.ts', 'utf-8')
          const reg = /(?<=routes: \[)([\s\S]*?)(?=\])/g
          // 匹配 import 语句
          const importReg = /(?<=import\()(.*?)(?=\))/g
          const importList = context.match(importReg)?.map(item => item.slice(1, -1))
          // const routeList = context.match(reg)?.[0].split(',').map(item => item.trim())
          // 根据文件名 创建文件
          importList?.forEach(item => {
            const filePath = path.resolve(__dirname, `../src/${item}`)
            console.log(filePath);
            if (!fs.existsSync(filePath)) {
              writeFileRecursive(`./src/${item}`)
            }
          })
        }
        next()
      })
    }
  }
}

const writeFileRecursive = function (path, buffer = '', callback?) {
  let lastPath = path.substring(0, path.lastIndexOf("/"));
  fs.mkdir(lastPath, { recursive: true }, (err) => {
    if (err) return callback(err);
    fs.writeFile(path, buffer, function (err) {
      if (err) return callback(err);
      return callback?.(null);
    });
  });
}

export default VitePluginAutoRoute

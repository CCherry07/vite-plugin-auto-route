import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface Options {
  templatePath: string
}

const defaultTemplate = `
<template>
  <div> default </div>
</template>

<script setup>

</script>
<style scoped>

</style>
`

const VitePluginAutoRoute = (options?: Options): Plugin => {
  const { templatePath } = options || {}
  const template = templatePath ? fs.readFileSync(templatePath, 'utf-8') : defaultTemplate
  return {
    name: 'vite-plugin-auto-route',
    configResolved(config) {
      // console.log('configResolved', config)
      // TODO: 读取文件别名 配置
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
              writeFileRecursive(`./src/${item}`, template)
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

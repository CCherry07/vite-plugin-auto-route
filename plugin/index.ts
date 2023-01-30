import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface Options {
  pagesDir: string,
  routesDir: string,
  templatePath?: string,
}

const defaultTemplate = `
<template>
  <div> name </div>
</template>

<script setup>

</script>
<style scoped>

</style>
`

const VitePluginAutoRoute = (options?: Options): Plugin => {
  const { templatePath, routesDir = 'src/routes' } = options || {}
  const template = templatePath ? fs.readFileSync(templatePath, 'utf-8') : defaultTemplate
  let alias
  return {
    name: 'vite-plugin-auto-route',
    enforce: 'pre',
    configResolved(config) {
      // console.log('configResolved', config)
      // TODO: 读取文件别名 配置
      alias = config.resolve?.alias
      if (routesDir) {
        const routerPath = path.resolve(process.cwd(), routesDir)
        const currentFile = fs.readdirSync(routerPath).find(item => item.includes('index')) // 获取文件夹下的文件
        const context = fs.readFileSync(fs.statSync(routerPath).isDirectory() ? `${routerPath}/${currentFile}` : routerPath, 'utf-8')
        // const reg = /(?<=routes: \[)([\s\S]*?)(?=\])/g
        // 匹配 import 语句
        const importReg = /(?<=import\()(.*?)(?=\))/g
        const importList = context.match(importReg)?.map(item => item.slice(1, -1))
        // const routeList = context.match(reg)?.[0].split(',').map(item => item.trim())
        // 根据文件名 创建文件
        console.log(importList);

        importList?.forEach(item => {
          // 计算 ../ 的数量
          const count = item.split('../').length - 1
          // 计算 ../ 后的路径
          const targetPath = routerPath.split('/').slice(0, -count).join('/')
          const filePath = path.resolve(targetPath, `${item.replace(/\.\.\//g, '')}`)
          if (!fs.existsSync(filePath)) {
            writeFileRecursive(filePath, template.replace("name", item))
          }
        })
      }
    },



    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // handle router
        // @ts-ignore
        // if (req.url.includes('router') && !req.url.includes('node_modules')) {
        //   const routerPath = path.resolve(process.cwd(), `.${req.url!}`)
        //   console.log(routerPath)
        //   const context = fs.readFileSync(routerPath, 'utf-8')
        //   const reg = /(?<=routes: \[)([\s\S]*?)(?=\])/g
        //   // 匹配 import 语句
        //   const importReg = /(?<=import\()(.*?)(?=\))/g
        //   const importList = context.match(importReg)?.map(item => item.slice(1, -1))
        //   // const routeList = context.match(reg)?.[0].split(',').map(item => item.trim())
        //   // 根据文件名 创建文件
        //   importList?.forEach(item => {
        //     const filePath = path.resolve(process.cwd(), `./src/${item}`)
        //     if (!fs.existsSync(filePath)) {
        //       writeFileRecursive(`./src/${item}`, template.replace("name", item))
        //     }
        //   })
        // }
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

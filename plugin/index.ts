import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface Options {
  pagesDir: string,
  routesDir: string,
  templatePath?: string,
  getFilesInfo?: string,
  postRoute?: string
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
  const { templatePath, pagesDir = 'src/pages', routesDir = 'src/routes', postRoute = '/add/route', getFilesInfo = '/files/info' } = options || {}
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
        // TODO: 根据请求的data，生成对应的路由，及其文件
        if (req.url === postRoute) {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            const { name, path } = JSON.parse(body)
            const filePath = path.resolve(process.cwd(), routesDir, `${path}/${name}.vue`)
            if (!fs.existsSync(filePath)) {
              writeFileRecursive(filePath, template.replace("name", name))
            }
            // 写入route 信息
            const routerPath = path.resolve(process.cwd(), routesDir)
            const currentFile = fs.readdirSync(routerPath).find(item => item.includes('index')) // 获取文件夹下的文件
            const context = fs.readFileSync(fs.statSync(routerPath).isDirectory() ? `${routerPath}/${currentFile}` : routerPath, 'utf-8')
            const reg = /(?<=routes: \[)([\s\S]*?)(?=\])/g
            const routeList = context.match(reg)?.[0].split(',').map(item => item.trim())
            // console.log(routeList);
          })
        } else if (req.url === getFilesInfo) {
          const pagesPath = path.resolve(process.cwd(), pagesDir)
          const treeFiles = processDir(pagesPath)
          req.headers['content-type'] = 'application/json'
          console.log(treeFiles);
          res.end(JSON.stringify(treeFiles))
          return
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
function getPartPath(dirPath) {
  let base = basepath.split(/\/|\\/g);
  dirPath = dirPath.split(/\/|\\/g);
  while (base.length && dirPath.length && base[0] === dirPath[0]) {
    base.shift();
    dirPath.shift();
  }
  return dirPath.join("/");
}
let filterFile = ["node_modules", "\\..*"]; //过滤文件名，使用，隔开
let isFullPath = true; //是否输出完整路径
let basepath = "../"; //解析目录路径
function isFilterPath(item) {
  for (let i = 0; i < filterFile.length; i++) {
    let reg = filterFile[i];
    if (item.match(reg) && item.match(reg)[0] === item) return true;
  }
  return false;
}

function processDir(dirPath, dirTree = []) {
  let list = fs.readdirSync(dirPath);
  list = list.filter((item) => {
    return !isFilterPath(item);
  });
  list.forEach((itemPath) => {
    const fullPath = path.join(dirPath, itemPath);
    const fileStat = fs.statSync(fullPath);
    const isFile = fileStat.isFile();
    const dir = {
      name: (isFullPath ? getPartPath(fullPath) : itemPath).replace(process.cwd(), ""),
    };
    if (!isFile) {
      dir.children = processDir(fullPath, []);
    }
    dirTree.push(dir);
  });
  return dirTree;
}

export default VitePluginAutoRoute

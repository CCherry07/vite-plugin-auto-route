import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import MagicString from 'magic-string';
let filterFile = ["node_modules", "\\..*"]; //过滤文件名，使用，隔开
let basepath = "../"; //解析目录路径
let isFullPath = true; //是否显示全路径
let rootPath = 'src'

interface Options {
  pagesDir: string,
  routesDir: string,
  templatePath?: string,
  getFilesInfo?: string,
  postRoute?: string,
  showFullPath?: boolean,
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
  const {
    templatePath,
    pagesDir = 'src/pages',
    routesDir = 'src/routes',
    postRoute = '/add/route',
    getFilesInfo = '/files/info',
    showFullPath = true,
  } = options || {}
  isFullPath = showFullPath
  basepath = pagesDir
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
        // console.log(importList);

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
        if (req.url === postRoute && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            const { name, path: routePath, dir, meta } = JSON.parse(body)
            const filePath = path.resolve(process.cwd(), `./${dir}/${name}.vue`)
            req.headers['content-type'] = 'application/json'
            if (fs.existsSync(filePath)) {
              res.end(JSON.stringify({ code: 500, msg: '文件已存在' }))
              return
            } else {
              writeFileRecursive(filePath, template.replace("name", name))
              // 写入route 信息
              const routerPath = path.resolve(process.cwd(), routesDir)
              const currentFile = fs.readdirSync(routerPath).find(item => item.includes('index')) // 获取文件夹下的文件
              const context = fs.readFileSync(fs.statSync(routerPath).isDirectory() ? `${routerPath}/${currentFile}` : routerPath, 'utf-8')
              const ss = new MagicString(context)
              const reg = /(?<=routes: \[)([\s\S]*?)(?=\])/g
              // TODO: 生成路由信息 import 语句
              const routeInfo = `{
              path: '${routePath}',
              name: '${name}',
              component: () => import('../pages/${name}.vue'),
              meta: {
                title: '${name}',
              }
            }`

              // 写入 routeInfo
              const result = context.replace(reg, (match) => {
                return match + ',' + routeInfo
              })

              ss.overwrite(0, context.length, result)
              // const routeList = context.match(reg)?.[0].split(',').map(item => item.trim())
              fs.writeFileSync(fs.statSync(routerPath).isDirectory() ? `${routerPath}/${currentFile}` : routerPath, ss.toString())

              // console.log(routeList);
              res.end(JSON.stringify({ code: 200, data: { routeInfo } }))
              return
            }
          })
        } else if (req.url === getFilesInfo) {
          const pagesPath = path.resolve(process.cwd(), pagesDir)
          const treeFiles = processDir(pagesPath)
          req.headers['content-type'] = 'application/json'
          res.end(JSON.stringify(treeFiles))
          return
        } else {
          next()
        }
      })
    }
  }
}

const writeFileRecursive = function (path, buffer = '', callback?) {
  let lastPath = path.substring(0, path.lastIndexOf("/"));
  fs.mkdir(lastPath, { recursive: true }, (err) => {
    if (err) return callback?.(err);
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

function isFilterPath(item) {
  for (let i = 0; i < filterFile.length; i++) {
    let reg = filterFile[i];
    if (item.match(reg) && item.match(reg)[0] === item) return true;
  }
  return false;
}

function processDir(dirPath, dirTree: any = []) {
  let list = fs.readdirSync(dirPath);
  list = list.filter((item) => {
    return !isFilterPath(item);
  });
  list.forEach((itemPath) => {
    const fullPath = path.join(dirPath, itemPath);
    const fileStat = fs.statSync(fullPath);
    const isFile = fileStat.isFile();
    const dir = {
      name: (isFullPath ? getPartPath(fullPath) : itemPath).replace(process.cwd() + `/${rootPath}`, ""),
      children: [],
    };
    if (!isFile) {
      dir.children = processDir(fullPath, []);
    }
    dirTree.push(dir);
  });
  return dirTree;
}

export default VitePluginAutoRoute

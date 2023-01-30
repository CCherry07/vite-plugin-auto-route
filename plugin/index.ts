import { Plugin } from 'vite'

const VitePluginAutoRoute = (options?): Plugin => {
  return {
    name: 'vite-plugin-auto-route',
    configResolved(config) {
      console.log('configResolved', config)
    }
  }
}

export default VitePluginAutoRoute

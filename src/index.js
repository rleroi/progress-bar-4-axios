import 'nprogress/nprogress.css'

import NProgress from 'nprogress'
import axios from 'axios'

const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total)

export function loadProgressBar (config = {}, instance = axios) {
  let requestsCounter = 0
  config.delay = config.delay !== undefined ? config.delay : 200

  const setupStartProgress = () => {
    instance.interceptors.request.use(config => {
      requestsCounter++
      NProgress.start()
      return config
    })
  }

  const setupUpdateProgress = () => {
    const update = e => NProgress.inc(calculatePercentage(e.loaded, e.total))
    instance.defaults.onDownloadProgress = update
    instance.defaults.onUploadProgress = update
  }

  const setupStopProgress = () => {
    const responseFunc = response => {
      if ((--requestsCounter) === 0) {
        setTimeout(() => {NProgress.done()}, config.delay);
      }
      return response
    }

    const errorFunc = error => {
      if ((--requestsCounter) === 0) {
        setTimeout(() => {NProgress.done()}, config.delay);
      }
      return Promise.reject(error)
    }

    instance.interceptors.response.use(responseFunc, errorFunc)
  }

  NProgress.configure(config)
  setupStartProgress()
  setupUpdateProgress()
  setupStopProgress()
}

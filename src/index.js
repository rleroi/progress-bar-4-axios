import 'nprogress/nprogress.css'

import NProgress from 'nprogress'
import axios from 'axios'

const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total)

export function loadProgressBar (config = {}, instance = axios) {
  let requestsCounter = 0
  config.delay = config.delay !== undefined ? config.delay : 200
  config.autoStart = config.autoStart !== undefined ? config.autoStart : true

  let isStarted = false;
  const start = () => {
    NProgress.start()
    isStarted = true;
  }

  const done = (force) => {
    setTimeout(() => {
      isStarted = false;
      NProgress.done(force)
    }, config.delay);
  }

  const setupStartProgress = () => {
    instance.interceptors.request.use(axiosConfig => {
      requestsCounter++
      if(config.autoStart) {
        start();
      }
      return axiosConfig
    })
  }

  const setupUpdateProgress = () => {
    const update = e => NProgress.inc(calculatePercentage(e.loaded, e.total))
    if(isStarted) {
      instance.defaults.onDownloadProgress = update
      instance.defaults.onUploadProgress = update
    }
  }

  const setupStopProgress = () => {
    const responseFunc = response => {
      if ((--requestsCounter) === 0) {
        done();
      }
      return response
    }

    const errorFunc = error => {
      if ((--requestsCounter) === 0) {
        done();
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

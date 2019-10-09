let INSTANCE = {}

export default class InsideScreen {
  constructor({
    rootMargin = '0px',
    threshold = 0.5,
  } = {}) {
    const insideScreenHash = `${rootMargin}-${threshold}`
    if (INSTANCE[insideScreenHash]) {
      return INSTANCE[insideScreenHash]
    }

    INSTANCE[insideScreenHash] = this

    const list = []
    const intesectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const data = list.find(({ el }) => el === entry.target)
        if (data) {
          data.cb(entry.isIntersecting, entry.intersectionRatio)
        }
      })
    }

    const intersectionObserver = new IntersectionObserver(intesectionObserverCallback, {
      rootMargin,
      threshold,
    })

    this.add = (DOMElement, callback) => {
      this.remove(DOMElement)
      intersectionObserver.observe(DOMElement)
      list.push({
        el: DOMElement,
        cb: callback,
        in: false,
      })
    }

    this.remove = (DOMElement) => {
      const id = list.findIndex(({ el }) => el === DOMElement)
      if (id > -1) {
        const { el } = list[id]
        intersectionObserver.unobserve(el)
        list.splice(id, 1)
      }
    }

    this.dispose = () => {
      intersectionObserver.disconnect()
      delete INSTANCE[insideScreenHash]
    }
  }
}

import AutoLoader from './AutoLoader'

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

let INSTANCE = false

class Resize
{
    constructor()
    {
        if (INSTANCE)
        {
            return INSTANCE
        }
        else
        {
            INSTANCE = this
        }

        this.width = document.body.clientWidth || window.innerWidth
        this.height = window.innerHeight

        this.delay1 = 300
        this.delay2 = 1000 // 500 // 300
        this.optimizePhone = false
        this.optimizeRefresh = false // true

        this._onResizedCb = []

        window.addEventListener('resize', this._onResize.bind(this), false)


        this.autoLoader = new AutoLoader()
        this.autoLoader.addOnElementLoaded(this._onResize.bind(this))


        // Fix iOS
        if (IS_IOS)
            this._resized2To = setTimeout(this._onResize.bind(this), this.delay2)
    }

    //  ---------
    //  LISTENERS
    //  ---------

    /**
     * Add a listener called at every resized.
     *
     * @param {Function} callback   Called if resized
     * @returns {Boolean} Success
     */
    addOnResized(callback)
    {
        this.removeOnResized(callback)
        this._onResizedCb.push(callback)

        return true
    }

    /**
     * Remove the listener.
     *
     * @param {Function} callback   Same function precedently added
     * @returns {Boolean} Success
     */
    removeOnResized(callback)
    {
        const i = this._onResizedCb.indexOf(callback)
        if (i > -1)
        {
            this._onResizedCb.splice(i, 1)
            return true
        }

        return false
    }

    dispatch(width = this.width, height = this.height)
    {
        this._dispatchResized(width, height)
    }

    refresh()
    {
        this._onResize({}, true)
    }

    _onResize(event, force = false)
    {
        const cb = () =>
        {
            // Like CSS media queries: https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
            const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
            const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

            this._dispatchResized(w, h)
        }

        clearTimeout(this._resized1To)
        clearTimeout(this._resized2To)

        if (force)
        {
            cb()
        }
        else
        {
            this._resized1To = setTimeout(cb, this.delay1)
            this._resized2To = setTimeout(cb, this.delay2)
        }
    }

    _dispatchResized(width, height)
    {
        this.width = width
        this.height = height
        for (const cb of this._onResizedCb)
        {
            cb(width, height)
        }
    }
}

export default Resize
import Raf from './Raf'

const raf = new Raf()
let INSTANCE = false

/**
 * Get the scrolling y data and dispatch it. You can smooth the scroll or
 * reconstruct the curve scroll (in iOS the browser don't dispatch the scroll
 * position at every frame).
 *
 * Use it like this:
 * <code>
 * const scroll = new Scroll()
 *
 * // Configure
 * scroll.curveReconstructionFrames = 0 // Disable curve reconstruction
 * scroll.smoothScrollPower = 120 // Reduce smooth scroll
 *
 * // Update
 * this.update(16.667) // Force calculs and dispatch scroll if necessary.
 *
 * // Add listener (args = [scrollY])
 * scroll.addOnScroll(console.log)
 * scroll.addOnSmoothScroll(console.log)
 *
 * // Remove listener
 * scroll.removeOnScroll(console.log)
 * scroll.removeOnSmoothScroll(console.log)
 *
 * // Inform resize
 * scroll.resizeWindow(window.innerHeight)
 * scroll.resizePage(document.body.offsetHeight)
 *
 * // Get additional datas
 * scroll.y // Read only: get the real y pixel of scroll
 * scroll.realY // Get the real y pixel of scroll
 * scroll.smoothY // Get the smooth y pixel of scroll
 * scroll.delayedY // Get the reconstructed y pixel of scroll
 * scroll.realVelocity // Get the real y velocity of scroll (pixel/millisecond)
 * scroll.smoothVelocity // Get the smooth y velocity of scroll (pixel/millisecond)
 * scroll.delayedVelocity // Get the reconstructed y velocity of scroll (pixel/millisecond)
 *
 * // Reset scroll (In example if you haved changed page)
 * scroll.reset(newY)
 *
 * // Delete
 * scroll.dispose()
 * </code>
 *
 * @type Scroll
 */
class Scroll
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

        // iPhone avoid frames scroll loose (add delay)
        // if curveReconstructionFrames < 2 it's disabled
        this.curveReconstructionFrames = 0 // 6 // frames
        this.smoothScrollPower = 100 // 100 // 250

        this.realY = 0
        this.smoothY = 0
        this.delayedY = 0

        this.winH = -1
        this.pageH = -1

        // Pixel / milliseconds
        this.realVelocity = 0
        this.smoothVelocity = 0
        this.delayedVelocity = 0

        this._onScrollCb = []
        this._onSmoothScrollCb = []

        this._onScroll = this._onScroll.bind(this)
        document.addEventListener('scroll', this._onScroll, false)

        this._initScrollCurveReconstruction(0)

        this._update = this._update.bind(this)
        raf.addOnFrame(this._update)

        this.reset(window.pageYOffset || document.documentElement.scrollTop)
    }

    /**
     * Real position of scroll y (integer).
     * Read only property, alias of realY.
     *
     * @returns {Number}
     */
    get y()
    {
        return this.realY
    }

    /**
     * Delete all intern listeners to free memory.
     */
    dispose()
    {
        raf.removeOnframe(this._update)
        this._onScrollCb = []
        this._onSmoothScrollCb = []
        document.removeEventListener('scroll', this._onScroll, false)
    }

    /**
     * Reset y position without animation (smooth etc) and dispatch event.
     *
     * @param {Integer} y
     */
    reset(y)
    {
        this.realY = y
        this.smoothY = y
        this.delayedY = y

        this.realVelocity = 0
        this.smoothVelocity = 0
        this.delayedVelocity = 0

        this._initScrollCurveReconstruction(y)

        this.update(1 / 60, true)
    }

    /**
     * Inform of window resized. If you inform the page size too, the "block
     * scroll" top and bottom will be activated for iOS and MacOS.
     *
     * @param {Integer} height          Height of the window
     * @param {Boolean} autoScroll      Force a scrolling
     * @returns {Void}
     */
    resizeWindow(height = -1, autoScroll = true)
    {
        this.winH = height
        if (autoScroll)
        {
            this.update(1 / 60, true)
        }
    }

    /**
     * Inform of page resized. If you inform the window size too, the "block
     * scroll" top and bottom will be activated for iOS and MacOS.
     *
     * @param {Integer} height          Height of the page
     * @returns {Void}
     */
    resizePage(height = -1)
    {
        this.pageH = height
    }


    //  ---------
    //  LISTENERS
    //  ---------

    /**
     * Add a listener called at every frame if the page is scrolled.
     *
     * @param {Function} callback   Called if scrolled with y scroll argument
     * @returns {Boolean} Success
     */
    addOnScroll(callback)
    {
        this.removeOnScroll(callback)
        this._onScrollCb.push(callback)

        return true
    }

    /**
     * Remove the listener.
     *
     * @param {Function} callback   Same function precedently added
     * @returns {Boolean} Success
     */
    removeOnScroll(callback)
    {
        const i = this._onScrollCb.indexOf(callback)
        if (i > -1)
        {
            this._onScrollCb.splice(i, 1)
            return true
        }

        return false
    }

    /**
     * Add a listener called at every frame if the page is scrolled or if the
     * smooth scroll continu to move.
     *
     * @param {Function} callback   Called if scrolled with y scroll argument
     * @returns {Boolean} Success
     */
    addOnSmoothScroll(callback)
    {
        this.removeOnScroll(callback)
        this._onSmoothScrollCb.push(callback)

        return true
    }

    /**
     * Remove the listener.
     *
     * @param {Function} callback   Same function precedently added
     * @returns {Boolean} Success
     */
    removeOnSmoothScroll(callback)
    {
        const i = this._onSmoothScrollCb.indexOf(callback)
        if (i > -1)
        {
            this._onSmoothScrollCb.splice(i, 1)
            return true
        }

        return false
    }


    //  ----------
    //  INITIALIZE
    //  ----------

    /**
     * @private
     */
    _initScrollCurveReconstruction(val = 0)
    {
        const hist = []
        for (let i = 0; i < this.curveReconstructionFrames; i++)
        {
            hist[i] = val
        }

        this._history = hist
    }


    //  ------
    //  EVENTS
    //  ------

    /**
     * Call this at every frame to update the calculs. Inform delta time in
     * milliseconds for calculs. Force it if you would dispatch datas (in
     * example if new page added).
     *
     * @param {Number} dt       Delta time in millisecond since last frame
     * @param {type} force      Force dispatch
     */
    update(dt = 16.667, force = false)
    {
        let y = this.realY

        // Block scroll limits
        if (this.winH > -1 && this.pageH > -1)
        {
            y = Math.max(0, Math.min(y, this.pageH - this.winH))
        }

        const delayedY = this._getReconstructScroll(y)


        // Real scroll
        if (this._hasScrolled)
        {
            y = window.pageYOffset || document.documentElement.scrollTop

            this.realVelocity = (y - this.realY) / dt

            this.realY = y
            this._hasScrolled = false
        }
        else
        {
            this.realVelocity = 0

            if (force)
            {
                Scroll._dispatch(this._onScrollCb, this.realY)
            }
        }


        // Scroll delayed
        if (Math.round(delayedY) !== Math.round(this.delayedY))
        {
            this.delayedVelocity = (delayedY - this.delayedY) / dt
            this.delayedY = delayedY
            Scroll._dispatch(this._onScrollCb, delayedY)
        }
        else
        {
            this.delayedVelocity = 0
        }


        // Smooth
        let smoothY = this.smoothY
        if (Math.abs(smoothY - y) > 0.99)
        {
            // Update smooth scroll
            const deltaY = ((y - smoothY) * dt) / this.smoothScrollPower
            smoothY += deltaY

            this.smoothVelocity = (smoothY - this.smoothY) / dt

            this.smoothY = smoothY
            Scroll._dispatch(this._onSmoothScrollCb, smoothY)
        }
        else
        {
            this.smoothVelocity = 0

            if (force)
            {
                Scroll._dispatch(this._onSmoothScrollCb, this.realY)
            }
        }
    }

    _update(dt)
    {
        this.update(dt)
    }

    _onScroll()
    {
        this._hasScrolled = true
    }


    //  -------
    //  HELPERS
    //  -------

    /**
     * @privatesub
     */
    _getReconstructScroll(val)
    {
        const CRF = this.curveReconstructionFrames
        if (CRF < 2)
        {
            return val
        }

        const hist = this._history
        const min = hist.shift()

        hist.push(val)

        for (let i = 0; i < CRF - 1; i++)
        {
            hist[i] = ((val - min) / (CRF - 1)) + min
        }

        return hist[0]
    }


    /**
     * @private
     */
    static _dispatch(list, ...datas)
    {
        for (const cb of list)
        {
            cb(...datas)
        }
    }
}

export default Scroll
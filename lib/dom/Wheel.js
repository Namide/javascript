class Wheel
{
    constructor({
        pixelStep = 10,
        lineHeight = 40,
        pageHeight = 800,
        preventDefault = true,
        stopPropagation = true,
        onTop = () => {},
        onDown = () => {}
    })
    {
        this.pixelStep = pixelStep
        this.lineHeight = lineHeight
        this.pageHeight = pageHeight
        this.preventDefault = preventDefault
        this.stopPropagation = stopPropagation
        this.isEnable = true


        // Callback
        this.onTop = onTop
        this.onDown = onDown


        // Listener
        this._onWheel = this._onWheel.bind(this)
        document.addEventListener('wheel', this._onWheel, false)
    }
    
    enable()
    {
        this.isEnable = true
    }

    disable()
    {
        this.isEnable = false
    }

    dispose()
    {
        clearTimeout(this._wheelTo)
        document.removeEventListener('wheel', this._onWheel)
    }

    _onWheel(event)
    {
        if (!this.isEnable)
            return

        if (this.preventDefault)
            event.preventDefault()

        if (this.stopPropagation)
            event.stopPropagation()


        const normalizeWheel = this._normalizeWheel(event)

        clearTimeout(this._wheelTo)
        this._wheelTo = setTimeout(() =>
        {
            this._isWheeling = false
        }, 100)

        if (Math.abs(-normalizeWheel.pixelY) < 20 )
        {
            clearTimeout(this._wheelTo)
            this._isWheeling = false
        }

        if (this._isWheeling
            || Math.abs(-normalizeWheel.pixelY) < 20
            || Date.now() - this._lastWheelTime < 1000 )
        {
            return
        }

        this._lastWheelTime = Date.now()

        this._wheelEndTimer = setTimeout(() =>
        {
            clearTimeout(this._wheelTo)
            this._isWheeling = false
        }, 2000)

        this._isWheeling = true
        this._isScrollFromWheel = true

        if (this.onDown && normalizeWheel.pixelY > 0)
            this.onDown()
        else if (this.onTop && normalizeWheel.pixelY < 0)
            this.onTop()
    }

    _normalizeWheel(event)
    {
        let spinX = 0
        let spinY = 0

        let pixelX = 0
        let pixelY = 0

        // Legacy
        if ('detail'      in event) { spinY = event.detail }
        if ('wheelDelta'  in event) { spinY = -event.wheelDelta / 120 }
        if ('wheelDeltaY' in event) { spinY = -event.wheelDeltaY / 120 }
        if ('wheelDeltaX' in event) { spinX = -event.wheelDeltaX / 120 }

        // side scrolling on FF with DOMMouseScroll
        if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS )
        {
            spinX = spinY
            spinY = 0
        }

        pixelX = spinX * this.pixelStep
        pixelY = spinY * this.pixelStep

        if ('deltaY' in event) { pixelY = event.deltaY }
        if ('deltaX' in event) { pixelX = event.deltaX }

        if ((pixelX || pixelY) && event.deltaMode)
        {
            // delta in LINE units
            if (event.deltaMode == 1)
            {
                pixelX *= this.lineHeight
                pixelY *= this.lineHeight
            }
            // delta in PAGE units
            else
            {
                pixelX *= this.pageHeight
                pixelY *= this.pageHeight
            }
        }

        // Fall-back if spin cannot be determined
        if (pixelX && !spinX) { spinX = (pixelX < 1) ? -1 : 1 }
        if (pixelY && !spinY) { spinY = (pixelY < 1) ? -1 : 1 }

        return {
            spinX,
            spinY,
            pixelX,
            pixelY
        }
    }
}

export default Wheel
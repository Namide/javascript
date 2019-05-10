export default class Drag
{
    constructor({
            element,
            onDragCb = () => 1,
            onMoveCb = () => 1,
            onDropCb = () => 1,
            onSlideCb = () => 1,
            minDist = 10,
            inertia = 0.92
        })
    {
        this.el = element
        this.onDragCb = onDragCb
        this.onMoveCb = onMoveCb
        this.onDropCb = onDropCb
        this.onSlideCb = onSlideCb
        this.minDist = minDist
        this.inertia = inertia
        this.velocity = [0, 0]

        this._onDown = this._onDown.bind(this)
        this._onUp = this._onUp.bind(this)
        this._onMove = this._onMove.bind(this)
        this._onEnterFrame = this._onEnterFrame.bind(this)
        this._setInertia = this._setInertia.bind(this)

        this.el.addEventListener('mousedown', this._onDown)
        this.el.addEventListener('touchstart', this._onDown)
    }

    dispose()
    {
        this.el.removeEventListener('mousedown', this._onDown)
        this.el.removeEventListener('touchstart', this._onDown)
    }

    _onMove(event)
    {
        const { screenX: x, screenY: y } = event.touches && event.touches[0] ? event.touches[0] : event
        this.current = { x, y }
        this.hasMoved = true
    }

    _onEnterFrame()
    {
        cancelAnimationFrame(this.raf)
        if (this.hasMoved)
        {
            const dx = this.current.x - this.last.x
            const dy = this.current.y - this.last.y

            this.velocity = [dx, dy]
            this.dist += Math.sqrt(dx * dx + dy * dy)
            this.last = this.current
            this.hasMoved = false

            if (this.dist >= this.minDist && !this.isDragin)
            {
                this.isDragin = true
                this.onDragCb()
            }

            this.onMoveCb(dx, dy)
        }
        this.raf = requestAnimationFrame(this._onEnterFrame)
    }

    _onDown(event)
    {
        const { screenX: x, screenY: y } = event.touches && event.touches[0] ? event.touches[0] : event

        this.init = { x, y }
        this.last = { x, y }
        this.current = { x, y }
        this.dist = 0
        this.isDragin = false

        document.body.addEventListener('mouseup', this._onUp)
        document.body.addEventListener('touchend', this._onUp)
        document.body.addEventListener('mouseleave', this._onUp)
        document.body.addEventListener('touchmove', this._onMove)
        document.body.addEventListener('mousemove', this._onMove)

        cancelAnimationFrame(this.raf)
        this.raf = requestAnimationFrame(this._onEnterFrame)
        
        event.preventDefault()
        this._drop()
    }

    _onUp()
    {
        cancelAnimationFrame(this.raf)
        document.body.removeEventListener('mouseup', this._onUp)
        document.body.removeEventListener('touchend', this._onUp)
        document.body.removeEventListener('mouseleave', this._onUp)
        document.body.removeEventListener('touchmove', this._onMove)
        document.body.removeEventListener('mousemove', this._onMove)

        if (this.inertia > 0)
        {
            this.onSlideCb()
            this._setInertia()
        }
        else
        {
            this._drop()
        }
    }

    _setInertia()
    {
        this.velocity = this.velocity.map(v => v *= this.inertia)
        this.onMoveCb(...this.velocity)

        cancelAnimationFrame(this.raf)
        if (Math.abs(this.velocity[0]) < 1 && Math.abs(this.velocity[1]) < 1)
        {
            this._drop()
        }
        else
        {
            this.raf = requestAnimationFrame(this._setInertia)
        }
    }

    _drop()
    {
        if (this.isDragin)
        {
            this.onDropCb()
            this.isDragin = false
        }
    }
} 
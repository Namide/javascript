export default class Orientation
{
    constructor({
        clamp = [90, 90, 90],
        onOrientationChange = () => {},
    })
    {
        this.clamp = clamp
        this.onOrientationChange = onOrientationChange
        this._onOrientationChange = this._onOrientationChange.bind(this)
        this.data = [0, 0, 0]
        this.isEnable = true

        window.addEventListener('deviceorientation', this._onOrientationChange, false)
    }

    enable()
    {
        this.isEnable = true
    }

    disable()
    {
        this.isEnable = false
    }

    reset()
    {
        this.relative = undefined
    }

    dispose()
    {
        window.removeEventListener('deviceorientation', this._onOrientationChange)
    }

    _onOrientationChange(event)
    {
        if (!this.isEnable)
            return

        const absOrientation = [
            0, // beta
            0, // gama
            0  // alpha
        ]

        const winOrientation = window.orientation
        if (this.winOrientation !== winOrientation)
        {
            this.winOrientation = winOrientation
            this.reset()
        }

        switch (winOrientation)
        {
            case 90:
                absOrientation[0] = Math.round(event.gamma)
                absOrientation[1] = Math.round(-event.alpha)
                absOrientation[2] = Math.round(event.beta)

                break

            case -90:
                absOrientation[0] = Math.round(-event.gamma)
                absOrientation[1] = Math.round(-event.alpha)
                absOrientation[2] = Math.round(-event.beta)
                break

            default:
            case 0:
                absOrientation[0] = Math.round(-event.beta)
                absOrientation[1] = Math.round(-event.gamma)
                absOrientation[2] = Math.round(-event.alpha)
                break
        }

        if (!this.relative)
        {
            this._initOrientation = absOrientation
        }

        const relOrientation = absOrientation.map((abs, i) => abs - this._initOrientation[i])

        this.absolute = absOrientation
        this.relative = relOrientation
        this.data = relOrientation.map((rel, i) => Math.max(-0.5, Math.min(0.5, rel / this.clamp[i])))

        if (this.onOrientationChange)
        {
            this.onOrientationChange(this.data)
        }
    }
}
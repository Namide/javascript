export default class Keyboard
{
    constructor()
    {
        this._onKeyDown = this._onKeyDown.bind(this)
        window.addEventListener('keydown', this._onKeyDown, false)

        this._downListener = { }
        this.isEnable = true
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
        window.removeEventListener('keydown', this._onKeyDown)
    }
    
    addOnDown(keyCode, callback)
    {
        this._downListener[keyCode] = callback
    }
    
    removeOnDown(keyCode)
    {
        this._downListener[keyCode] = undefined
    }

    _onKeyDown(event)
    {
        if (this.isEnable)
        {
            const keyCode = event.keyCode
    
            if (this._downListener[keyCode])
                this._downListener[keyCode]()
        }
    }
}
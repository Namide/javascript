export default class Keyboard
{
    constructor({ preventByTarget = ['INPUT', 'TEXTAREA'] } = {})
    {
        this._onDown = this._onDown.bind(this)
        this._onUp = this._onUp.bind(this)
        this._downList = {  }
        this._upList = {  }
        this._preventByTarget = preventByTarget
        window.document.addEventListener('keydown', this._onDown, false)
        window.document.addEventListener('keyup', this._onUp, false)
    }

    dispose()
    {
        window.document.removeEventListener('keydown', this._onDown, false)
        window.document.removeEventListener('keyup', this._onUp, false)
        delete this._downList
        delete this._upList
    }

    _onDown({ code, target })
    {
        if (this._downList[code] && this._preventByTarget.indexOf(target.tagName) < 0)
            this._downList[code].forEach(callback => callback())
    }

    _onUp({ code, target })
    {
        if (this._upList[code] && this._preventByTarget.indexOf(target.tagName) < 0)
            this._upList[code].forEach(callback => callback())
    }

    onDown(code, callback)
    {
        if (!this._downList[code])
            this._downList[code] = []

        this._downList[code].push(callback)
    }

    onUp(code, callback)
    {
        if (!this._upList[code])
            this._upList[code] = []

        this._upList[code].push(callback)
    }

    offDown(code, callback)
    {
        let i = -1
        while (!!this._downList[code] && (i = this._downList[code].indexOf(callback)) > -1)
            this._downList[code].splice(i, 1)
    }

    offUp(code, callback)
    {
        let i = -1
        while (!!this._upList[code] && (i = this._upList[code].indexOf(callback)) > -1)
            this._upList[code].splice(i, 1)
    }
}

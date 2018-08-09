class Sound 
{
    constructor( src, onReady = null )
    {
        this.audio = new Audio(src)
        this.audio.loop = true
        this.audio.autoload = false

        this.audio.volume = 0

        this.onReady = onReady || (event => { /* console.log('Sound is ready') */ })
        this.audio.addEventListener('canplaythrough', this.onReady, false)
        this.transitionDisable = false
    }

    play( fadeTime = 0 )
    {
        if (this.transitionDisable)
        {
            this.audio.play()
            this.audio.volume = 1
        }
        else
        {
            this.audio.play()
            this._fadeTime = fadeTime

            this._time = Date.now() - 1
            this._upSound(1/60)
        }
    }

    pause( fadeTime = 0 )
    {
        if (this.transitionDisable)
        {
            this.audio.pause()
        }
        else
        {
            this._fadeTime = fadeTime
            this._time = Date.now() - 1
            this._downSound(1/60)
        }
    }

    dispose()
    {
        cancelAnimationFrame( this._volumeRAF )
        this.audio.removeEventListener('canplaythrough', this.onReady)
    }

    _upSound()
    {
        cancelAnimationFrame( this._volumeRAF )

        const dt = Date.now() - this._time
        this._time += dt

        let volume = this.audio.volume

        if ( volume < 1 )
        {
            volume += dt / this._fadeTime
            this._volumeRAF = requestAnimationFrame(this._upSound.bind(this))
        }

        this.audio.volume = Math.min(Math.max(volume, 0), 1)
    }

    _downSound()
    {
        cancelAnimationFrame( this._volumeRAF )

        const dt = Date.now() - this._time
        this._time += dt

        let volume = this.audio.volume

        if ( volume > 0 )
        {
            volume -= dt / this._fadeTime
            this._volumeRAF = requestAnimationFrame(this._downSound.bind(this))
        }

        if (volume <= 0)
        {
            volume = 0
            this.audio.pause()
        }

        this.audio.volume = Math.min(Math.max(volume, 0), 1)
    }

    onError( event )
    {
        console.error( 'Sound error:', event )
    }
}

export default Sound
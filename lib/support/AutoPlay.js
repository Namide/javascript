const setAutoplay = isSupported =>
{
    console.log('Video autoplay', (!isSupported ? 'not ' : '') + 'supported')

    AutoPlay.supported = isSupported
    try {
        AutoPlay.callbacks.forEach(callback => callback(isSupported))
    } catch(e) {

    }
}

const deleteVideo = video =>
{
    video.pause()
    video.src = ''
    video.remove()
}

class AutoPlay
{
    static isSupported(callback, videoSrc)
    {
        if (typeof(AutoPlay.supported) === typeof(true))
            return callback(AutoPlay.supported)

        if (!AutoPlay.callbacks)
        {
            AutoPlay.callbacks = [callback]
            const video = document.createElement('video')
            video.autoplay = true
            video.loop = true
            video.muted = true
            video.playsinline = true
            video.src = videoSrc

            document.body.appendChild(video)

            const playPromise = video.play()
            if (playPromise !== undefined)
            {
                playPromise
                    .then(() =>
                    {
                        setAutoplay(true)
                        deleteVideo(video)
                    })
                    .catch(() =>
                    {
                        setAutoplay(false)
                        deleteVideo(video)
                    })
            }
            else
            {
                setAutoplay(false)
                deleteVideo(video)
            }
        }
        else
        {
            AutoPlay.callbacks.push(callback)
        }
    }
}

AutoPlay.supported = null

export default AutoPlay
let raf

/**
 * In-out quint equation
 * 
 * @param {Number} t    Current time
 * @param {Number} b    Start value
 * @param {Number} c    Delta value (end value - start value)
 * @param {Number} d    Duration
 */
const easeInOutQuint = (t, b, c, d) =>
{
    t /= d * 0.5
    if (t < 1) {
        return c * 0.5 * t * t * t * t * t + b
    }

    t -= 2
    return c * 0.5 * (t * t * t * t * t + 2) + b
}

/**
 * Cancel scroll animation
 */
const cancelEaseScrollTo = () =>
{
    cancelAnimationFrame(raf)
}

/**
 * Scroll to with IE11 compatibility
 * 
 * @param {Number} y 
 */
const scrollTo = (y = 0) =>
{
    if (window.scrollTo) {
        window.scrollTo(0, y)
    } else {
        // IE11 fix
        window.scrollTop = 0
    }
}

/**
 * Run a scroll animation
 * 
 * @example
 * // linear easing to one height screen
 * easeScrollTo(window.innerHeight, 1.1, (time, initialPos, distance, duration) =>
 * {
 *      return distance * time / duration + initialPos
 * })
 * 
 * @param {Number} yTo                          Final scroll value
 * @param {Object} [options]                    Configuration
 * @param {Number} [options.timeDistord]        < 1 = faster ; > 1 slower
 * @param {Function} [options.equation]         Custom ease
 * @param {Number} [options.minTime]            Minimum time for short distance in milliseconds
 * 
 * @returns {Function}                          Canceler function 
 */
const easeScrollTo = (
    yTo = 0,
    {
        timeDistord = 1,
        equation = easeInOutQuint,
        minTime = 750
    } = {}) =>
{
    cancelEaseScrollTo()

    const yFrom = window.pageYOffset || document.documentElement.scrollTop
    const timeFrom = window.performance.now()
    const timeTo = timeFrom + Math.max(Math.pow(Math.abs(yTo - yFrom), 0.5) * 25, minTime) * timeDistord

    const tick = timeStamp =>
    {
        const y = equation(timeStamp - timeFrom, yFrom, yTo - yFrom, timeTo - timeFrom)

        scrollTo(y)

        if (timeStamp < timeTo) {
            raf = requestAnimationFrame(tick)
        }
    }

    raf = requestAnimationFrame(tick)
    return cancelEaseScrollTo
}


export default easeScrollTo
export { cancelEaseScrollTo, scrollTo }
// NPM dependency
import BezierEasing from 'bezier-easing'

/**
 * Test if this value is boolean type
 * 
 * @param {*} val       Value to test
 */
const isBoolean = val => typeof(val) === typeof(true)

class Equation
{
    /**
     * @param {Number} time1    
     * @param {Number} time2 
     * @param {Number} val1 
     * @param {Number} val2 
     * @param {Number} mx1      Anchor 1 of point 1 
     * @param {Number} my1      Anchor 2 of point 1
     * @param {Number} mx2      Anchor 1 of point 2
     * @param {Number} my2      Anchor 2 of point 2
     */
    constructor(time1, time2, val1, val2, mx1, my1, mx2, my2)
    {
        this.time1 = time1
        this.time2 = time2
        this.val1 = val1
        this.val2 = val2

        // http://cubic-bezier.com/
        this.bezier = BezierEasing(mx1, my1, mx2, my2)
    }

    /**
     * Delta time between time of equation and argument time
     * 
     * @param {Number} time 
     */
    distance(time)
    {
        if (time < this.time1) {
            return this.time1 - time
        } else if (time > this.time2) {
            return time - this.time2
        }

        return 0
    }

    /**
     * Result of equation for this time
     * 
     * @param {Number} time 
     */
    getValue(time)
    {
        if (time < this.time1) {
            return this.val1
        } else if (time > this.time2) {
            return this.val2
        }

        const realTime = (time - this.time1) / (this.time2 - this.time1)

        return this.bezier(realTime) * (this.val2 - this.val1) + this.val1
    }
}

class EquationArray extends Equation
{
    getValue(time)
    {
        if (time < this.time1) {
            return this.val1
        } else if (time > this.time2) {
            return this.val2
        }

        const t = (time - this.time1) / (this.time2 - this.time1)
        const v = this.bezier(t)

        const val = []
        for (let i = 0; i < this.val1.length; i++) {
            val[i] = v * (this.val2[i] - this.val1[i]) + this.val1[i]
        }

        return val
    }
}

class EquationBoolean
{
    constructor(time, val)
    {
        this.time1 = this.time2 = time
        this.val = val
    }

    distance(time)
    {
        if (time < this.time1) {
            return this.time1 - time
        } else if (time > this.time1) {
            return time - this.time1
        }

        return 0
    }

    getValue()
    {
        return this.val
    }
}

class Timeline
{
    constructor(times = [], values = [], beziers = null)
    {
        this.equations = []

        const empty = []
        const length = (values.length === 0 || isBoolean(values[0])) ? values.length : (values.length - 1)
        for (let i = 0; i < length; i++) {
            this.add(times[i], times[i + 1], values[i], values[i + 1], ...(beziers ? beziers[i] : empty))
        }
    }

    add(timeStart, timeEnd, valStart, valEnd, mx1 = 0.5, my1 = 0, mx2 = 0.5, my2 = 1)
    {
        // Clean times order
        if (timeStart > timeEnd) {
            let tmp = timeStart
            timeStart = timeEnd
            timeEnd = tmp

            tmp = valStart
            valStart = valEnd
            valEnd = tmp
        }

        if (Array.isArray(valStart)) {
            const equation = new EquationArray(
                timeStart, timeEnd,
                valStart, valEnd,
                mx1, my1, mx2, my2
            )

            this.equations.push(equation)
        } else if (isBoolean(valStart)) {
            const equation = new EquationBoolean(timeStart, valStart)
            this.equations.push(equation)
        } else {
            const equation = new Equation(
                timeStart, timeEnd,
                valStart, valEnd,
                mx1, my1, mx2, my2
            )

            this.equations.push(equation)
        }
    }

    getValue(time)
    {
        const close = this.equations.reduce((a, b) =>
        {
            if (b.time1 > time && a.time1 < time) {
                return a
            } else if (a.time1 > time && b.time1 < time) {
                return b
            }

            return a.distance(time) < b.distance(time) ? a : b
        })

        return close.getValue(time)
    }
}

class DynTimeline
{
    constructor(initVal, durationTime, mx1 = 0.5, my1 = 0, mx2 = 0.5, my2 = 1)
    {
        this._isArray = Array.isArray(initVal)

        this.valStart = this._isArray ? [...initVal] : initVal
        this.valEnd = this._isArray ? [...initVal] : initVal
        this.bezier = [mx1, my1, mx2, my2]
        this.duration = durationTime
        this.equations = []
    }

    change(val, fromTime, duration = this.duration, mx1 = this.bezier[0], my1 = this.bezier[1], mx2 = this.bezier[2], my2 = this.bezier[3])
    {
        const toTime = fromTime + duration
        const lastEnd = this.getValue(toTime, false)
        const valEnd = this._isArray ? [...lastEnd].map((v, i) => val[i] - v) : (val - lastEnd)
        const valStart = this._isArray ? [...this.valEnd].map(() => 0) : 0

        const EquationClass = this._isArray ? EquationArray : Equation
        const equation = new (EquationClass)(
            fromTime, toTime,
            valStart, valEnd,
            mx1, my1, mx2, my2
        )

        this.equations.push(equation)
    }

    /**
     * Get calculated value for the instant "time" 
     * 
     * @param {Number} time                 Instant for the value
     * @param {Boolean} clean               Delete all previons equations (better performance but you can not return to previous values)
     * @returns {(Number|Array.<Number>)}   Value
     */
    getValue(time, clean = true)
    {
        let val = this._isArray ? [...this.valStart] : this.valStart
        for (let i = this.equations.length - 1; i > -1; i--) {
            const equation = this.equations[i]
            const eqValue = equation.getValue(time)
            const delEquation = clean && time >= equation.time2

            if (this._isArray) {
                for (let i = 0; i < val.length; i++) {
                    val[i] += eqValue[i]
                    if (delEquation) {
                        this.valStart[i] += eqValue[i]
                    }
                }
            } else {
                val += eqValue
                if (delEquation) {
                    this.valStart += eqValue
                }
            }

            if (delEquation) {
                this.equations.splice(i, 1)
            }
        }

        return val
    }
}

export { Timeline, DynTimeline }
// https://gist.github.com/blixt/f17b47c62508be59987b
export default class PseudoRNG
{
    /**
     * Creates a pseudo-random value generator. The seed must be an integer.
     *
     * Uses an optimized version of the Park-Miller PRNG.
     * http://www.firstpr.com.au/dsp/rand31/
     */
    constructor(seed = 0)
    {
        this._seed = seed % 2147483647
        if (this._seed <= 0) this._seed += 2147483646
    }

    /**
     * Returns a pseudo-random value between 1 and 2^32 - 2.
     */
    next()
    {
        return this._seed = this._seed * 16807 % 2147483647
    }

    /**
     * Returns a pseudo-random floating point number in range [0, 1).
     */
    nextFloat()
    {
        return (this.next() - 1) / 2147483646
    }
}
function clamp(num) { return Math.min(255, Math.max(0, Math.round(num))) }

export default class Color
{
    constructor(hexStr)
    {
        let h = hexStr.substring(1)
        if (h.length === 3)
        {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
        }
        
        this.setHex(Number('0x' + h))
    }

    getRgb()
    {
        return {
            r: this.hex >> 16,
            g: this.hex >> 8 & 0xFF,
            b: this.hex & 0xFF
        }
    }

    setRgb({r, g, b})
    {
        this.hex = clamp(r) << 16 | clamp(g) << 8 | clamp(b)
    }

    setHex(hex)
    {
        this.hex = hex
    }

    getHexStr()
    {
        return '#' + this.hex.toString(16).toUpperCase()
    }

    multLuminosity(power = 1.2)
    {
        const rgb = this.getRgb()
        rgb.r *= power
        rgb.g *= power
        rgb.b *= power

        this.setRgb(rgb)
    }

    addLuminosity(power = 1.2)
    {
        const rgb = this.getRgb()
        rgb.r += power
        rgb.g += power
        rgb.b += power

        this.setRgb(rgb)
    }
    
    static test(hexStr)
    {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hexStr)
    }
}
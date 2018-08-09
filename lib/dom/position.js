
// http://www.quirksmode.org/js/findpos.html
function getPosition(obj)
{
    let curleft = 0
    let curtop = 0

    if (obj.offsetParent)
    {
        /* eslint-disable no-cond-assign, no-param-reassign */
        do
        {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
        while (obj = obj.offsetParent)
    }

    return [curleft, curtop]
}

function getBounds(elmt, anchor = document.body)
{
    const doc = document
    const win = window
    const body = doc.body

    // pageXOffset and pageYOffset work everywhere except IE <9.
    let offsetX = win.pageXOffset !== undefined ? win.pageXOffset :
            (doc.documentElement || body.parentNode || body).scrollLeft
    let offsetY = win.pageYOffset !== undefined ? win.pageYOffset :
            (doc.documentElement || body.parentNode || body).scrollTop

    const rect = elmt.getBoundingClientRect()

    if (elmt !== anchor)
    {
        let parent = elmt.parentNode

        // The element's rect will be affected by the scroll positions of
        // all of its scrollable parents, not just the window, so we have
        // to walk up the tree and collect every scroll offset. Good times.
        while (parent !== anchor)
        {
            offsetX += parent.scrollLeft
            offsetY += parent.scrollTop
            parent = parent.parentNode
        }
    }

    // iOS hack
    return {
        left: rect.left + offsetX,
        top: rect.top + offsetY,
        width: rect.width,
        height: rect.height,
        right: rect.right + offsetX,
        bottom: rect.bottom + offsetY
    }
}

export { getBounds, getPosition }
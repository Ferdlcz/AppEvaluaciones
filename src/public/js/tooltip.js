let stillOver,
	msg, t_id, tooltip,
	x, y, w, h, tgt,
	currToolNode

const mainToolTip = () => {
	tooltip = $e('#tooltip')

	eventAssigner('.tooltip-text', 'mousemove', mouseIn)
	eventAssigner('.tooltip-text', 'mouseover', mouseOver)
	eventAssigner('.tooltip-text', 'mouseout', mouseOut)
}

const mouseIn = async(e) => {
	test = e.target
	x = e.pageX
	y = e.pageY
	w = tooltip.scrollWidth
	h = tooltip.scrollHeight

	tooltip.style.left = x - (w + 5) + 'px'
	tooltip.style.top = y - (h + 10) + 'px'
}

const mouseOver = async(e) => {
	let langText = (lang == 0) ? 'data-tooltip-es' : 'data-tooltip-en'
	tgt = e.target

	if(tgt != currToolNode) {
		tooltip.querySelector('p').innerHTML = await upperAttrIterator(tgt, langText).catch(e => console.error(e))
		currToolNode = tgt
	}
	stillOver = true

	setTimeout(() => {
		if(stillOver) tooltip.classList.add('show')
	}, 800)
}

const mouseOut = async(e) => {
	tooltip.classList.remove('show')
	stillOver = false
}

window.addEventListener('DOMContentLoaded', mainToolTip)
async function setCookie(cname, cvalue) {
	if(cname == undefined || cvalue == undefined) {
		console.error('Cookies save empty')
		throw false
	}

	DATE.setTime(DATE.getTime() + 7*24*60*60*1000)
	
	let expires = 'expires=' + DATE.toGMTString()
	try {
		document.cookie = cname+'='+cvalue+';expires='+expires+';path=/'
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

async function getCookie(cname) {
	if(cname === 0) {
		let cookieSession, cookieGoTo

		await getCookie('user')
		.then((data) => { cookieSession = data })
		.catch((error) => { cookieSession = undefined })

		await getCookie('requested-page')
		.then((data) => { cookieGoTo = data })
		.catch((error) => { cookieGoTo = undefined })

		return [cookieSession, cookieGoTo]
	}

	let name = cname + '='
	let cookieJar = document.cookie.split(';')
	for(let i = 0; i < cookieJar.length; i++) {
		let cookie = cookieJar[i]
		while(cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1)
		}
		if(cookie.indexOf(name) == 0) {
			return cookie.substring(name.length, cookie.length)
		}
	}
	throw false
}

async function checkCookie(cname) {
	if(cname == undefined) return showSnack(`Cookie ${cname} empty`, 'Cookie-Monster', 'error')
	let result
	
	await getCookie(cname)
		.then(async (data) => {
			if(data.length > 0) result = true
			else result = false
		})
		.catch((error) => {
			result = false
			console.error(error)
		})

	if(result) return true
	else throw false
}

async function eatCookies() {
	try {
		document.cookie.split(";").forEach((c) => {
			document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
		})
		console.log('cleared: '+ document.cookie)
		sessionStorage.clear()
		localStorage.clear()
		return true
	} catch(error) {
		console.error(error)
		throw false
	}
}
// class Quantity ===========================================================================
class Quantity {
	#amount
	constructor(amount, maxValue, minValue = 1) {
		if (amount < minValue)
			throw new RangeError("Кількість не може бути меншою за мінімальну!")
		else if (amount > maxValue)
			throw new RangeError("Кількість не може бути більшою за максимальну")
		this.maxAmount = maxValue
		this.minAmount = minValue
		this.#amount = amount
		this.regExp = /\D/g
	}

	// set, get ===========================================================================
	set Amount(newAmount) {
		this.#amount = newAmount
		this.updateInterface()
	}

	get Amount() {
		return this.#amount
	}


	toggleDisabledButton(button, borderValue) {
		if (borderValue === this.Amount)
			button.setAttribute('disabled', '')
		else
			button.removeAttribute('disabled')
	}

	updateInterface() {
		this.updateInput()
		this.toggleDisabledButton(this.increaseButton, this.maxAmount)
		this.toggleDisabledButton(this.decreaseButton, this.minAmount)
	}


	// functions ===========================================================================

	updateInput() {
		this.input.value = this.Amount
	}

	// listeners =================================================================
	inputAmount(e) {
		let value = e.target.value
		if (this.regExp.test(value)) {
			e.target.value = value.replace(this.regExp, '')
			return
		}
		value = parseInt(value)
		if (value >= this.minAmount && value <= this.maxAmount) {
			this.Amount = value
			this.sendEvent(e.target)
		}
	}

	focusOut(e) {
		const value = parseInt(e.target.value)
		if (value > this.maxAmount) {
			this.Amount = this.maxAmount
			this.sendEvent(e.target)
		} else if (value < this.minAmount) {
			this.Amount = this.minAmount
			this.sendEvent(e.target)
		} else if (isNaN(value)) {
			this.updateInput()
			this.sendEvent(e.target)
		}
	}

	changeAmount(button, value) {
		if (
			value === 1 && this.Amount === this.maxValue ||
			value === -1 && this.Amount === this.minAmount
		) return

		this.Amount += value
		this.sendEvent(button)
	}

	// custom event ========================================================
	sendEvent(trigger) {
		const event = new CustomEvent('update-amount', {
			detail: { newAmount: this.Amount },
			bubbles: true
		})
		trigger.dispatchEvent(event)
	}


	// create elements =========================================================
	createInput() {
		const input = document.createElement('input')
		input.type = 'text'
		input.className = 'quantity__value'
		input.addEventListener('input', this.inputAmount.bind(this))
		input.addEventListener('focusout', this.focusOut.bind(this))
		return input
	}

	createButton(modify = '+') {
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'quantity__button'
		if (modify === '+') {
			button.classList.add('quantity__button--increase', '_icon-plus')
			button.addEventListener('click', e => this.changeAmount(e.target, 1))
		} else {
			button.classList.add('quantity__button--reduce', '_icon-minus')
			button.addEventListener('click', e => this.changeAmount(e.target, -1))
		}
		return button
	}

	render(bemClass, selectorContainer) {
		const wrapper = document.createElement('div')
		wrapper.className = bemClass ? `${bemClass}__quantity quantity` : 'quantity'

		this.input = this.createInput()
		wrapper.append(this.input)

		this.decreaseButton = this.createButton('-')
		wrapper.prepend(this.decreaseButton)
		this.increaseButton = this.createButton()
		wrapper.append(this.increaseButton)

		this.updateInterface()

		if (selectorContainer) {
			const container = document.querySelector(selectorContainer)
			if (!container)
				throw new Error(`Не знайдено елемент з таким селектором - ${selectorContainer}!`)
			container.append(wrapper)
		}

		return wrapper
	}
}

// class ProductCart ===========================================================================
class ProductCart {
	// props: id, size, title, link, src, in stock (в наличии), currentPrice, oldPrice, amount, maxAmount
	constructor(props) {
		this.props = { ...props }
	}

	createImg() {
		const img = document.createElement('img')
		img.classList = 'product-cart-header__img --loading'
		img.src = this.props.src
		img.alt = this.props.title
		img.onload = () => img.classList.remove('--loading')
		return img
	}

	createBodyContent() {
		const wrapper = document.createElement('div')
		wrapper.className = 'product-cart-header__body'
		wrapper.insertAdjacentHTML('beforeend', `
			<div class="product-cart-header__size">Розмір: ${this.props.size}</div>
				<h3 class="product-cart-header__title">
					<a href="${this.props.link}">${this.props.title}</a>
				</h3>
			<div class="product-cart-header__stock stock _icon-in-stock">${this.props.stock}</div>
		`)
		return wrapper
	}

	createRemoveButton() {
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'product-cart-header__remove _icon-crosshair'
		button.ariaLabel = 'Видалити товар з корзини'
		button.addEventListener('click', this.removeProduct.bind(this))
		return button
	}

	sendNewAmount(event) {
		const newAmount = event.detail.newAmount
		this.sendEvent({ newAmount })
	}

	removeProduct() {
		this.sendEvent({}, 'remove')
	}

	sendEvent(property, type = 'update') {
		const event = new CustomEvent('change-state', {
			detail: {
				...property,
				id: this.props.id,
				type
			},
			bubbles: true
		})
		this.wrapper.dispatchEvent(event)
	}

	createPrices() {
		const wrapper = document.createElement('div')
		wrapper.className = 'product-cart-header__prices'
		const formatter = new Intl.NumberFormat("ru-RU", { maximumSignificantDigits: 3 })

		wrapper.insertAdjacentHTML('beforeend', `
			<div class="product-cart-header__current-price">${formatter.format(this.props.currentPrice)} грн.</div>
		`)
		if (this.props.price > 0) {
			wrapper.insertAdjacentHTML('beforeend', `
			<div class="product-cart-header__old-price">${formatter.format(this.props.oldPrice)} грн.</div>
		`)
		}
		return wrapper
	}

	render(bemClass, selectorContainer) {
		const wrapper = document.createElement('article')
		wrapper.addEventListener('update-amount', this.sendNewAmount.bind(this))
		wrapper.className = bemClass ?
			`${bemClass}__product product-cart-header` :
			'product-cart-header'
		this.wrapper = wrapper

		wrapper.append(this.createImg())
		wrapper.append(this.createBodyContent())
		wrapper.append(this.createRemoveButton())
		wrapper.append(new Quantity(this.props.amount, this.props.maxAmount).render('product-cart-header'))
		wrapper.append(this.createPrices())

		if (selectorContainer) {
			const container = document.querySelector(selectorContainer)
			if (!container)
				throw new Error(`Не знайдено елемент за селектором - ${selectorContainer}!`)
			container.append(wrapper)
		}

		return wrapper
	}
}

// class CartHeader ===========================================================================
class CartHeader {
	#productList
	constructor(data) {
		this.ProductList = data
	}

	get AmountProducts() {
		return this.ProductList.length
	}

	get ProductList() {
		return this.#productList
	}
	set ProductList(newList) {
		if (!Array.isArray(newList))
			throw new Error("Очікується масив з даними про товари!")
		this.#productList = [...newList]
		if (this.listElement)
			this.fillListElement()
	}

	createNotificationEmptyCart() {
		this.listElement.append(this.createInfoElement())
		this.orderButton.classList.add('--hide')
	}


	fillListElement() {
		if (this.ProductList.length) {
			this.listElement.innerHTML = ''
			this.orderButton.classList.remove('--hide')
			this.ProductList.forEach(product => {
				const element = new ProductCart(product).render('cart-header')
				this.listElement.append(element)
			})
		} else this.createNotificationEmptyCart()

	}

	createInfoElement(message = 'Корзина пуста') {
		const element = document.createElement('div')
		element.className = 'cart-header__message'
		element.textContent = message
		return element
	}

	updateProductList(newList) {
		this.ProductList = newList
	}


	createButtons(isButtonOrder = true) {
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'cart-header__button'
		const textButton = isButtonOrder ? 'оформити замовлення' : 'Продовжити покупки'
		const dataAttribute = isButtonOrder ? 'data-cart-order' : 'data-cart-continue'
		button.textContent = textButton
		button.setAttribute(dataAttribute, '')
		if (!isButtonOrder)
			button.classList.add('cart-header__button--border')
		return button
	}

	actionFooterCart(e) {
		const target = e.target
		if (target.closest('[data-cart-order]')) {

		} else if (target.closest('[data-cart-continue]')) {
			document.documentElement.classList.remove("cart-open")
		}
	}

	createHeader(isHeaderCart) {
		const wrapper = document.createElement('div')
		wrapper.className = 'cart-header__header'

		const title = document.createElement('h4')
		title.className = 'cart-header__title'
		title.innerHTML = `Ваш кошик <span>${this.AmountProducts}</span>`
		wrapper.append(title)

		if (isHeaderCart) {
			const button = document.createElement('button')
			button.type = 'button'
			button.className = 'cart-header__close _icon-crosshair'
			button.setAttribute('aria-label', 'Закрити корзину')
			wrapper.append(button)
		}

		return wrapper
	}
	updateAmount(id, newAmount) {
		const product = this.ProductList.find(item => item.id === id)
		product.amount = newAmount
		this.updateLocalStorage()
	}

	removeProductItem(id) {
		this.#productList = this.ProductList.filter(item => item.id !== id)
		this.updateLocalStorage()
		if (!this.ProductList.length)
			this.createNotificationEmptyCart()
	}

	updateLocalStorage() {
		localStorage.setItem('product-cart', JSON.stringify(this.ProductList))
	}

	updateState(event) {
		const { type, id, newAmount } = event.detail
		if (type === 'update')
			this.updateAmount(id, newAmount)
		else this.removeProductItem(id)
	}

	render(bemClass, isHeaderCart = true, selectorContainer) {
		const wrapper = document.createElement('div')
		wrapper.className = bemClass ? `${bemClass}__cart cart-header` : 'cart-header'
		wrapper.addEventListener('change-state', this.updateState.bind(this))

		if (selectorContainer) {
			const container = document.querySelector(selectorContainer)
			if (!container)
				throw new Error(`Не знайдено елемент за цим селектором - ${selectorContainer}`)
			container.append(wrapper)
		}

		wrapper.append(this.createHeader(isHeaderCart))

		const footer = document.createElement('div')
		footer.addEventListener('click', this.actionFooterCart.bind(this))
		footer.className = 'cart-header__footer'
		this.orderButton = this.createButtons()
		footer.append(this.orderButton)
		if (isHeaderCart) {
			const continueButton = this.createButtons(false)
			footer.append(continueButton)
		}

		this.listElement = document.createElement('div')
		this.listElement.className = 'cart-header__items'
		this.fillListElement()
		wrapper.append(this.listElement)
		wrapper.append(footer)

		return wrapper
	}
}

// class CartOrder {

// }


window.addEventListener('load', () => {
	const quantities = document.querySelectorAll('[data-quantity-button]')
	if (!quantities.length) return
	quantities.forEach(item => {
		const quantity = new Quantity(2, 5).render(item.getAttribute('data-quantity-button'))
		item.after(quantity)
		item.remove()
	})


	let data = JSON.parse(localStorage.getItem('product-cart'))
	if (!data || !data.length) { // TODO: Удалить потом !data.length тестовая версия кода  
		data = dataForCart()
		localStorage.setItem('product-cart', JSON.stringify(data))
	}

	try {
		new CartHeader(data).render('middle-header', true, '.middle-header__actions')
	} catch (error) {
		console.error(error.message)
	}
})


function dataForCart() {
	return [
		{
			id: 0,
			size: '61 x 184 x 2130 мм',
			title: 'Ліжко Спарта / Sparta з підйомним механізмом',
			link: '#',
			src: 'img/products/01.webp',
			stock: 'В наявності',
			currentPrice: 15400,
			oldPrice: 25400,
			amount: 1,
			maxAmount: 5
		},
		{
			id: 1,
			size: '32 x 175 x 5000 мм',
			title: 'Ліжко Аргон з підйомним механізмом',
			link: '#',
			src: 'img/products/02.webp',
			stock: 'В наявності',
			currentPrice: 16400,
			oldPrice: 0,
			amount: 3,
			maxAmount: 10
		}, {
			id: 2,
			size: '61 x 184 x 2130 мм',
			title: 'Ліжко Престиж з підйомним механізмом',
			link: '#',
			src: 'img/products/03.webp',
			stock: 'В наявності',
			currentPrice: 14969,
			oldPrice: 0,
			amount: 2,
			maxAmount: 4
		}, {
			id: 4,
			size: '61 x 184 x 2130 мм',
			title: 'Матрац Largo SLIM / Ларго Слім',
			link: '#',
			src: 'img/products/05.webp',
			stock: 'В наявності',
			currentPrice: 3122,
			oldPrice: 2810,
			amount: 2,
			maxAmount: 3
		}
	]
}
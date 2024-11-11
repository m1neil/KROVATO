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

	// functions ===========================================================================
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

	// functions ===========================================================================
	sendNewAmount(event) {
		const newAmount = event.detail.newAmount
		this.sendEvent({ newAmount })
	}

	removeProduct() {
		this.sendEvent({}, 'remove')
	}

	// custom events ===========================================================================
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

	// create elements ===========================================================================
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
		const quantity = new Quantity(this.props.amount, this.props.maxAmount)
		wrapper.append(quantity.render('product-cart-header'))
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

	// set, get ===========================================================================
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

	// functions ===========================================================================
	// TODO: Под вопросом метод
	actionFooterCart(e) {
		const target = e.target
		if (target.closest('[data-cart-order]')) {

		} else if (target.closest('[data-cart-continue]')) {
			// document.documentElement.classList.remove("cart-open")
		}
	}

	// updates ===========================================================================
	updateProductList(newList) {
		this.ProductList = newList
	}

	updateAmount(id, newAmount) {
		const product = this.ProductList.find(item => item.id === id)
		product.amount = newAmount
		this.updateLocalStorage()
	}

	removeProductItem(id) {
		this.#productList = this.ProductList.filter(item => item.id !== id)
		this.updateLocalStorage()
		this.amountProductsEl.textContent = this.AmountProducts
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

	// create elements ===========================================================================
	createHeader(isHeaderCart) {
		const wrapper = document.createElement('div')
		wrapper.className = 'cart-header__header'

		const title = document.createElement('h4')
		title.className = 'cart-header__title'
		title.textContent = 'Ваш кошик '

		const amountProductsEl = document.createElement('span')
		amountProductsEl.textContent = this.AmountProducts
		title.append(amountProductsEl)
		this.amountProductsEl = amountProductsEl
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

	createInfoElement(message = 'Корзина пуста', classModify = '') {
		const element = document.createElement('div')
		element.className = 'cart-header__message'
		if (classModify)
			element.classList.add(classModify)
		element.textContent = message
		return element
	}

	createButtons(isButtonOrder = true, tag = 'button') {
		const element = document.createElement(tag)
		if (tag === 'button') {
			element.type = 'button'
		} else {
			element.href = 'order.html'
		}
		element.className = 'cart-header__button'
		const textElement = isButtonOrder ? 'оформити замовлення' : 'Продовжити покупки'
		const dataAttribute = isButtonOrder ? 'data-cart-order' : 'data-cart-continue'
		element.textContent = textElement
		element.setAttribute(dataAttribute, '')
		if (!isButtonOrder)
			element.classList.add('cart-header__button--border')
		return element
	}

	createFooter(isHeaderCart) {
		const footer = document.createElement('div')
		footer.addEventListener('click', this.actionFooterCart.bind(this))
		footer.className = 'cart-header__footer'

		if (isHeaderCart) {
			this.orderButton = this.createButtons(true, 'a')
			footer.append(this.orderButton)
			const continueButton = this.createButtons(false)
			footer.append(continueButton)
		} else {
			this.orderButton = this.createButtons()
			footer.append(this.orderButton)
			const confirmation = document.createElement('div')
			confirmation.className = 'cart-header__confirmation'
			confirmation.textContent = 'Підтверджуючи замовлення, я приймаю умови'
			footer.append(confirmation)

			const link = document.createElement('a')
			link.textContent = 'Угоди користувача'
			link.href = '#'
			link.setAttribute('target', '_blank')
			confirmation.append(link)
		}
		return footer
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

		const footer = this.createFooter(isHeaderCart)

		this.listElement = document.createElement('div')
		this.listElement.className = 'cart-header__items'
		this.fillListElement()
		wrapper.append(this.listElement)
		wrapper.append(footer)

		return wrapper
	}
}

// child class CartOrder ===========================================================================
class CartOrder extends CartHeader {
	constructor(data) {
		super(data)
		this.promoCode = '4512'
		this.discountRent = 7
		this.isDiscountInclude = false
		this.regExp = /\D/g
	}
	// get ===========================================================================
	get TotalPrice() {
		return this.ProductList.reduce((prevSum, { currentPrice, amount }) => prevSum + currentPrice * amount, 0)
	}

	// function ===========================================================================

	updateState(event) {
		const { type, id, newAmount } = event.detail
		if (type === 'update')
			this.updateAmount(id, newAmount)
		else this.removeProductItem(id)
		this.fillTableAboutOrder()
	}

	getTotalPriceWithDiscount(value) {
		return value - value * this.discountRent / 100
	}

	inputPromoCode(event) {
		const target = event.target
		const value = target.value
		if (this.regExp.test(value))
			target.value = value.replace(this.regExp, '')
	}

	formatValue(value) {
		if (!value) return
		const formatter = new Intl.NumberFormat('ru-RU')
		return formatter.format(value)
	}

	checkPromoCode() {
		let value = this.inputElementPromo.value
		if (value.length < 4)
			throw new RangeError("Промокод складається з 4 символів!")
		else if (value !== this.promoCode)
			throw new RangeError("Не вірний код!")

		this.inputElementPromo.setAttribute('readonly', '')
		this.buttonSendPromoCode.setAttribute('disabled', '')
		this.isDiscountInclude = true
		this.fillTableAboutOrder()
	}

	removeError(element) {
		if (element && element.classList.contains('--error'))
			element.remove()
	}

	createDiscountElement() {
		const wrapper = document.createElement('div')
		wrapper.className = 'cart-header__promo promo-cart'

		const label = document.createElement('label')
		label.className = 'promo-cart__label'
		label.textContent = 'Є промокод?'
		label.setAttribute('for', 'promo-code')
		wrapper.append(label)

		const icon = document.createElement('img')
		icon.src = 'img/icons/order/promo-code.svg'
		icon.alt = 'icon discount'
		icon.setAttribute('aria-hidden', true)
		label.prepend(icon)

		const actionsWrapper = document.createElement('div')
		actionsWrapper.className = 'promo-cart__actions'
		wrapper.append(actionsWrapper)

		const input = document.createElement('input')
		input.value = this.promoCode
		input.type = 'text'
		input.className = 'promo-cart__input input'
		input.placeholder = 'Введіть код'
		input.addEventListener('input', this.inputPromoCode.bind(this))
		input.addEventListener('focusin', () => {
			this.removeError(wrapper.nextElementSibling)
		})
		input.maxLength = 4
		actionsWrapper.append(input)
		this.inputElementPromo = input

		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'promo-cart__button button-link'
		button.textContent = 'ок'
		button.addEventListener('click', () => {
			try {
				this.checkPromoCode()
				this.removeError(wrapper.nextElementSibling)
			} catch (error) {
				this.removeError(wrapper.nextElementSibling)
				const errorElement = this.createInfoElement(error.message, '--error')
				wrapper.after(errorElement)
			}
		})
		this.buttonSendPromoCode = button
		actionsWrapper.append(button)

		return wrapper
	}

	createRow(text, value, cssModify) {
		const row = document.createElement('tr')
		row.className = 'total-cart__row'

		const colLabel = document.createElement('td')
		colLabel.className = 'total-cart__label'
		colLabel.textContent = text
		row.append(colLabel)

		const colValue = document.createElement('td')
		colValue.className = 'total-cart__value'
		if (cssModify) colValue.classList.add(cssModify)
		colValue.textContent = value
		row.append(colValue)

		return row
	}

	fillTableAboutOrder() {
		this.tableAboutOrder.innerHTML = ''
		if (this.AmountProducts) {
			const totalPrice = this.TotalPrice

			const tbody = this.tableAboutOrder.createTBody()
			tbody.append(this.createRow(
				`${this.AmountProducts} товари на суму:`,
				`${this.formatValue(totalPrice)} грн.`)
			)

			let totalPriceWithDiscount
			if (this.isDiscountInclude) {
				totalPriceWithDiscount = this.getTotalPriceWithDiscount(totalPrice)
				tbody.append(this.createRow('Знижка:', `${this.discountRent}%`))
			}

			tbody.append(this.createRow('Вартість доставки:', 'За тарифами оператора'))

			const currentTotalPrice = this.formatValue(totalPriceWithDiscount ?? totalPrice)
			tbody.append(this.createRow(
				'До оплати:',
				`${currentTotalPrice} грн.`,
				'total-cart__value--fz-big'
			))
			this.tableAboutOrder.append(tbody)
		} else {
			while (this.listElement.nextSibling) {
				this.listElement.nextSibling.remove()
			}
		}
	}

	createAboutOrder() {
		const wrapper = document.createElement('div')
		wrapper.className = 'cart-header__total total-car'

		const title = document.createElement('h5')
		title.className = 'total-cart__title'
		title.textContent = 'Разом:'
		wrapper.append(title)

		const table = document.createElement('table')
		table.className = 'total-cart__table'
		this.tableAboutOrder = table
		this.fillTableAboutOrder()
		wrapper.append(table)

		const label = document.createElement('label')
		label.className = 'total-cart__checkbox checkbox checkbox--light-grey'
		label.innerHTML = `
			<span class="checkbox__text">Не передзвонюйте мені для підтвердження замовлення</span>
			<input type="checkbox" name="not-call" class="checkbox__input">
		`
		wrapper.append(label)

		return wrapper
	}

	sendOrder() {
		let totalPrice = this.TotalPrice
		if (this.isDiscountInclude)
			totalPrice = this.getTotalPriceWithDiscount(totalPrice)
		const order = {
			products: this.ProductList,
			totalPrice
		}
		console.log(order)
	}

	render(bemClass, selectorContainer) {
		super.render(bemClass, false, selectorContainer)
		this.orderButton.addEventListener('click', this.sendOrder.bind(this))
		const discountElement = this.createDiscountElement()
		this.listElement.after(discountElement)
		discountElement.after(this.createAboutOrder())
	}
}


window.addEventListener('load', () => {
	const quantities = document.querySelectorAll('[data-quantity-button]')
	if (quantities.length) {
		quantities.forEach(item => {
			const quantity = new Quantity(2, 5).render(item.getAttribute('data-quantity-button'))
			item.after(quantity)
			item.remove()
		})
	}


	let data = JSON.parse(localStorage.getItem('product-cart'))
	if (!data || !data.length) {
		data = dataForCart()
		localStorage.setItem('product-cart', JSON.stringify(data))
	}

	try {
		new CartHeader(data).render('middle-header', true, '.middle-header__actions')
		if (document.querySelector('.form-order__check')) {
			new CartOrder(data).render('check-order', '.form-order__check')
		}
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
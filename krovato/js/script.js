"use strict"

window.addEventListener("load", windowLoaded)
const isMobile = window.matchMedia("(any-hover: none)")

function windowLoaded() {
	const lang = document.querySelector(".lang-header")
	const phoneBox = document.querySelector(".phone-header")

	// @media request ============================================================
	const matchMediaTablet = window.matchMedia(`(max-width: ${991.98 / 16}em)`)
	const matchMedia = window.matchMedia(`(max-width: ${767.98 / 16}em)`)

	// listener ===========================================================================
	document.addEventListener("click", documentAction)
	document.addEventListener("keydown", keyActions)

	if (navigator.userAgent.includes("Firefox")) {
		document.documentElement.classList.add("--firefox")
	}

	if (lang) {
		if (isMobile)
			lang.setAttribute('aria-label', 'Показати або сховати інші мови')
		else
			lang.removeAttribute('aria-label')
	}


	const header = document.querySelector('.header')
	if (header) {
		window.addEventListener('scroll', () => {
			if (scrollY > 100 && !header.classList.contains('--sticky'))
				header.classList.add('--sticky')
			else if (scrollY <= 100 && header.classList.contains('--sticky'))
				header.classList.remove('--sticky')
		})
	}



	const oldTable = document.querySelector('.table-entry')
	if (oldTable) {
		const caption = oldTable.previousElementSibling
		initDivideTable(caption, oldTable)
		matchMedia.addEventListener("change", () => {
			initDivideTable(caption, oldTable)
		})
	}

	const googleMapSelector = '#map'
	if (document.querySelector(googleMapSelector)) {
		initMap(googleMapSelector)
	}

	// init =========================================================================================

	initShowMore()
	initSpollers()
	initSliders()
	initRating()
	initRange()
	initFilter()
	window.addEventListener('resize', changeActiveShowMore)
	changeActiveShowMore()

	const inputPhone = document.querySelector('.bottom-product__input')
	if (inputPhone) {
		const value = inputPhone.value
		inputPhone.addEventListener('focusout', e => {
			const target = e.target
			if (target.value < 4) target.value = value
		})
		Inputmask({ "mask": "+380  99  999  99  99", "placeholder": "-" }).mask(inputPhone)
	}

	// document actions ====================================================================================
	function documentAction(e) {
		const target = e.target

		// reduce and increase ==================================================================
		if (target.closest(".quantity__button--reduce")) {
			const input = target.closest(".quantity__button--reduce").nextElementSibling
			input.value = input.value > 1 ? input.value - 1 : 1
		} else if (target.closest(".quantity__button--increase")) {
			const input = target.closest(".quantity__button--increase").previousElementSibling
			input.value = input.value > 0 ? input.value + 1 : 1
		}

		if (target.closest('[data-goto]')) {
			const targetElement = target.closest('[data-goto]')
			const selector = targetElement.dataset.goto
			if (selector && document.querySelector(selector)) {
				const element = document.querySelector(selector)
				const elementTop = element.getBoundingClientRect().top - header.offsetHeight
				window.scrollBy({
					top: elementTop,
					behavior: 'smooth'
				})
			}
			e.preventDefault()
		}

		// cart ==============================================================
		if (target.closest(".middle-header__button._icon-cart"))
			document.documentElement.classList.toggle("cart-open")
		else if (
			!target.closest(".cart-header") ||
			target.closest(".cart-header__close") ||
			target.closest("[data-cart-continue]")
		) document.documentElement.classList.remove("cart-open")

		if (target.closest(".product-cart-header__remove")) {
			const item = target.closest(".cart-header__product")
			item.remove()
		}

		// toggle burger menu ===========================================
		if (target.closest(".icon-menu")) {
			document.documentElement.classList.toggle("menu-open")
		} else if (!target.closest(".top-header")) {
			document.documentElement.classList.remove("menu-open")
		}

		// mobile actions ===========================================
		if (isMobile.matches) {
			// toggle language ================================
			if (target.closest(".lang-header"))
				lang.classList.toggle("--active")
			else
				lang.classList.remove("--active")

			// toggle menu catalog on mobile ======================================================
			if (target.closest(".menu-catalog__button")) {
				const currentMenuCatalogItem = target.closest(".menu-catalog__item")
				currentMenuCatalogItem.classList.toggle("--active")
				const activeMenuCatalogItems = document.querySelectorAll(".menu-catalog__item.--active")
				if (activeMenuCatalogItems.length > 0) {
					activeMenuCatalogItems.forEach((item) => {
						if (item !== currentMenuCatalogItem) {
							item.classList.remove("--active")
						}
					})
				}
			} else if (!target.closest(".menu-catalog__wrapper")) {
				const activeMenuCatalogItems = document.querySelectorAll(".menu-catalog__item.--active")
				if (activeMenuCatalogItems.length > 0) {
					activeMenuCatalogItems.forEach((item) => {
						item.classList.remove("--active")
					})
				}
			}
		}

		// toggle list phone ====================================================
		if (target.closest(".phone-header")) {
			if (target.closest("button")) {
				phoneBox.classList.toggle("--active")
			}
		} else {
			phoneBox.classList.remove("--active")
		}

		// toggle catalog on pc =========================================================================
		if (target.closest(".catalog-header__button")) {
			const menuCatalogTop = document.querySelector(".menu-catalog")?.getBoundingClientRect().top
			const paddingBottom = matchMedia.matches ? 10 : 20

			document.documentElement.style.setProperty("--menu-catalog-top", `${(menuCatalogTop + paddingBottom) / 16}rem`)
			document.documentElement.classList.toggle("catalog-open")

			if (!document.documentElement.classList.contains("catalog-open") && matchMedia.matches) {
				hideSpollers(document.querySelector(".menu-catalog__list"))
			}
		} else if (!target.closest(".menu-catalog__wrapper")) {
			document.documentElement.classList.remove("catalog-open")
			if (matchMedia.matches)
				hideSpollers(document.querySelector(".menu-catalog__list"))
		}

		// toggle search ==============================================================
		if (target.closest(".middle-header__button--search"))
			document.documentElement.classList.toggle("search-open")
		else if (!target.closest(".middle-header__search"))
			document.documentElement.classList.remove("search-open")

		// toggle show more
		if (target.closest("[data-show-more-trigger]")) {
			const block = target.closest("[data-show-more]")
			const content = block.querySelector("[data-show-more-content]")
			const height = content.dataset.showMoreContent ? parseFloat(content.dataset.showMoreContent) : 280
			block.classList.toggle("--hide")

			if (block.classList.contains("--hide")) {
				content.style.height = `${content.offsetHeight / 16}rem`
				content.offsetHeight
				content.style.transition = "height 0.3s"
				content.style.height = `${height / 16}rem`
				setTimeout(() => {
					content.style.removeProperty("transition")
				}, 300)
			} else {
				content.style.transition = "height 0.3s"
				content.style.height = `${content.scrollHeight / 16}rem`
				setTimeout(() => {
					content.style.removeProperty("height")
					content.style.removeProperty("transition")
				}, 300)
			}
		}

		if (target.closest('.button-review') && !target.closest('.button-review._icon-like')) {
			const button = target.closest('.button-review')
			button.classList.toggle('--active')
		}

		// toggle lock body =======================================================
		if (
			document.documentElement.classList.contains("search-open") ||
			document.documentElement.classList.contains("catalog-open") ||
			document.documentElement.classList.contains("menu-open") ||
			document.documentElement.classList.contains("cart-open")
		) {
			const scrollWidth = getWidthScroll()
			document.documentElement.classList.add("lock")
			document.body.style.paddingRight = `${scrollWidth / 16}rem`
			togglePaddingScrollFixedElement(scrollWidth)
		} else {
			document.body.style.removeProperty('padding-right')
			togglePaddingScrollFixedElement()
			document.documentElement.classList.remove("lock")
		}
	}

	// key actions ====================================================================================
	function keyActions(e) {
		if (e.key === "Escape") {
			togglePaddingScrollFixedElement()
			document.documentElement.classList.remove("catalog-open", "lock", "search-open", "cart-open")
			document.body.style.removeProperty('padding-right')

			if (isMobile.matches && matchMediaTablet.matches && !matchMedia.matches) {
				const activeMenuCatalogItems = document.querySelectorAll(".menu-catalog__item.--active")
				if (activeMenuCatalogItems.length > 0) {
					activeMenuCatalogItems.forEach(item => {
						item.classList.remove("--active")
					})
				}
			}

			if (matchMedia.matches) {
				const wrapperCatalogSpoller = document.querySelector(".menu-catalog__list")
				if (wrapperCatalogSpoller) {
					hideSpollers(wrapperCatalogSpoller)
				}
			}
		}
	}

	// Divide Table
	function initDivideTable(caption, oldTable) {
		if (matchMedia.matches) {
			const container = oldTable.parentElement
			const headTitles = oldTable.tHead.querySelectorAll('tr .table-entry__value')
			const bodyRows = oldTable.tBodies[0].querySelectorAll('tr')
			const tablesData = [[], []]
			caption.style.display = 'none'
			bodyRows.forEach(row => {
				const allTd = row.querySelectorAll('td')
				const title = allTd[0].textContent
				const valueFirst = allTd[1].textContent
				const valueSecond = allTd[2].textContent
				tablesData[0].push({
					title,
					value: valueFirst
				})
				tablesData[1].push({
					title,
					value: valueSecond
				})
			})

			headTitles.forEach((title, i) => {
				const totalTitle =
					`<h2 class="tables-delivery__title title title--center">
						${caption.textContent}
						<span>${title.textContent}</span>
					</h2>`
				const table = getTable(tablesData[i])
				container.insertAdjacentHTML('beforeend', totalTitle)
				container.insertAdjacentElement('beforeend', table)
			})
		} else {
			caption.style.removeProperty('display')
			const tables = document.querySelectorAll('table.sub-table-entry')
			if (tables.length > 0) {
				tables.forEach(table => {
					table.previousElementSibling.remove()
					table.remove()
				})
			}
		}

	}

	function getTable(data) {
		const table = document.createElement('table')
		table.classList.add('sub-table-entry', 'table-delivery')
		const tbody = table.createTBody()
		tbody.classList.add('table-delivery__body')

		data.forEach(({ title, value }) => {
			tbody.insertAdjacentHTML('beforeend', `
				<tr class="table-delivery__row">
					<td class="table-delivery__title">${title}</td>
					<td class="table-delivery__value">${value}</td>
				</tr>
			`)
		})

		return table
	}


	function togglePaddingScrollFixedElement(widthScroll) {
		const fixedElements = document.querySelectorAll("[data-fixed]")
		if (!fixedElements.length) return
		if (widthScroll) {
			fixedElements.forEach(element => {
				element.style.paddingRight = `${widthScroll / 16}rem`
			})
		} else {
			fixedElements.forEach(element => {
				element.style.removeProperty('padding-right')
			})
		}
	}
}

function getWidthScroll() {
	const box = document.createElement("div")
	box.style.cssText = `
			width: 50px;
			height: 50px;
			overflow-y: scroll;
			visibility: hidden;
			opacity: 0;
			position: absolute:
			top: 0;
			left: -100%;
		`
	document.body.append(box)
	const scrollWidth = box.offsetWidth - box.clientWidth
	box.remove()
	return scrollWidth
}

// spollers ==========================================================================
function initSpollers() {
	const spollerBlocks = document.querySelectorAll("[data-spollers]")
	if (!spollerBlocks.length) return

	const regularSpollerBlocks = Array.from(spollerBlocks).filter((item) => !item.dataset.spollers.split(",")[0])
	const mediaSpollerBlocks = Array.from(spollerBlocks).filter((item) => item.dataset.spollers.split(",")[0])
	const breakpoints = []

	initSpollerBody(regularSpollerBlocks)

	mediaSpollerBlocks.forEach((item) => {
		const options = item.dataset.spollers.split(",")
		const obj = {}
		obj.value = options[0]
		obj.typeMedia = options[1] ? options[1] : "max"
		obj.item = item
		breakpoints.push(obj)
	})

	const mediaRequests = breakpoints.map((item) => {
		return `(${item.typeMedia}-width: ${item.value / 16}em),${item.value},${item.typeMedia}`
	})

	const uniqueMediaRequests = new Set(mediaRequests)
	uniqueMediaRequests.forEach((item) => {
		const options = item.split(",")
		const media = options[0]
		const value = options[1]
		const typeMedia = options[2]

		const currentSpollersBlock = breakpoints.filter(breakpoint => {
			return breakpoint.value === value && breakpoint.typeMedia === typeMedia
		})

		const matchMedia = window.matchMedia(media)
		initSpollerBody(currentSpollersBlock, matchMedia)
		matchMedia.addEventListener("change", () => initSpollerBody(currentSpollersBlock, matchMedia))
	})
}

function initSpollerBody(arraySpollerBlocks, matchMedia = false) {
	if (matchMedia?.matches || !matchMedia) {
		arraySpollerBlocks.forEach((element) => {
			const spollerBlock = element.item ? element.item : element
			spollerBlock.classList.add("_init")
			spollerBlock.addEventListener("click", setSpollerAction)
			let titles = spollerBlock.querySelectorAll("[data-spoller]")
			if (spollerBlock.hasAttribute('data-sub-spollers'))
				titles = Array.from(titles)
					.filter(item => item.closest('[data-spollers]') === spollerBlock)
			if (titles.length > 0) {
				titles.forEach(title => {
					title.removeAttribute("tabindex")
					title.setAttribute('aria-label', 'Відкрити або закрити контент')
					if (!title.classList.contains("--active")) {
						title.nextElementSibling.hidden = true
					}
				})
			}
		})
	} else {
		arraySpollerBlocks.forEach((element) => {
			const spollerBlock = element.item ? element.item : element
			spollerBlock.classList.remove("_init")
			let titles = spollerBlock.querySelectorAll("[data-spoller]")
			if (spollerBlock.hasAttribute('data-sub-spollers'))
				titles = Array.from(titles)
					.filter(item => item.closest('[data-spollers]') === spollerBlock)
			if (titles.length > 0) {
				titles.forEach((title) => {
					title.removeAttribute('aria-label')
					title.setAttribute("tabindex", -1)
					title.nextElementSibling.hidden = false
				})
			}
			spollerBlock.removeEventListener("click", setSpollerAction)
		})
	}
}

function setSpollerAction(e) {
	const currentElement = e.target
	if (!currentElement.closest("[data-spoller]")) return

	const title = currentElement.closest("[data-spoller]")
	const spollerWrapper = title.closest("[data-spollers]")
	const isAccordion = spollerWrapper.hasAttribute("data-accordion")

	if (!spollerWrapper.querySelectorAll("._slide").length) {
		if (isAccordion && !title.classList.contains("--active"))
			hideSpollers(spollerWrapper)
		title.classList.toggle("--active")
		slideToggleSpoller(title.nextElementSibling, 600)
	}
}

function hideSpollers(spollerWrapper) {
	const spoller = spollerWrapper.querySelector(["[data-spoller].--active"])
	if (spoller) {
		spoller.classList.remove("--active")
		slideUp(spoller.nextElementSibling, 600)
	}
}

function slideUp(spoller, duration = 500) {
	if (spoller.classList.contains("_slide")) return
	spoller.classList.add("_slide")
	spoller.style.transitionProperty = "height, padding, margin"
	spoller.style.transitionDuration = `${duration}ms`
	spoller.style.height = `${spoller.offsetHeight / 16}rem`
	spoller.offsetHeight
	spoller.style.overflow = "hidden"
	spoller.style.height = 0
	spoller.style.paddingBlock = 0
	spoller.style.marginBlock = 0
	setTimeout(() => {
		spoller.hidden = true
		spoller.style.removeProperty("height")
		spoller.style.removeProperty("padding-block")
		spoller.style.removeProperty("margin-block")
		spoller.style.removeProperty("overflow")
		spoller.style.removeProperty("transition-duration")
		spoller.style.removeProperty("transition-property")
		spoller.classList.remove("_slide")
	}, duration)
}

function slideDown(spoller, duration = 500) {
	if (spoller.classList.contains("_slide")) return
	spoller.classList.add("_slide")
	if (spoller.hidden) {
		spoller.hidden = false
	}

	const height = spoller.offsetHeight

	spoller.style.height = `${spoller.offsetHeight / 16}rem`
	spoller.style.overflow = "hidden"
	spoller.style.height = 0
	spoller.style.paddingBlock = 0
	spoller.style.marginBlock = 0
	spoller.offsetHeight
	spoller.style.transitionProperty = "height, padding, margin"
	spoller.style.transitionDuration = `${duration}ms`
	spoller.style.height = `${height / 16}rem`
	spoller.style.removeProperty("padding-block")
	spoller.style.removeProperty("margin-block")
	setTimeout(() => {
		spoller.style.removeProperty("height")
		spoller.style.removeProperty("overflow")
		spoller.style.removeProperty("transition-duration")
		spoller.style.removeProperty("transition-property")
		spoller.classList.remove("_slide")
	}, duration)
}

function slideToggleSpoller(spoller, duration) {
	if (spoller.hidden) {
		slideDown(spoller, duration)
		const wrapperScroll = spoller.closest("[data-scroll-top]")
		if (wrapperScroll) {
			setTimeout(() => {
				const headerHeight = document.querySelector("header").offsetHeight
				const title = spoller.previousElementSibling
				if (title) {
					const elementPosition = title.getBoundingClientRect().top - headerHeight - 18
					if (elementPosition < 0) {
						wrapperScroll.scrollBy({
							top: elementPosition,
							behavior: "smooth",
						})
					}
				}
			}, duration)
		}
	} else {
		slideUp(spoller, duration)
	}
}

function initSliders() {
	// hero slider
	if (document.querySelector('.hero__slider')) {
		new Swiper(".hero__slider", {
			loop: true,
			spaceBetween: 60,
			speed: 800,
			touchAngle: 45,
			touchRatio: 0.8,
			pagination: {
				el: ".hero__pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				},
			},
			navigation: {
				nextEl: ".hero__button--next",
				prevEl: ".hero__button--prev",
			},
			autoplay: {
				delay: 3000,
				pauseOnMouseEnter: true,
			},
			breakpoints: {
				320: {
					speed: 400,
					spaceBetween: 30,
				},
				600: {
					speed: 800,
					spaceBetween: 40,
				},
				991.98: {
					spaceBetween: 60,
				},
			},
		})
	}

	// sales
	if (document.querySelector('.sales__slider')) {
		new Swiper(".sales__slider", {
			speed: 800,
			touchAngle: 45,
			touchRatio: 0.8,
			pagination: {
				el: ".sales__pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				},
			},
			navigation: {
				nextEl: ".sales .block-header__next",
				prevEl: ".sales .block-header__prev",
			},
			slidesPerView: 3,
			breakpoints: {
				320: {
					speed: 400,
					slidesPerView: 1,
					spaceBetween: 15,
				},
				600.98: {
					slidesPerView: 2,
					spaceBetween: 15,
				},
				991.98: {
					spaceBetween: 30,
					slidesPerView: 3,
				},
			},
		})
	}

	// reviews slider
	if (document.querySelector('.reviews__slider')) {
		new Swiper(".reviews__slider", {
			speed: 1200,
			touchAngle: 45,
			touchRatio: 0.8,
			spaceBetween: 30,
			pagination: {
				el: ".reviews__swiper-pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				},
			},
			slidesPerView: "auto",
			scrollbar: {
				el: ".reviews__swiper-scrollbar",
				hide: false,
				draggable: true,
				dragClass: ".reviews__swiper-scrollbar-drag swiper-scrollbar-drag _icon-arrow-scroll",
				dragSize: 60,
				snapOnRelease: false,
			},
			breakpoints: {
				320: {
					speed: 400,
					slidesPerView: 1,
					spaceBetween: 15,
					freeMode: false,
				},
				574.98: {
					slidesPerView: 1.3,
					spaceBetween: 15,
					freeMode: {
						enabled: true,
						minimumVelocity: 0.02,
						momentumBounceRatio: 0.3,
						momentum: true,
						momentumBounce: false,
					},
				},
				767.98: {
					slidesPerView: 2,
					spaceBetween: 15,
					freeMode: {
						enabled: true,
						minimumVelocity: 0.02,
						momentumBounceRatio: 0.3,
						momentum: true,
						momentumBounce: false,
					},
				},
				991.98: {
					spaceBetween: 30,
					slidesPerView: "auto",
					freeMode: {
						enabled: true,
						minimumVelocity: 0.02,
						momentumBounceRatio: 0.3,
						momentum: true,
						momentumBounce: false,
					},
				},
			},
		})
	}

	// articles slider
	if (document.querySelector('.news__slider')) {
		new Swiper(".news__slider", {
			speed: 800,
			touchAngle: 45,
			touchRatio: 0.8,
			pagination: {
				el: ".news__swiper-pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				},
			},
			navigation: {
				nextEl: ".news .block-header__next",
				prevEl: ".news .block-header__prev",
			},
			slidesPerView: 1,
			spaceBetween: 15,
			breakpoints: {
				320: {
					speed: 400,
					slidesPerView: 1,
					spaceBetween: 15,
				},
				600: {
					slidesPerView: 2,
					spaceBetween: 15,
				},
				1089.98: {
					spaceBetween: 30,
					slidesPerView: 3,
				},
			},
		})
	}

	// product sub slider
	if (document.querySelector('.sub-slider-product') && document.querySelector('.main-slider-product')) {
		const subSliderProduct = new Swiper(".sub-slider-product", {
			speed: 500,
			slidesPerView: 5,
			watchSlidesProgress: true,
			breakpoints: {
				320: {
					spaceBetween: 10,
				},
				768: {
					spaceBetween: 20,
				}
			},
		})

		// product slider
		const mainSlider = new Swiper(".main-slider-product", {
			speed: 800,
			pagination: {
				el: ".main-slider-product__swiper-pagination",
				clickable: true,
				renderBullet: function (index, className) {
					return `<button class="${className}" aria-label="Go to slide ${index + 1}"></button>`
				},
			},
			autoHeight: true,
			navigation: {
				nextEl: ".main-slider-product__button--next",
				prevEl: ".main-slider-product__button--prev",
			},
			thumbs: {
				swiper: subSliderProduct,
				autoScrollOffset: 1,
			},
			spaceBetween: 20,
		})

		const buttons = document.querySelectorAll('.sub-slider-product__slide')
		buttons.forEach((button, i) => {
			button.addEventListener('focusin', () => {
				mainSlider.slideTo(i, 800, true)
			})
		})
	}
}

function initRating() {
	const blockRatings = document.querySelectorAll("[data-rating]")
	if (!blockRatings.length) return

	blockRatings.forEach((rating) => {
		let startValue = rating.dataset.rating ? parseFloat(rating.dataset.rating) : 5
		const activeLine = rating.querySelector(".rating__active")
		const wrapperRadioButtons = rating.querySelector('.rating__radios')
		setRating()

		if (wrapperRadioButtons) {
			wrapperRadioButtons.addEventListener('mouseover', e => setRating(parseInt(e.target.value)))
			wrapperRadioButtons.addEventListener('mouseleave', () => setRating())
			wrapperRadioButtons.addEventListener('click', e => {
				startValue = parseInt(e.target.value)
				setRating()
			})
		}

		function setRating(value = startValue) {
			activeLine.style.inlineSize = `${value / 0.05}%`
		}
	})
}

function initShowMore() {
	const blocks = document.querySelectorAll("[data-show-more]")
	if (!blocks.length) return
	blocks.forEach((block) => {
		const content = block.querySelector("[data-show-more-content]")
		const options = content.hasAttribute('data-show-more-media') ?
			content.getAttribute('data-show-more-media').split(',') : []
		const newHeight = options[0] ? parseInt(options[0]) : 0
		const breakpoint = options[1] ? parseInt(options[1]) : 0
		const matchMedia = breakpoint ? window.matchMedia(`(max-width: ${breakpoint / 16}em)`) : null
		const height = content.dataset.showMoreContent ? parseFloat(content.dataset.showMoreContent) : 280

		if (matchMedia && matchMedia.matches)
			content.setAttribute('data-show-more-content', newHeight)
		else
			content.setAttribute('data-show-more-content', height)

		const currentHeight = parseFloat(content.dataset.showMoreContent)

		if (content.scrollHeight > currentHeight) {
			block.classList.add("--init", "--hide")
			content.style.height = `${currentHeight / 16}rem`
		} else {
			block.classList.remove("--init", "--hide")
		}

		if (matchMedia) {
			matchMedia.addEventListener('change', e => {
				if (e.matches)
					content.setAttribute('data-show-more-content', newHeight)
				else
					content.setAttribute('data-show-more-content', height)


				const currentHeight = parseFloat(content.dataset.showMoreContent)

				if (block.classList.contains('--hide'))
					content.style.height = `${currentHeight / 16}rem`
				else {
					content.style.height = `${content.scrollHeight / 16}rem`
					content.style.removeProperty('height')
				}
			})
		}

	})
}

function changeActiveShowMore() {
	const blocks = document.querySelectorAll("[data-show-more]")
	blocks.forEach(item => {
		const content = item.querySelector('[data-show-more-content]')
		const size = parseFloat(content.getAttribute('data-show-more-content'))
		if (content.scrollHeight <= size) {
			content.nextElementSibling.setAttribute('hidden', '')
			content.style.removeProperty('height')
		} else {
			content.nextElementSibling.removeAttribute('hidden', '')
			if (content.parentElement.classList.contains('--hide'))
				content.style.height = `${size}px`
		}
	})
}

function initRange() {
	const stepsSlider = document.querySelector('.item-filter__range')

	if (stepsSlider) {
		const formatForSlider = {
			from: (formattedValue) => {
				return Number(formattedValue);
			},
			to: (numericValue) => {
				return Math.round(numericValue);
			}
		};

		const inputs = document.querySelectorAll('.price-filter__input')
		const regExpNotNumber = /\D/

		const startRange = stepsSlider.dataset.rangeStart ? parseInt(stepsSlider.dataset.rangeStart) : 0
		const endRange = stepsSlider.dataset.rangeEnd ? parseInt(stepsSlider.dataset.rangeEnd) : 0
		const minRange = inputs[0].dataset.rangeMin ? parseInt(inputs[0].dataset.rangeMin) : 0
		const maxRange = inputs[1].dataset.rangeMax ? parseInt(inputs[1].dataset.rangeMax) : 100

		noUiSlider.create(stepsSlider, {
			start: [startRange, endRange],
			connect: true,
			range: {
				'min': minRange,
				'max': maxRange
			},
			format: formatForSlider
		});

		stepsSlider.noUiSlider.on('update', (values, index) => {
			inputs[index].value = values[index]
		});

		inputs.forEach((input, index) => {
			input.addEventListener('input', e => {
				const target = e.target;
				const value = target.value
				if (value.match(regExpNotNumber))
					target.value = value.replace(regExpNotNumber, '')
			})

			input.addEventListener('change', e => {
				stepsSlider.noUiSlider.setHandle(index, e.target.value);
			});
		})
	}
}

function initFilter() {
	const filter = document.querySelector('[data-filter]')
	if (!filter) return
	const items = filter.querySelectorAll('[data-filter-category]')
	const navBlock = filter.querySelector('[data-filter-nav]')
	let currentFilter = 'all'
	navBlock.addEventListener('click', e => {
		const target = e.target
		if (target.closest('[data-filter-button]') &&
			!document.querySelectorAll('.--slide').length) {
			const targetElement = target.closest('[data-filter-button]')
			const category = targetElement.dataset.filterButton
			if (currentFilter === category) return

			const activeButton = navBlock.querySelector('[data-filter-button].--active')
			if (activeButton)
				activeButton.classList.remove('--active')

			currentFilter = category
			targetElement.classList.add('--active')
			navBlock.style.setProperty('--positionLeft', `${targetElement.offsetLeft / 16}rem`)
			navBlock.style.setProperty('--widthLine', `${(targetElement.offsetWidth - 0.5) / 16}rem`)

			items.forEach(item => {
				const category = item.dataset.filterCategory
				if (category === currentFilter || currentFilter === 'all') {
					if (!item.classList.contains('--hide')) return
					item.classList.remove('--hide')
					item.classList.add('--slide')
					item.style.boxSizing = 'content-box'
					item.style.removeProperty('padding-block')
					item.style.removeProperty('margin')
					item.style.removeProperty('border-color')
					item.style.removeProperty('opacity')
					item.style.removeProperty('visibility')
					item.offsetHeight
					item.style.blockSize = item.scrollHeight + 'px'
					setTimeout(() => {
						item.style.removeProperty('block-size')
						item.style.removeProperty('box-sizing')
						item.style.removeProperty('opacity')
						item.style.removeProperty('transition')
						item.style.removeProperty('overflow')
						item.classList.remove('--slide')
					}, 600);
				} else {
					item.classList.add('--hide', '--slide')
					item.style.blockSize = item.scrollHeight + 'px'
					item.offsetHeight
					item.style.transition = 'all 0.6s'
					item.style.overflow = 'hidden'
					item.style.blockSize = 0
					item.style.paddingBlock = 0
					item.style.opacity = 0
					item.style.margin = 0
					item.style.borderColor = 'transparent'
					item.style.visibility = 'hidden'
					setTimeout(() => {
						item.classList.remove('--slide')
					}, 600)
				}
			})
		}
	})
}

async function initMap(selector) {
	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
	const pinIcon = document.createElement("img");
	pinIcon.src = '../img/icons/locationpin.svg'
	const map = new Map(document.querySelector(selector), {
		center: { lat: 50.39610931979366, lng: 30.42378425088765 },
		zoom: 18,
		mapId: '547deaae7abeb0d1'
	});

	const marker = new AdvancedMarkerElement({
		map,
		position: { lat: 50.39610931979366, lng: 30.42378425088765 },
		gmpClickable: true,
		content: pinIcon,
	});
	const contentString =
		'<div id="content">' +
		'<div id="siteNotice">' +
		"</div>" +
		'<h1 style="margin-bottom: 5px; font-weight: 700;" id="firstHeading" class="firstHeading">KROVATO</h1>' +
		'<div id="bodyContent">' +
		"<p>Магазин меблів для дому Krovato є дистриб'ютором високоякісних меблів.</p>" +
		"</div>" +
		"</div>";
	const infowindow = new google.maps.InfoWindow({
		content: contentString,
		ariaLabel: "Uluru",
	});

	marker.addEventListener("click", () => {
		infowindow.open(map, marker);
	});
}

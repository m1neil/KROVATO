"use strict"

window.addEventListener("load", windowLoaded)
const isMobile = window.matchMedia("(any-hover: none)")

function windowLoaded() {
	const footerSocial = document.querySelector(".top-footer__social")
	const footerContainer = document.querySelector(".top-footer__container")
	const footerLogo = document.querySelector(".social-top-footer__img")
	const lang = document.querySelector(".lang-header")
	const phoneBox = document.querySelector(".phone-header")
	const fixedElements = document.querySelectorAll("[data-fixed]")

	// @media request ============================================================
	const matchMediaTablet = window.matchMedia(`(max-width: ${991.98 / 16}em)`)
	const matchMedia = window.matchMedia(`(max-width: ${767.98 / 16}em)`)
	const matchMediaSmallPc = window.matchMedia(`(max-width: ${1149.98 / 16}em)`)

	// listener ===========================================================================
	document.addEventListener("click", documentAction)
	document.addEventListener("keydown", keyActions)

	if (navigator.userAgent.includes("Firefox")) {
		document.documentElement.classList.add("--firefox")
	}

	const header = document.querySelector('.header')

	window.addEventListener('scroll', () => {
		if (scrollY > 100 && !header.classList.contains('--sticky'))
			header.classList.add('--sticky')
		else if (scrollY <= 100 && header.classList.contains('--sticky'))
			header.classList.remove('--sticky')
	})


	// move elements ====================================================================
	moveFooterSocial()
	matchMedia.addEventListener("change", moveFooterSocial)

	moveHeaderElements(matchMediaTablet.matches)

	matchMediaTablet.addEventListener("change", () => {
		moveHeaderElements(matchMediaTablet.matches)
		moveReviewForm()
	})

	moveSortSelect()
	moveProductItems()
	moveReviewForm()

	// init =========================================================================================
	initShowMore()
	initSpollers()
	initSliders()
	initRating()

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
			input.value = input.value > 1 ? --input.value : 1
		} else if (target.closest(".quantity__button--increase")) {
			const input = target.closest(".quantity__button--increase").previousElementSibling
			input.value = input.value > 0 ? ++input.value : 1
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
			if (target.closest(".lang-header")) {
				lang.classList.toggle("--active")
			} else {
				lang.classList.remove("--active")
			}

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
			addPaddingScrollFixedElement()
			document.documentElement.classList.add("lock")
		} else {
			removePaddingScrollFixedElement()
			document.documentElement.classList.remove("lock")
		}
	}

	// key actions ====================================================================================
	function keyActions(e) {
		if (e.key === "Escape") {
			document.documentElement.classList.remove("catalog-open", "lock", "search-open", "cart-open")
			removePaddingScrollFixedElement()

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

	// move elements in footer ============================================
	function moveFooterSocial() {
		if (matchMedia.matches) {
			footerContainer.append(footerSocial)
			footerContainer.prepend(footerLogo)
		} else {
			footerContainer.prepend(footerSocial)
			footerSocial.prepend(footerLogo)
		}
	}

	// move title product
	function moveProductItems() {
		const bodyProductInfo = document.querySelector('.body-product__info')
		const optionsProductFavorite = document.querySelector('.options-product__favorite')
		if (!bodyProductInfo || !optionsProductFavorite) return
		const parentBodyProductInfo = bodyProductInfo.parentElement
		const containerForParentBodyProductInfo = document.querySelector('.product-card__container')
		const containerForOptionsProductFavorite = document.querySelector('.actions-product')
		const parentOptionsProductFavorite = optionsProductFavorite.parentElement
		matchMediaSmallPc.addEventListener('change', () => {
			if (matchMediaSmallPc.matches) {
				containerForParentBodyProductInfo.prepend(bodyProductInfo)
				containerForOptionsProductFavorite.append(optionsProductFavorite)
			} else {
				parentBodyProductInfo.prepend(bodyProductInfo)
				parentOptionsProductFavorite.append(optionsProductFavorite)
			}
		})
		if (matchMediaSmallPc.matches) {
			containerForParentBodyProductInfo.prepend(bodyProductInfo)
			containerForOptionsProductFavorite.append(optionsProductFavorite)
		} else {
			parentBodyProductInfo.prepend(bodyProductInfo)
			parentOptionsProductFavorite.append(optionsProductFavorite)
		}
	}

	// move add review form
	function moveReviewForm() {
		const addReviewProduct = document.querySelector('.add-review-product')
		if (!addReviewProduct) return
		const container = document.querySelector('.about-product__container')
		const elementNearNeedPlace = document.querySelector('.body-about-product__characteristic')
		if (matchMediaTablet.matches)
			elementNearNeedPlace.after(addReviewProduct)
		else
			container.append(addReviewProduct)
	}

	// remove padding right ============================================
	function removePaddingScrollFixedElement() {
		document.body.style.removeProperty("padding-right")
		fixedElements.forEach((element) => {
			element.style.removeProperty("padding-right")
		})
	}

	function addPaddingScrollFixedElement() {
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
		document.body.style.paddingRight = `${scrollWidth / 16}rem`
		fixedElements.forEach(element => {
			element.style.paddingRight = `${scrollWidth / 16}rem`
		})
	}
}

// move header elements ===================================================================
function moveHeaderElements(isTablet) {
	const topHeaderContainer = document.querySelector(".top-header__container")
	const bottomHeaderContainer = document.querySelector(".bottom-header__container")
	const middleHeaderContainer = document.querySelector(".middle-header__container")
	const bottomHeaderMenu = document.querySelector(".bottom-header__menu")
	const catalogHeader = document.querySelector(".catalog-header")
	const middleHeaderActions = document.querySelector(".middle-header__actions")
	const searchHeader = document.querySelector(".search-header")
	const topHeaderActions = document.querySelector(".top-header__actions")

	if (isTablet) {
		topHeaderContainer.append(bottomHeaderMenu)
		topHeaderContainer.append(topHeaderActions)
		bottomHeaderContainer.append(catalogHeader)
		bottomHeaderContainer.append(searchHeader)
		bottomHeaderContainer.append(middleHeaderActions)
	} else {
		bottomHeaderContainer.append(bottomHeaderMenu)
		middleHeaderContainer.children[1].after(catalogHeader)
		middleHeaderContainer.children[2].after(searchHeader)
		middleHeaderContainer.append(middleHeaderActions)
	}
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

		const currentSpollersBlock = breakpoints.filter((breakpoint) => {
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
		if (isAccordion && !title.classList.contains("--active")) {
			hideSpollers(spollerWrapper)
		}
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

	// sales
	new Swiper(".sales__slider", {
		loop: true,
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
		autoplay: {
			delay: 3000,
			pauseOnMouseEnter: true,
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

	// reviews slider
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

	// articles slider
	new Swiper(".news__slider", {
		loop: true,
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
		autoplay: {
			delay: 3000,
			pauseOnMouseEnter: true,
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

	// product sub slider
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
	new Swiper(".main-slider-product", {
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
		},
		spaceBetween: 20,
	})



	// init range slider
	const formatForSlider = {
		from: (formattedValue) => {
			return Number(formattedValue);
		},
		to: (numericValue) => {
			return Math.round(numericValue);
		}
	};

	const stepsSlider = document.querySelector('.item-filter__range')

	if (stepsSlider) {
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
			console.log(value)
		}
	})
}

function initShowMore() {
	const blocks = document.querySelectorAll("[data-show-more]")
	if (!blocks.length) return
	blocks.forEach((block) => {
		const content = block.querySelector("[data-show-more-content]")
		const options = content.hasAttribute('data-show-more-media') ? content.getAttribute('data-show-more-media').split(',') : []
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
				if (e.matches) {
					content.setAttribute('data-show-more-content', newHeight)
				} else {
					content.setAttribute('data-show-more-content', height)
				}

				const currentHeight = parseFloat(content.dataset.showMoreContent)

				if (block.classList.contains('--hide')) {
					content.style.height = `${currentHeight / 16}rem`
				} else {
					content.style.height = `${content.scrollHeight / 16}rem`
					content.style.removeProperty('height')
				}
			})
		}

	})
}

function moveSortSelect() {
	const sort = document.querySelector('.sort-filter__wrap')
	if (sort) {
		const options = sort.dataset.da.split(',')
		const selectorWhereMove = options[0]
		const valueBreakpoint = options[1]
		const whereMoveItem = document.querySelector(selectorWhereMove)
		const parent = sort.parentElement
		const mediaRequest = window.matchMedia(`(max-width: ${valueBreakpoint / 16}em)`)

		if (mediaRequest.matches)
			whereMoveItem.append(sort)

		mediaRequest.addEventListener('change', e => {
			e.matches ? whereMoveItem.append(sort) : parent.append(sort)
		})
	}
}
"use strict"

window.addEventListener('load', windowLoaded);
const isMobile = window.matchMedia('(any-hover: none)');

function windowLoaded() {
	const footerSocial = document.querySelector('.top-footer__social');
	const footerContainer = document.querySelector('.top-footer__container');
	const footerLogo = document.querySelector('.social-top-footer__img');
	const lang = document.querySelector('.lang-header');
	const matchMedia = window.matchMedia(`(max-width: ${767.98 / 16}em)`);
	const phoneBox = document.querySelector('.phone-header');

	matchMedia.addEventListener('change', moveFooterSocial);
	document.addEventListener('click', documentAction);
	moveFooterSocial();
	initSpollers();

	function documentAction(e) {
		const target = e.target;

		if (isMobile.matches) {
			if (target.closest('.lang-header')) {
				lang.classList.toggle('--active')
			} else {
				lang.classList.remove('--active')
			}
		}

		if (target.closest('.phone-header')) {
			if (target.closest('button')) {
				phoneBox.classList.toggle('--active');
			}
		} else {
			phoneBox.classList.remove('--active');
		}
	}

	function moveFooterSocial() {
		if (matchMedia.matches) {
			footerContainer.append(footerSocial);
			footerContainer.prepend(footerLogo);
		} else {
			footerContainer.prepend(footerSocial);
			footerSocial.prepend(footerLogo);
		}
	}
}


// spollers ==========================================================================
function initSpollers() {
	const spollerBlocks = document.querySelectorAll('[data-spollers]');
	if (!spollerBlocks.length) return;

	const regularSpollerBlocks = Array.from(spollerBlocks).filter(item => !item.dataset.spollers.split(',')[0]);
	const mediaSpollerBlocks = Array.from(spollerBlocks).filter(item => item.dataset.spollers.split(',')[0]);
	const breakpoints = [];

	initSpollerBody(regularSpollerBlocks);

	mediaSpollerBlocks.forEach(item => {
		const options = item.dataset.spollers.split(',');
		const obj = {};
		obj.value = options[0];
		obj.typeMedia = options[1] ? options[1] : 'max';
		obj.item = item;
		breakpoints.push(obj);
	});

	const mediaRequests = breakpoints.map(item => {
		return `(${item.typeMedia}-width: ${item.value / 16}em),${item.value},${item.typeMedia}`;
	});

	const uniqueMediaRequests = new Set(mediaRequests);
	uniqueMediaRequests.forEach(item => {
		const options = item.split(',');
		const media = options[0];
		const value = options[1];
		const typeMedia = options[2];

		const currentSpollersBlock = breakpoints.filter(breakpoint => {
			return breakpoint.value === value && breakpoint.typeMedia === typeMedia
		});

		const matchMedia = window.matchMedia(media);
		initSpollerBody(currentSpollersBlock, matchMedia);
		matchMedia.addEventListener('change', () => initSpollerBody(currentSpollersBlock, matchMedia));
	});

}

function initSpollerBody(arraySpollerBlocks, matchMedia = false) {
	if (matchMedia?.matches || !matchMedia) {
		arraySpollerBlocks.forEach(element => {
			const spollerBlock = element.item ? element.item : element;
			spollerBlock.classList.add('_init');
			spollerBlock.addEventListener('click', setSpollerAction);
			const titles = spollerBlock.querySelectorAll('[data-spoller]');
			if (titles.length) {
				titles.forEach(title => {
					if (!title.classList.contains('--active')) {
						title.removeAttribute('tabindex');
						title.nextElementSibling.hidden = true;
					}
				});
			}
		});
	} else {
		arraySpollerBlocks.forEach(spollerBlock => {
			spollerBlock.item.classList.remove('_init');
			const titles = spollerBlock.item.querySelectorAll('[data-spoller]');
			if (titles.length) {
				titles.forEach(title => {
					title.setAttribute('tabindex', -1);
					title.nextElementSibling.hidden = false;
				});
			}
			spollerBlock.item.removeEventListener('click', setSpollerAction);
		});
	}
}

function setSpollerAction(e) {
	const currentElement = e.target;
	if (!currentElement.closest('[data-spoller]')) return;

	const title = currentElement.closest('[data-spoller]');
	const spollerWrapper = title.closest('[data-spollers]');
	const isAccordion = spollerWrapper.hasAttribute('data-accordion');

	if (!spollerWrapper.querySelectorAll('._slide').length) {
		if (isAccordion && !title.classList.contains('--active')) {
			hideSpollers(spollerWrapper);
		}
		title.classList.toggle('--active');
		slideToggleSpoller(title.nextElementSibling, 600);
	}
}

function hideSpollers(spollerWrapper) {
	const spoller = spollerWrapper.querySelector(['[data-spoller].--active']);
	if (spoller) {
		spoller.classList.remove('--active');
		slideUp(spoller.nextElementSibling, 600);
	}
}

function slideUp(spoller, duration = 500) {
	if (spoller.classList.contains('_slide')) return;
	spoller.classList.add('_slide');
	spoller.style.transitionProperty = 'height, padding, margin';
	spoller.style.transitionDuration = `${duration}ms`;
	spoller.style.height = `${spoller.offsetHeight / 16}rem`
	spoller.offsetHeight;
	spoller.style.overflow = 'hidden';
	spoller.style.height = 0;
	spoller.style.paddingBlock = 0;
	spoller.style.marginBlock = 0;
	setTimeout(() => {
		spoller.hidden = true;
		spoller.style.removeProperty('height');
		spoller.style.removeProperty('padding-block');
		spoller.style.removeProperty('margin-block');
		spoller.style.removeProperty('overflow');
		spoller.style.removeProperty('transition-duration');
		spoller.style.removeProperty('transition-property');
		spoller.classList.remove('_slide');
	}, duration);
}

function slideDown(spoller, duration = 500) {
	if (spoller.classList.contains('_slide')) return;
	spoller.classList.add('_slide');
	if (spoller.hidden) {
		spoller.hidden = false;
	}

	const height = spoller.offsetHeight;

	spoller.style.height = `${spoller.offsetHeight / 16}rem`
	spoller.style.overflow = 'hidden';
	spoller.style.height = 0;
	spoller.style.paddingBlock = 0;
	spoller.style.marginBlock = 0;
	spoller.offsetHeight;
	spoller.style.transitionProperty = 'height, padding, margin';
	spoller.style.transitionDuration = `${duration}ms`;
	spoller.style.height = `${height / 16}rem`;
	spoller.style.removeProperty('padding-block');
	spoller.style.removeProperty('margin-block');
	setTimeout(() => {
		spoller.style.removeProperty('height');
		spoller.style.removeProperty('overflow');
		spoller.style.removeProperty('transition-duration');
		spoller.style.removeProperty('transition-property');
		spoller.classList.remove('_slide');
	}, duration);
}

function slideToggleSpoller(spoller, duration) {
	if (spoller.hidden) {
		slideDown(spoller, duration);
	} else {
		slideUp(spoller, duration);
	}
}
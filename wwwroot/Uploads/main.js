$(function() {
	// Sayfa yüklenme performansı için lazy loading
	document.addEventListener("DOMContentLoaded", function() {
		var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

		if ("IntersectionObserver" in window) {
			let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting) {
						let lazyImage = entry.target;
						lazyImage.src = lazyImage.dataset.src;
						lazyImage.classList.remove("lazy");
						lazyImageObserver.unobserve(lazyImage);
					}
				});
			});

			lazyImages.forEach(function(lazyImage) {
				lazyImageObserver.observe(lazyImage);
			});
		}
	});

	// Scroll performansı için throttle
	let scrollTimeout;
	$(window).on('scroll', function() {
		if (!scrollTimeout) {
			scrollTimeout = setTimeout(function() {
				scrollTimeout = null;
				
				// Scroll işlemleri
				if ($(window).scrollTop() > 100) {
					$('.site-navbar').addClass('scrolled');
				} else {
					$('.site-navbar').removeClass('scrolled');
				}
			}, 100);
		}
	});

	// Aktif menü öğesini belirle
	var currentPath = window.location.pathname.toLowerCase();
	$('.site-menu li').removeClass('active');
	$('.site-menu li a').each(function() {
		var href = $(this).attr('href').toLowerCase();
		if (currentPath === href) {
			$(this).closest('li').addClass('active');
		}
		// Ana sayfa için özel kontrol
		if ((currentPath === '/' || currentPath === '/home/index') && href === '/home/index') {
			$(this).closest('li').addClass('active');
		}
	});

	// Mobil menü için de aynı işlemi yap
	$('.site-mobile-menu-body').on('DOMNodeInserted', function() {
		$('.site-nav-wrap li a').each(function() {
			var href = $(this).attr('href').toLowerCase();
			if (currentPath === href) {
				$(this).closest('li').addClass('active');
			}
			if ((currentPath === '/' || currentPath === '/home/index') && href === '/home/index') {
				$(this).closest('li').addClass('active');
			}
		});
	});

	// Mobil menü toggle
	$('.js-menu-toggle').click(function(e) {
		e.preventDefault();
		$('body').toggleClass('offcanvas-menu');
	});

	// Menü dışına tıklandığında kapanma
	$(document).click(function(e) {
		var container = $(".site-mobile-menu");
		var toggle = $(".js-menu-toggle");
		
		if (!container.is(e.target) && 
			container.has(e.target).length === 0 && 
			!toggle.is(e.target) && 
			toggle.has(e.target).length === 0) {
			
			$('body').removeClass('offcanvas-menu');
		}
	});

	// Menü içeriğini klonlama
	var $menu = $('.js-clone-nav');
	$menu.clone().attr('class', 'site-nav-wrap').appendTo('.site-mobile-menu-body');
});
/*
 * 共用-toast
 */
define(['jquery'], function ($) {
    return {
		show: function (text) {
			var el
			
			// append to body
			if (!!$('#J-g-toast').length) {
				el = $('#J-g-toast')
			} else {
				el = $('<div id="J-g-toast" class="g-toast g-hidden"></div>')
				$('body').append(el)
			}

			// 插入文字
			el.html('<span>' + text + '</span>')
			
			// 动画
			el.removeClass('g-hidden')
			setTimeout(function () {
				el.addClass('g-toast--showing')
			}, 20)
			setTimeout(function () {
				el.removeClass('g-toast--showing')
			}, 2000)
			setTimeout(function () {
				el.addClass('g-hidden')
			}, 2100)
		}
	}
});

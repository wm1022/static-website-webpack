/*
 * 共用-覆盖层
 */
define(['jquery'], function ($) {
    return {
		appendTo: function (parent) {
			var el = !!$(parent).children('.g-overlay').length ? $(parent).children('.g-overlay').eq(0) : $('<div class="g-overlay g-hidden"/>').appendTo(parent)
			return el
		}
	}
});

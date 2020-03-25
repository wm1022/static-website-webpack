// tab切换，可传参数确定是否属于轮播图切换
// id: tab的id, tabTit: <ul class="tabTit"><li class="active" data-carousel="..."></li></ul>
// data-carousel 当前切换显示哪个轮播图

import gCarousel from '../g/g-carousel.js'

function tab({id, isCarousel, display, auto, event}) {
  var tit = $(id).find('.tabTit li')
  var con = $(id).find('.tabCon')
  var e = event || 'mouseover'
  tit.on(e, function () {
    var i = $(this).index()
    var country = $(this).attr('data-carousel')
    $(this).addClass('active').siblings().removeClass('active')
    $(con).eq(i).addClass('active').siblings().removeClass('active')
    if (!isCarousel) return
    gCarousel(id + '-carousel-' + country, display, auto)
    // 销毁carousel
    // $(con).eq(i).siblings().find('.g-carousel').data('plugin_carousel', '')
  })
}

export default tab
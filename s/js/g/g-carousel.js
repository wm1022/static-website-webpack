// 对轮播图方法的封装
import carousel from '../plugin/carousel.js'
function bannerCarousel(id, display, auto) {
  var carousel = $(id)
  carousel.carousel({
    display: display,
    auto: auto,
    onmovestart: function (n) {
      carousel.find('img[data-lazy-img]').attr('src', function () {
        var src = $(this).attr('data-lazy-img')
        $(this).removeAttr('data-lazy-img')
        return src
      })
    }
  })
}

export default bannerCarousel
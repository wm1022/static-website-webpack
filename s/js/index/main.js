import '../../css/index/main.less'
import lazyLoad from '../plugin/lazyload.js'
import toast from '../g/g-toast.js'
import gDialog from '../g/g-dialog.js'
import gValidator from '../g/g-validator.js'
import gCarousel from '../g/g-carousel.js'
import gTab from '../g/g-tab.js'
import gHeader from '../g/g-header.js'

// 弹出-表单验证
gValidator('#J-g-apply-test-form')
// 首页-留学视界-轮播
gCarousel('#J-g-vision-carousel')
// 首页-hero-表单验证
gValidator('#J-index-hero-form')
// 首页-hero-轮播
gCarousel('#J-index-hero-banner')
// 首页-模块-表单验证
gValidator('#J-index-form-form')
// 首页-本研、中学-轮播
gCarousel('#J-index-university-carousel-canada')
gCarousel('#J-index-highschool-carousel-canada')
// 首页-本研、中学-切换
gTab({
  id: '#J-index-university',
  isCarousel: true,
  // event: 'click'
})
gTab({
  id: '#J-index-highschool',
  isCarousel: true,
  // event: 'click'
})
// 首页-导师-切换
gTab({
  id: '#J-index-teacher'
})
// 首页-成功案例-轮播
gCarousel('#J-index-case-carousel-university', 4)
// 首页-成功案例-切换
gTab({
  id: '#J-index-case',
  isCarousel: true,
  display: 4
})
// 首页-资讯-切换
gTab({
  id: '#J-index-news'
})

gDialog.initialize()
$('img[data-lazy-img]').lazyload()

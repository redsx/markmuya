import Muya from '../dist/Muya';
import EmojiPicker from '../dist/EmojiPicker'
import TablePicker from '../dist/TablePicker'
import QuickInsert from '../dist/QuickInsert'
import CodePicker from '../dist/CodePicker'
import ImagePathPicker from '../dist/ImagePathPicker'
import ImageSelector from '../dist/ImageSelector'
import ImageToolbar from '../dist/ImageToolbar'
import Transformer from '../dist/Transformer'
import FormatPicker from '../dist/FormatPicker'
import LinkTools from '../dist/LinkTools'
import FootnoteTool from '../dist/FootnoteTool'
import TableBarTools from '../dist/TableBarTools'
import FrontMenu from '../dist/FrontMenu'

import '../lib/assets/styles/theme.css'
import '../themes/default.css'

console.log('muya: ', FrontMenu);

// table
Muya.use(TablePicker)
// type @ to insert
Muya.use(QuickInsert)
// insert code语言提示
Muya.use(CodePicker)
// emoji
Muya.use(EmojiPicker)
Muya.use(ImagePathPicker)
Muya.use(ImageSelector, {
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    // photoCreatorClick: this.photoCreatorClick
})
// 点击图片后出现toolbar
Muya.use(ImageToolbar)
Muya.use(Transformer)
Muya.use(FormatPicker)
// font menu 是右侧符号点击效果
Muya.use(FrontMenu)
Muya.use(LinkTools, {
    // jumpClick: this.jumpClick
})
Muya.use(FootnoteTool)
Muya.use(TableBarTools)

const container = document.querySelector('#editor')
const muya = new Muya(container)

window.muya = muya

muya.init()

muya.on('json-change', changes => {
  console.log(JSON.stringify(muya.getState(), null, 2))
  console.log(JSON.stringify(changes, null, 2))
})

muya.on('selection-change', changes => {
  const { anchor, focus, path } = changes
  console.log(JSON.stringify([anchor.offset, focus.offset, path]))
})
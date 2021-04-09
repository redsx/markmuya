import Muya from '../lib'
import EmojiPicker from '../lib/ui/emojiPicker'
import TablePicker from '../lib/ui/tablePicker'
import QuickInsert from '../lib/ui/quickInsert'
import CodePicker from '../lib/ui/codePicker'
import ImagePathPicker from '../lib/ui/imagePicker'
import ImageSelector from '../lib/ui/imageSelector'
import ImageToolbar from '../lib/ui/imageToolbar'
import Transformer from '../lib/ui/transformer'
import FormatPicker from '../lib/ui/formatPicker'
import LinkTools from '../lib/ui/linkTools'
import FootnoteTool from '../lib/ui/footnoteTool'
import TableBarTools from '../lib/ui/tableTools'
import FrontMenu from '../lib/ui/frontMenu'

import '../lib/assets/styles/theme.css'
import '../themes/default.css'

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
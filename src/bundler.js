import 'babel-polyfill'
import app from './javascript/app'
import imageUpload from './javascript/imageUpload'
import overflowMenu from './javascript/overflowMenu'

require('./stylesheets/app.scss')

app()
imageUpload()
overflowMenu()

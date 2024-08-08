import { basename, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

/**
 *
 * @param {String | URL} url
 * @returns
 */
const getFileProperties = (url) => {
  const fileName = fileURLToPath(url)
  const dirName = dirname(fileName)
  const baseName = basename(fileName, extname(fileName))

  return {
    fileName,
    dirName,
    baseName
  }
}

export default getFileProperties

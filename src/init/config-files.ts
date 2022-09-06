import path from 'path'
import fs from 'fs'
import { colours } from '../colours'

type ConfigFile = {
  name: string
  altNames?: string[]
}

const files: ConfigFile[] = [
  { name: '.eslintignore' },
  { name: '.editorconfig' },
  { name: '.eslintrc', altNames: ['.eslintrc.js', '.eslintrc.json'] },
  { name: '.gitattributes' },
  { name: '.gitignore' },
  { name: '.prettierrc.js', altNames: ['.prettierrc'] },
  { name: '.prettierignore' },
  { name: 'tsconfig.json' },
]

export enum ExistingFileBehaviour {
  WriteSample = 'sample',
  Skip = 'skip',
  Overwrite = 'overwrite',
}

function getExistingFilePath(workingDirectory: string, file: ConfigFile): string | undefined {
  const outFilePath = path.join(workingDirectory, file.name)
  if (fs.existsSync(outFilePath)) return outFilePath

  return file.altNames?.map((altName) => path.join(workingDirectory, altName)).find((altFilePath) => fs.existsSync(altFilePath))
}

export function configFiles(workingDirectory: string, existingFileBehaviour: ExistingFileBehaviour) {
  for (const file of files) {
    const templatePath = path.join(__dirname, '../../templates', `${file.name}.sample`)
    const outFilePath = path.join(workingDirectory, file.name)
    const existingFilePath = getExistingFilePath(workingDirectory, file)
    const templateData = fs.readFileSync(templatePath, 'utf-8')
    if (existingFilePath && existingFileBehaviour === ExistingFileBehaviour.Skip) {
      console.info(`Skipping existing file ${colours.green(existingFilePath)}`)
      continue
    }
    if (existingFilePath && existingFileBehaviour !== ExistingFileBehaviour.Overwrite) {
      console.info(
        `File ${colours.green(existingFilePath)} already exists, writing contents to ${colours.green(`${file.name}.sample`)} instead.`,
      )
      fs.writeFileSync(path.join(workingDirectory, `${file.name}.sample`), templateData, 'utf-8')
    } else {
      if (existingFilePath && existingFilePath !== outFilePath) {
        console.info(
          `Removing existing file ${colours.yellow(existingFilePath)} as it will be replaced with ${colours.green(outFilePath)})`,
        )
        fs.rmSync(existingFilePath)
      } else {
        console.info(`${existingFilePath ? 'Overwriting' : 'Creating'} file ${colours.green(outFilePath)}`)
      }
      fs.writeFileSync(outFilePath, templateData, 'utf-8')
    }
  }
}

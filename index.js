const path = require('path')
const fs = require('fs')
const { spawn } = require('./lib/spawn.js')
const { which } = require('./lib/which.js')
const defaultConfig = require('./lib/config.js')
const cwd = process.cwd()

async function invokeCMake (cwd, buildDir, defines, configureArgs = [], buildArgs = []) {
  fs.mkdirSync(buildDir, { recursive: true })

  if (process.platform === 'win32') {
    const nmakePath = which('nmake')
    defines.CMAKE_MAKE_PROGRAM = nmakePath ? 'nmake' : 'make'
    const definesArgs = Object.keys(defines).map(k => `-D${k}=${defines[k]}`)
    const cmakeArgs = ['cmake', 
      ...definesArgs,
      ...configureArgs,
      '-G', nmakePath ? 'NMake Makefiles' : 'MinGW Makefiles', path.relative(buildDir, cwd)
    ]
    await spawn('emcmake.bat', cmakeArgs, buildDir)
    await spawn('cmake', ['--build', '.', ...buildArgs], buildDir)
  } else {
    const definesArgs = Object.keys(defines).map(k => `-D${k}=${defines[k]}`)
    const cmakeArgs = ['cmake', 
      ...definesArgs,
      ...configureArgs,
      '-G', 'Unix Makefiles', path.relative(buildDir, cwd)
    ]
    await spawn('emcmake', cmakeArgs, buildDir)
    await spawn('cmake', ['--build', '.', ...buildArgs], buildDir)
  }
}

async function main (config, args = []) {
  if (typeof process.env.EMSDK === 'undefined') {
    throw new Error('Environment variable $EMSDK is not set')
  }
  if (!fs.existsSync(path.join(cwd, 'CMakeLists.txt'))) {
    throw new Error('CMakeLists.txt is not found in current working directory')
  }

  const mergeConfig = {
    ...defaultConfig,
    ...(config || {})
  }

  const mode = mergeConfig.mode

  const cmakeoutdir = path.isAbsolute(mergeConfig.outDir) ? mergeConfig.outDir : path.join(cwd, mergeConfig.outDir)

  let configureArgs = []
  let buildArgs = []

  const index = args.indexOf('--')
  if (index === -1) {
    configureArgs = [...args]
  } else {
    configureArgs = args.slice(0, index)
    buildArgs = args.slice(index + 1)
  }

  await invokeCMake(cwd, cmakeoutdir, {
    ...(mergeConfig.defines || {}),
    ...({
      CMAKE_BUILD_TYPE: mode,
      CMAKE_VERBOSE_MAKEFILE: mergeConfig.verbose ? 'ON' : 'OFF',

      EMBUILD_CMAKE_INCLUDE: path.join(__dirname, 'cmake/options.cmake')
    })
  }, configureArgs, buildArgs)
}

exports.invokeCMake = invokeCMake
exports.main = main

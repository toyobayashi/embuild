const path = require('path')
const fs = require('fs')
const { spawn } = require('./lib/spawn.js')
const { which } = require('./lib/which.js')
const defaultConfig = require('./lib/config.js')
const cwd = process.cwd()

async function invokeCMake (cwd, buildDir, defines) {
  fs.mkdirSync(buildDir, { recursive: true })

  if (process.platform === 'win32') {
    const nmakePath = which('nmake')
    defines.CMAKE_MAKE_PROGRAM = nmakePath ? 'nmake' : 'make'
    const definesArgs = Object.keys(defines).map(k => `-D${k}=${defines[k]}`)
    const cmakeArgs = ['cmake', 
      ...definesArgs,
      '-G', nmakePath ? 'NMake Makefiles' : 'MinGW Makefiles', path.relative(buildDir, cwd)
    ]
    await spawn('emcmake.bat', cmakeArgs, buildDir)
    await spawn('cmake', ['--build', '.'], buildDir)
  } else {
    const definesArgs = Object.keys(defines).map(k => `-D${k}=${defines[k]}`)
    const cmakeArgs = ['cmake', 
      ...definesArgs,
      '-G', 'Unix Makefiles', path.relative(buildDir, cwd)
    ]
    await spawn('emcmake', cmakeArgs, buildDir)
    await spawn('cmake', ['--build', '.'], buildDir)
  }
}

async function main (config) {
  if (!process.env.EMSDK) {
    throw new Error('Set $EMSDK first')
  }
  const mergeConfig = {
    ...defaultConfig,
    ...(config || {})
  }

  const mode = mergeConfig.mode

  const cmakeoutdir = path.join(cwd, mergeConfig.outDir)

  await invokeCMake(cwd, cmakeoutdir, {
    CMAKE_BUILD_TYPE: mode,
    CMAKE_VERBOSE_MAKEFILE: mode === 'Release' ? 'OFF' : 'ON',

    EMBUILD_CMAKE_INCLUDE: path.join(__dirname, 'cmake/options.cmake')
  })
}

exports.invokeCMake = invokeCMake
exports.main = main

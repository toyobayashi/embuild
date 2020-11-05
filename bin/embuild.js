#!/usr/bin/env node

const path = require('path')
const { main } = require('..')
const cwd = process.cwd()

let conf

const confpath = path.join(cwd, 'embuild.config.js')

try {
  conf = require(confpath)
} catch (err) {
  const msg = err.message
  if (msg.indexOf(`Cannot find module '${confpath}'`) === -1) {
    throw err
  } else {
    conf = {}
  }
}

main(conf, process.argv.slice(2)).catch(err => {
  console.error(err)
  process.exit(1)
})

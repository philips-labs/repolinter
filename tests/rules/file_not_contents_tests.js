// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('files_not_contents', () => {
    const fileNotContents = require('../../rules/file-not-contents')
    const mockGit = {
      branchLocal() {
        return { current: 'master' }
      },
      getRemotes() {
        return [{ name: 'origin' }]
      },
      addConfig() {
        return Promise.resolve
      },
      remote() {
        return Promise.resolve
      },
      branch() {
        return { all: ['master'] }
      },
      checkout() {
        return Promise.resolve
      }
    }

    it('returns passes if requested file content do not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        content: 'bar'
      }

      const actual = await fileNotContents(mockfs, ruleopts, mockGit)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: true,
        path: 'README.md'
      })
      expect(actual.targets[0].message).to.contain(ruleopts.content)
    })

    it('returns fails if requested file content exists', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        content: 'foo'
      }

      const actual = await fileNotContents(mockfs, ruleopts, mockGit)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'README.md'
      })
      expect(actual.targets[0].message).to.contain(ruleopts.content)
    })

    it('returns success if success flag enabled but file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        getFileContents() {},
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['READMOI.md'],
        content: 'foo',
        'succeed-on-non-existent': true
      }

      const actual = await fileNotContents(mockfs, ruleopts, mockGit)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('returns success if requested file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        getFileContents() {},
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        content: 'foo'
      }

      const actual = await fileNotContents(mockfs, ruleopts, mockGit)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('should handle broken symlinks', async () => {
      const brokenSymlink = './tests/rules/broken_symlink_for_test'
      const stat = require('fs').lstatSync(brokenSymlink)
      expect(stat.isSymbolicLink()).to.equal(true)
      const fs = new FileSystem(require('path').resolve('.'))

      const ruleopts = {
        globsAll: [brokenSymlink],
        lineCount: 1,
        content: 'something'
      }
      const actual = await fileNotContents(fs, ruleopts, mockGit)
      expect(actual.passed).to.equal(true)
    })

    it('returns passes if requested file contents do not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        contents: ['bar', 'jax']
      }

      const actual = await fileNotContents(mockfs, ruleopts)
      console.log(actual)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(0)
      expect(actual.message).to.equal(
        'Did not find content matching specified patterns'
      )
    })

    it('returns fails if requested file contents exists', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foobar'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        contents: ['foo', 'bar']
      }

      const actual = await fileNotContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(2)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'README.md'
      })
      expect(actual.targets[0].message).to.contain(ruleopts.contents[0])
      expect(actual.targets[1].message).to.contain(ruleopts.contents[1])
    })
  })
})

/**
 * @file page.util spec file
 * @author panyuqi(panyuqi@baidu.com)
 */

import viewport from 'src/viewport'
import {transitionEndEvent, animationEndEvent} from 'src/page/util/feature-detect'
import {scrollTo, handleScrollTo} from 'src/page/util/ease-scroll'
/* eslint-disable no-unused-expressions */
/* globals describe, it, expect, afterEach, sinon */

describe('page.util', function () {
  describe('_isCrossOrigin', function () {
    let isCrossOrigin = window.MIP.viewer._isCrossOrigin

    expect(isCrossOrigin('/')).to.be.false
    expect(isCrossOrigin('/absolute/path')).to.be.false
    expect(isCrossOrigin('./relative/path')).to.be.false

    expect(isCrossOrigin('https://domain/relative/path')).to.be.true

    expect(isCrossOrigin('//relative/path')).to.be.true
    expect(isCrossOrigin(`//${window.location.host}/relative/path`)).to.be.false
  })

  describe('feature-detect', function () {
    it('.transitionEndEvent', function () {
      expect(transitionEndEvent).to.be.equal('transitionend')
    })

    it('.animationEndEvent', function () {
      expect(animationEndEvent).to.be.equal('animationend')
    })
  })

  describe('ease-scroll', function () {
    let spy
    let oriHeight
    this.timeout(3000)

    before(() => {
      oriHeight = document.body.height
      document.body.style.height = '10000px'
      document.body.classList.toggle('mip-i-android-scroll')
    })

    afterEach(function () {
      if (spy && spy.restore) {
        spy.restore()
      }
      document.body.style.height = oriHeight
      document.body.classList.toggle('mip-i-android-scroll')
    })

    it('scroll top', function (done) {
      spy = sinon.stub(viewport, 'setScrollTop')
      spy.returns(true)

      setTimeout(() => {
        scrollTo(200, { duration: 500, scrollTop: 0 }).then(() => {
          done()
        })
      }, 1000)
    })

    it('scroll down', function (done) {
      spy = sinon.stub(viewport, 'setScrollTop')
      spy.returns(true)

      setTimeout(() => {
        scrollTo(200, { duration: 500, scrollTop: 500 }).then(() => {
          done()
        })
      }, 1000)
    })

    it('don not need to scroll', function (done) {
      spy = sinon.stub(viewport, 'setScrollTop')
      spy.returns(true)

      scrollTo(100, { duration: 500, scrollTop: 100 }).then(() => {
        done()
      })
    })
  })
})

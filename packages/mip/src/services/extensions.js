import Services from './services'
import {templates, Deferred, event} from '../util'
import registerMip1Element from '../mip1-polyfill/element'
import registerCustomElement from '../register-element'

const {listen} = event

const UNKNOWN_EXTENSION_ID = 'unknown'

// const LATEST_MIP_VERSION = '2'

export class Extensions {
  /**
   * @param {!Window} win
   */
  constructor (win) {
    /**
     * @private
     * @const
     */
    this.win = win

    /**
     * @private
     * @const
     */
    this.doc = win.document

    /**
     * @type {!Object}
     * @private
     */
    this.extensions = {}

    /**
     * @type {?string}
     * @private
     */
    this.currentExtensionId = null

    /**
     * @private
     * @const
     */
    this.mipdoc = Services.mipdocFor(win)

    /**
     * @private
     * @const
     */
    this.timer = Services.timerFor(win)

    /**
     * Binds methods exposed to `MIP`.
     */
    this.installExtension = this.installExtension.bind(this)
    this.registerElement = this.registerElement.bind(this)
    this.registerService = this.registerService.bind(this)
    this.registerTemplate = this.registerTemplate.bind(this)
  }

  /**
   * Returns or creates extension holder for `extensionId`.
   *
   * @param {string} extensionId of extension.
   * @returns {!Object}
   * @private
   */
  getExtensionHolder (extensionId) {
    let holder = this.extensions[extensionId]

    if (!holder) {
      const extension = {
        elements: {},
        services: {}
      }

      holder = this.extensions[extensionId] = {
        extension,
        elementInstances: [],
        promise: null,
        resolve: null,
        reject: null,
        loaded: null,
        error: null,
        script: null
      }
    }

    return holder
  }

  /**
   * Returns holder for extension which is currently being registered.
   *
   * @returns {!Object}
   * @private
   */
  getCurrentExtensionHolder () {
    return this.getExtensionHolder(this.currentExtensionId || UNKNOWN_EXTENSION_ID)
  }

  /**
   * Creates a script element with specified url.
   *
   * @param {string} url of script.
   * @return {!HTMLScriptElement}
   * @private
   */
  createScript (url) {
    const script = this.doc.createElement('script')

    script.async = true
    script.src = url

    return script
  }

  /**
   * Returns the script url of extension.
   *
   * @param {string} extensionId of extension.
   * @param {string=} version of extension.
   * @returns {string}
   * @private
   */
  /*
  getExtensionScriptUrl (extensionId, version = LATEST_MIP_VERSION) {
    return `https://c.mipcdn.com/static/v${version}/${extensionId}/${extensionId}.js`
  }
  */

  /**
   * Returns the script element of extension or null.
   *
   * @param {string} extensionId of extension.
   * @param {string=} version of extension.
   * @returns {?HTMLScriptElement}
   * @private
   */
  /*
  findExtensionScript (extensionId, version = LATEST_MIP_VERSION) {
    const holder = this.getExtensionHolder(extensionId)

    if (holder.script) {
      return holder.script
    }

    const url = this.getExtensionScriptUrl(extensionId, version)

    holder.script = this.doc.querySelector(`script[src="${url}"]`)

    return holder.script
  }
  */

  /**
   * Creates the missing script element of extension.
   *
   * @param {string} extensionId of extension.
   * @param {string=} version of extension.
   * @returns {!HTMLScriptElement}
   * @private
   */
  /*
  createExtensionScript (extensionId, version = LATEST_MIP_VERSION) {
    return this.createScript(this.getExtensionScriptUrl(extensionId, version))
  }
  */

  /**
   * Appends the extension script in head if there's no existing script element of extension.
   *
   * @param {string} extensionId of extension.
   * @param {string=} version of extension.
   * @private
   */
  /*
  insertExtensionScriptIfNeeded (extensionId, version = LATEST_MIP_VERSION) {
    const holder = this.getExtensionHolder(extensionId)

    if (holder.loaded || holder.error || this.findExtensionScript(extensionId, version)) {
      return
    }

    const script = this.createExtensionScript(extensionId, version)

    this.doc.head.appendChild(script)
    holder.script = script
  }
  */

  /**
   * Returns or creates a promise waiting for extension loaded.
   *
   * @param {!Object} holder of extension.
   * @returns {!Promise<!Object>}
   * @private
   */
  waitFor (holder) {
    if (!holder.promise) {
      if (holder.loaded) {
        holder.promise = Promise.resolve(holder.extension)
      } else if (holder.error) {
        holder.promise = Promise.reject(holder.error)
      } else {
        const {promise, resolve, reject} = new Deferred()

        holder.promise = promise
        holder.resolve = resolve
        holder.reject = reject
      }
    }

    return holder.promise
  }

  /**
   * Returns or creates a promise waiting for extension loaded.
   *
   * @param {string} extensionId of extension.
   * @returns {!Promise<!Object>}
   */
  waitForExtension (extensionId) {
    return this.waitFor(this.getExtensionHolder(extensionId))
  }

  /**
   * Disables `extension.deps` temporarily.
   */
  /**
   * Preloads an extension as a dependency of others.
   *
   * @param {string} extensionId of extension.
   * @returns {!Promise<!Object>}
   */
  /*
  preloadExtension (extensionId) {
    this.insertExtensionScriptIfNeeded(extensionId)

    return this.waitForExtension(extensionId)
  }
  /*

  /**
   * Loads dependencies before the extension itself.
   *
   * @param {!Extension} extension
   * @returns {!Promise<Object>}
   * @private
   */
  /*
  preloadDepsOf (extension) {
    if (Array.isArray(extension.deps)) {
      return Promise.all(extension.deps.map(dep => this.preloadExtension(dep)))
    }

    if (typeof extension.deps === 'string') {
      return this.preloadExtension(extension.deps)
    }

    return Promise.resolve()
  }
  */

  /**
   * Registers an extension in extension holder.
   * An extension factory may include multiple registration methods,
   * such as `registerElement`, `registerService` or `registerTemplate`.
   *
   * @param {string} extensionId of extension.
   * @param {!Function} factory of extension.
   * @param  {...Object} args passed to extension factory.
   * @private
   */
  registerExtension (extensionId, factory, ...args) {
    const holder = this.getExtensionHolder(extensionId)

    try {
      this.currentExtensionId = extensionId
      factory(...args)

      /**
       * This extension needs `mip-vue` service.
       */
      if (
        this.doc.documentElement.hasAttribute('mip-vue') &&
        !Services.getServiceOrNull(this.win, 'mip-vue')
      ) {
        /**
         * Inserts script of `mip-vue` service if needed.
         */
        if (!this.doc.querySelector('script[src*="mip-vue.js"]')) {
          const baseUrl = this.doc.querySelector('script[src*="mip.js"]').src.replace(/\/[^/]+$/, '')

          this.doc.head.appendChild(this.createScript(`${baseUrl}/mip-vue.js`))
        }

        /**
         * Interrupts current registration.
         * Reregisters this extension while `mip-vue` service is loaded.
         */
        Services.getServicePromise(this.win, 'mip-vue')
          .then(() => this.registerExtension(extensionId, factory, ...args))

        return
      }

      /**
       * It still possible that all element instances in current extension call lifecycle `build` synchronously.
       * Executes callback in microtask to make sure all these elements are built.
       */
      this.timer.then(() => this.tryToResolveExtension(holder))
    } catch (err) {
      this.tryToRejectExtension(holder, err)

      throw err
    } finally {
      this.currentExtensionId = null
    }
  }

  /**
   * To see if all elements registered in current extension are built.
   *
   * @param {!Object} holder of extension.
   * @private
   */
  tryToResolveExtension (holder) {
    if (!holder.elementInstances.every(el => el.isBuilt())) {
      return
    }

    holder.elementInstances.length = 0

    holder.loaded = true

    if (holder.resolve) {
      holder.resolve(holder.extension)
    }
  }

  /**
   * An error occurs in registeration of current extension.
   *
   * @param {!Object} holder of extension.
   * @param {Error} error to reject.
   * @private
   */
  tryToRejectExtension (holder, error) {
    holder.error = error

    if (holder.reject) {
      holder.reject(error)
    }
  }

  /**
   * Installs an extension. The same as `MIP.push`.
   *
   * @param {!Object} extension
   * @returns {!Promise<void>}
   */
  installExtension (extension) {
    return Promise.all([
      /**
       * Disables `extension.deps` temporarily.
       */
      // this.preloadDepsOf(extension),
      this.mipdoc.whenBodyAvailable()
    ]).then(
      () => this.registerExtension(extension.name, extension.func, this.win.MIP)
    )
  }

  /**
   * Returns the appropriate registrator for an element.
   * An element implementation could be a class written in native JavaScript or a Vue object.
   * If `element.version === '1'`, then it will fallback to the registration of MIP1 elements.
   *
   * @param {!Object} element contains implementation, css and version.
   * @returns {?function(string, !Function | !Object, string):?HTMLElement[]}
   * @private
   */
  getElementRegistrator (element) {
    if (typeof element.implementation === 'object') {
      const vue = Services.getServiceOrNull(this.win, 'mip-vue')

      this.doc.documentElement.setAttribute('mip-vue', '')

      return vue && vue.registerElement
    }

    if (element.version && element.version.split('.')[0] === '1') {
      return registerMip1Element
    }

    return registerCustomElement
  }

  /**
   * Registers an element in extension currently being registered (by calling `MIP.push`).
   *
   * @param {string} name
   * @param {!Function | !Object} implementation
   * @param {string=} css
   * @param {Object=} options
   */
  registerElement (name, implementation, css, options) {
    const holder = this.getCurrentExtensionHolder()
    const element = {implementation, css}
    const version = options && options.version && '' + options.version

    if (version) {
      element.version = version
    }

    if (!holder.extension.elements[name]) {
      holder.extension.elements[name] = element
    }

    const registrator = this.getElementRegistrator(element)

    if (!registrator) {
      return
    }

    /** @type {?HTMLElement[]} */
    let elementInstances = registrator(name, implementation, css)

    if (elementInstances && elementInstances.length) {
      elementInstances.forEach(el => {
        /**
         * Lifecycle `build` of element instances is probably delayed with `setTimeout`.
         * If they are not, these event listeners would not be registered before they emit events.
         */
        let unlistenBuild = listen(el, 'build', () => {
          this.tryToResolveExtension(holder)
          unlistenBuild()
          unlistenBuildError()
        })
        let unlistenBuildError = listen(el, 'build-error', event => {
          this.tryToRejectExtension(holder, event.detail)
          unlistenBuild()
          unlistenBuildError()
        })
      })
      holder.elementInstances = holder.elementInstances.concat(elementInstances)
    }
  }

  /**
   * Registers a service in extension currently being registered (by calling `MIP.push`).
   * A service in extension is still a class contains some useful functions,
   * it's no conceptual difference with other internal services.
   *
   * @param {string} name
   * @param {!Function} implementation
   */
  registerService (name, implementation) {
    const holder = this.getCurrentExtensionHolder()

    holder.extension.services[name] = {implementation}

    Services.registerService(this.win, name, implementation)
  }

  /**
   * Registers a template in extension currently being registered (by calling `MIP.push`).
   *
   * @param {string} name
   * @param {!Function} implementation
   * @param {Object=} options
   */
  registerTemplate (name, implementation, options) {
    templates.register(name, implementation)
  }
}

/**
 * @param {!Window} win
 */
export function installExtensionsService (win) {
  Services.registerService(win, 'extensions', Extensions)
}

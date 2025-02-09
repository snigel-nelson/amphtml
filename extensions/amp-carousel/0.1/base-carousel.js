import {Keys} from '#core/constants/key-codes';
import {Services} from '#service';
import {isAmp4Email} from '#core/document/format';
import {toggleAttribute} from '#core/dom';

const _CONTROL_HIDE_ATTRIBUTE = 'i-amphtml-carousel-hide-buttons';
const _HAS_CONTROL_CLASS = 'i-amphtml-carousel-has-controls';
/**
 * @abstract
 */
export class BaseCarousel extends AMP.BaseElement {
  /** @override @nocollapse */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLDivElement} */
    this.prevButton_ = null;

    /** @private {?HTMLDivElement} */
    this.nextButton_ = null;

    /** @private {boolean} */
    this.showControls_ = false;
  }

  /** @override */
  buildCallback() {
    const input = Services.inputFor(this.win);
    const doc = /** @type {!Document} */ (this.element.ownerDocument);

    if (isAmp4Email(doc) || this.element.hasAttribute('controls')) {
      this.showControls_ = true;
      this.element.classList.add(_HAS_CONTROL_CLASS);
    } else {
      input.onMouseDetected((mouseDetected) => {
        if (mouseDetected) {
          this.showControls_ = true;
          toggleAttribute(
            this.element,
            _CONTROL_HIDE_ATTRIBUTE,
            !this.showControls_
          );
          this.element.classList.add(_HAS_CONTROL_CLASS);
        }
      }, true);
    }

    this.buildCarousel();
    this.buildButtons();
    this.setupGestures();
    this.setControlsState();
  }

  /**
   * @param {boolean} inViewport
   * @protected
   */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.hintControls();
    }
  }

  /**
   * Builds a carousel button for next/prev.
   * @param {string} className
   * @param {function():void} onInteraction
   * @return {?HTMLDivElement}
   */
  buildButton(className, onInteraction) {
    const button = this.element.ownerDocument.createElement('div');
    button.tabIndex = 0;
    button.classList.add('amp-carousel-button');
    button.classList.add(className);
    button.setAttribute('role', this.buttonsAriaRole());
    button.onkeydown = (event) => {
      if (event.key == Keys.ENTER || event.key == Keys.SPACE) {
        if (!event.defaultPrevented) {
          event.preventDefault();
          onInteraction();
        }
      }
    };
    button.onclick = onInteraction;

    return button;
  }

  /**
   * The ARIA role for the controls. Either `button` or `presentation` based
   * on usage.
   * @return {string}
   * @protected
   */
  buttonsAriaRole() {
    // Subclasses may override.
    return 'button';
  }

  /**
   * Builds the next and previous buttons.
   */
  buildButtons() {
    this.prevButton_ = this.buildButton('amp-carousel-button-prev', () => {
      this.interactionPrev();
    });
    this.element.appendChild(this.prevButton_);

    this.nextButton_ = this.buildButton('amp-carousel-button-next', () => {
      this.interactionNext();
    });
    this.updateButtonTitles();
    this.element.appendChild(this.nextButton_);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /**
   * Subclasses should override this method to build the UI for the carousel.
   * @abstract
   */
  buildCarousel() {
    // Subclasses may override.
  }

  /**
   * Subclasses may override this method to configure gestures for carousel.
   */
  setupGestures() {
    // Subclasses may override.
  }

  /**
   * Calls `goCallback` and any additional work needed to proceed to next
   * desired direction.
   * @param {number} dir -1 or 1
   * @param {boolean} animate
   * @param {boolean=} opt_autoplay
   */
  go(dir, animate, opt_autoplay = false) {
    this.goCallback(dir, animate, opt_autoplay);
  }

  /**
   * Proceeds to the next slide in the desired direction.
   * @param {number} unusedDir -1 or 1
   * @param {boolean} unusedAnimate
   * @param {boolean=} opt_autoplay
   */
  goCallback(unusedDir, unusedAnimate, opt_autoplay) {
    // Subclasses may override.
  }

  /**
   * Sets the previous and next button visual states.
   */
  setControlsState() {
    this.prevButton_.classList.toggle('amp-disabled', !this.hasPrev());
    this.prevButton_.setAttribute('aria-disabled', String(!this.hasPrev()));
    this.nextButton_.classList.toggle('amp-disabled', !this.hasNext());
    this.nextButton_.setAttribute('aria-disabled', String(!this.hasNext()));
    this.prevButton_.tabIndex = this.hasPrev() ? 0 : -1;
    this.nextButton_.tabIndex = this.hasNext() ? 0 : -1;
  }

  /**
   * Shows the controls and then fades them away.
   */
  hintControls() {
    if (this.showControls_) {
      return;
    }
    this.getVsync().mutate(() => {
      const className = 'i-amphtml-carousel-button-start-hint';
      const hideAttribute = 'i-amphtml-carousel-hide-buttons';
      this.element.classList.add(className);
      Services.timerFor(this.win).delay(() => {
        this.mutateElement(() => {
          this.element.classList.remove(className);
          toggleAttribute(this.element, hideAttribute, !this.showControls_);
        });
      }, 4000);
    });
  }

  /**
   * Updates the titles for the next/previous buttons. This should be called
   * by subclasses if they want to update the button labels. The
   * `getNextButtonTitle` and `getPrevButtonTitle` should be overwritten to
   * provide the title values.
   * @protected
   */
  updateButtonTitles() {
    this.nextButton_.title = this.getNextButtonTitle();
    this.prevButton_.title = this.getPrevButtonTitle();
  }

  /**
   * @return {string} The title to use for the next button.
   * @protected
   */
  getNextButtonTitle() {
    return (
      this.element.getAttribute('data-next-button-aria-label') ||
      'Next item in carousel'
    );
  }

  /**
   * @return {string} The title to use for the pevious button.
   * @protected
   */
  getPrevButtonTitle() {
    return (
      this.element.getAttribute('data-prev-button-aria-label') ||
      'Previous item in carousel'
    );
  }

  /** @override */
  unlayoutCallback() {
    return true;
  }

  /**
   * @return {boolean}
   */
  hasPrev() {
    // Subclasses may override.
    return false;
  }

  /**
   * @return {boolean}
   */
  hasNext() {
    // Subclasses may override.
    return false;
  }

  /**
   * Called on user interaction to proceed to the next item/position.
   */
  interactionNext() {
    if (!this.nextButton_.classList.contains('amp-disabled')) {
      this.go(/* dir */ 1, /* animate */ true, /* autoplay */ false);
    }
  }

  /**
   * Called on user interaction to proceed to the previous item/position.
   */
  interactionPrev() {
    if (!this.prevButton_.classList.contains('amp-disabled')) {
      this.go(/* dir */ -1, /* animate */ true, /* autoplay */ false);
    }
  }
}

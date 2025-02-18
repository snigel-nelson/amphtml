import {dev} from '#utils/log';
import {dict} from '#core/types/object';
import {renderAsElement} from './simple-template';

/** @const {string} */
const SPINNER_ACTIVE_ATTRIBUTE = 'active';

/** @private @const {!./simple-template.ElementDef} */
const SPINNER = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-spinner',
    'aria-hidden': 'true',
  }),
  children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-spinner-container',
      }),
      children: [
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-spinner-layer',
          }),
          children: [
            {
              tag: 'div',
              attrs: dict({
                'class': 'i-amphtml-story-spinner-circle-clipper left',
              }),
            },
            {
              tag: 'div',
              attrs: dict({
                'class': 'i-amphtml-story-spinner-circle-clipper right',
              }),
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Loading spinner UI element.
 */
export class LoadingSpinner {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @public {?Element} */
    this.root_ = null;

    /** @private {boolean} */
    this.isActive_ = false;
  }

  /**
   * @return {!Element}
   */
  build() {
    if (this.root_) {
      return this.root_;
    }

    this.root_ = renderAsElement(this.doc_, SPINNER);

    return this.getRoot();
  }

  /** @return {!Element} */
  getRoot() {
    return dev().assertElement(this.root_);
  }

  /** @param {boolean} isActive */
  toggle(isActive) {
    if (isActive === this.isActive_) {
      return;
    }
    if (isActive) {
      this.root_.setAttribute(SPINNER_ACTIVE_ATTRIBUTE, '');
      this.root_.setAttribute('aria-hidden', 'false');
    } else {
      this.root_.removeAttribute(SPINNER_ACTIVE_ATTRIBUTE);
      this.root_.setAttribute('aria-hidden', 'true');
    }
    this.isActive_ = isActive;
  }
}

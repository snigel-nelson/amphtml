import {BrowserController, RequestBank} from '#testing/helpers/service';

const t = describes.sandboxed.configure().skipSafari().skipEdge();

t.run('amp-story-affiliate link', {}, () => {
  describes.integration(
    'analytics on click',
    {
      body: `
      <amp-story standalone>
        <amp-story-page id="page-1">
          <amp-story-grid-layer template="vertical">
            <h1>Third Page</h1>
            <a id="blink-1" href="https://amp.dev" role="link" target="_blank" affiliate-link-icon="shopping-cart">
              amp.devamp.devamp.devamp.devamp.devamp.dev
            </a>
          </amp-story-grid-layer>
        </amp-story-page>
      </amp-story>
      <amp-analytics>
        <script type="application/json">
        {
          "requests": {
            "endpoint": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "trackLinkClicks": {
              "on": "click",
              "selector": "[affiliate-link-icon]",
              "request": "endpoint"
            }
          }
        }
        </script>
      </amp-analytics>`,
      extensions: ['amp-story', 'amp-analytics'],
    },
    (env) => {
      let browser;

      beforeEach(function () {
        browser = new BrowserController(env.win);
        return browser.waitForElementLayout('amp-analytics');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it.skip('should not send any analytics event on expand', async () => {
        browser.click('#blink-1');
        browser.click('h1');
        await expect(RequestBank.withdraw()).to.be.rejected;
      });

      it.skip('should not send any analytics event on collapse', async () => {
        browser.click('#blink-1');
        browser.click('h1');
        await expect(RequestBank.withdraw()).to.be.rejected;
      });

      it.skip('should send analytics event on external click', async () => {
        browser.click('#blink-1');
        browser.click('#blink-1');
        const req = await RequestBank.withdraw();
        expect(req.url).to.equal('/');
      });
    }
  );
});

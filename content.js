(() => {
  // Shared selectors
  const FORM_SELECTOR = 'form.js-issue-sidebar-form[aria-label="Select projects"]';
  const WIDGET_SELECTOR = 'collapsible-sidebar-widget[url]:not([open])';

  /**
   * Marks a widget as active/open.
   */
  function activateWidget(widget) {
    widget.classList.add('collapsible-sidebar-widget-active');
    widget.setAttribute('open', '');
    console.log('✅ Activated project widget:', widget);
  }

  /**
   * Loads the widget’s form HTML and injects it—only once, using async/await.
   */
  async function loadWidgetForm(widget) {
    const url = widget.getAttribute('url');
    const container = widget.querySelector('.collapsible-sidebar-widget-content');
    if (!url || !container) return;

    // Skip if already loading or loaded
    const state = container.getAttribute('data-state');
    if (state === 'loading' || state === 'loaded') return;

    // Mark as loading
    container.setAttribute('data-state', 'loading');

    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      container.innerHTML = html;
      container.setAttribute('data-state', 'loaded');
      console.log(`✅ Loaded widget form from ${url}`);

      // Expand it
      activateWidget(widget);
    } catch (err) {
      container.removeAttribute('data-state');
      console.error(`❌ Failed to load widget form from ${url}`, err);
    }
  }

  /**
   * Finds all unopened project widgets under the form and processes them.
   */
  function processProjectWidgets(form) {
    const widgets = form.querySelectorAll(WIDGET_SELECTOR);
    console.log(`🔄 processProjectWidgets found ${widgets.length} unopened widget(s)`);
    widgets.forEach(widget => loadWidgetForm(widget));
  }

  /**
   * Initialization: run once after full load, then observe the form only.
   */
  function init() {
    const form = document.querySelector(FORM_SELECTOR);
    if (!form) return;

    // Initial processing
    processProjectWidgets(form);

    // Observe only the form for new widgets
    const observer = new MutationObserver((_, obs) => {
      if (form.querySelector(WIDGET_SELECTOR)) {
        processProjectWidgets(form);
      } else {
        obs.disconnect();
      }
    });

    observer.observe(form, { childList: true, subtree: true });
  }

  // Wait for full load of HTML, CSS, images, etc.
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();

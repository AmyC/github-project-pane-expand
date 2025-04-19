(() => {
  /**
   * 1) Marks a widget as active/open.
   */
  function activateWidget(widget) {
    if (!widget.classList.contains('collapsible-sidebar-widget-active')) {
      widget.classList.add('collapsible-sidebar-widget-active');
      widget.setAttribute('open', '');
      console.log('✅ Activated project widget:', widget);
    }
  }

  /**
   * 2) Loads the widget’s form HTML and injects it—only once.
   */
  function loadWidgetForm(widget) {
    const url = widget.getAttribute('url');
    const container = widget.querySelector('.collapsible-sidebar-widget-content');

    // Skip if no URL, no container, already loaded, or already loading
    if (
      !url ||
      !container ||
      container.hasAttribute('data-loaded') ||
      container.hasAttribute('data-loading')
    ) {
      return;
    }

    // Mark as loading so we don’t refetch
    container.setAttribute('data-loading', '');

    fetch(url, { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        container.removeAttribute('data-loading');
        container.setAttribute('data-loaded', '');
        console.log(`✅ Loaded widget form from ${url}`);
        // now expand it
        activateWidget(widget);
      })
      .catch(err => {
        container.removeAttribute('data-loading');
        console.error(`❌ Failed to load widget form from ${url}`, err);
      });
  }

  /**
   * 3) Finds all project widgets under the "Select projects" form,
   *    and kicks off fetch + activate for each.
   */
  function processProjectWidgets(form) {
    const widgets = form.querySelectorAll('collapsible-sidebar-widget[url]');
    console.log(`🔄 processProjectWidgets found ${widgets.length} widget(s)`);
    widgets.forEach(widget => loadWidgetForm(widget));
  }

  /**
   * 4) Initialization: run once and set up an observer on the form only.
   */
  function init() {
    const form = document.querySelector(
      'form.js-issue-sidebar-form[aria-label="Select projects"]'
    );
    if (!form) return;

    // initial pass
    processProjectWidgets(form);

    // observe only the form for additions/removals
    const observer = new MutationObserver((_, obs) => {
      // if there’s still an unloaded widget, re-process
      if (
        form.querySelector(
          'collapsible-sidebar-widget[url] .collapsible-sidebar-widget-content:not([data-loaded])'
        )
      ) {
        processProjectWidgets(form);
      } else {
        obs.disconnect();
      }
    });

    observer.observe(form, { childList: true, subtree: true });
  }

  // run on load (and handle the case where DOM is already ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

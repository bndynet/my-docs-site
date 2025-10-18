import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
    // EVENT_THEME_CHANGE
  window.addEventListener('themeChanged', (event) => {
    console.debug(`🚀 ~ themeChanged:event:`, event)
    // Add your custom logic here
  });
}
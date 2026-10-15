/**
 * Broker Links Loader with Custom Styled Tooltip
 * Dynamically loads and renders broker links from active-broker-list.json
 */

(function() {
  'use strict';

  let tooltip = null;

  /**
   * Loads broker data from JSON file and renders the links
   */
  async function loadBrokers() {
    try {
      const response = await fetch('/active-broker-list.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load broker list: ${response.status}`);
      }

      const brokers = await response.json();
      renderBrokers(brokers);
      initTooltip();
    } catch (error) {
      console.error('Error loading brokers:', error);
      // Fallback: show error message or keep container empty
      const container = document.getElementById('broker-links');
      if (container) {
        container.innerHTML = '<!-- Failed to load broker links -->';
      }
    }
  }

  /**
   * Renders broker links into the DOM
   * @param {Object} brokers - Object containing broker data
   */
  function renderBrokers(brokers) {
    const container = document.getElementById('broker-links');
    
    if (!container) {
      console.error('Broker links container not found');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create and append broker links
    Object.entries(brokers).forEach(([key, broker]) => {
      const link = createBrokerLink(broker);
      container.appendChild(link);
    });
  }

  /**
   * Creates a broker link element
   * @param {Object} broker - Broker data object
   * @returns {HTMLAnchorElement} The created link element
   */
  function createBrokerLink(broker) {
    const link = document.createElement('a');
    
    // Set href
    link.href = broker.url;
    
    // Set target if specified
    if (broker.target) {
      link.target = broker.target;
    }
    
    // Store URL in data attribute for tooltip
    link.setAttribute('data-tooltip-url', broker.url);

    // Set classes
    link.className = 'text-[#082072] electrolize-regular bg-[#D4EBFE] px-4 py-1 rounded-full font-bold uppercase text-sm tracking-wide broker-link-with-tooltip';
    
    // Set text content
    link.textContent = broker.name;
    
    return link;
  }

  /**
   * Initializes the custom tooltip functionality
   */
  function initTooltip() {
    // Create tooltip element
    tooltip = document.createElement('div');
    tooltip.className = 'broker-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      background: linear-gradient(135deg, rgba(15, 62, 195, 0.95), rgba(43, 119, 238, 0.95));
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Electrolize', monospace;
      pointer-events: none;
      z-index: 10000;
      opacity: 0;
      transform: translateY(-5px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(43, 119, 238, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      max-width: 400px;
      word-break: break-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    document.body.appendChild(tooltip);

    // Add event listeners to all broker links
    const container = document.getElementById('broker-links');
    if (!container) return;

    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);
    container.addEventListener('mousemove', handleMouseMove, true);
  }

  /**
   * Handles mouse enter event on broker links
   */
  function handleMouseEnter(e) {
    if (!e.target.classList.contains('broker-link-with-tooltip')) return;

    const url = e.target.getAttribute('data-tooltip-url');
    if (!url || !tooltip) return;

    tooltip.textContent = url;
    positionTooltip(e);

    // Show tooltip with animation
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    });
  }

  /**
   * Handles mouse leave event on broker links
   */
  function handleMouseLeave(e) {
    if (!e.target.classList.contains('broker-link-with-tooltip')) return;
    if (!tooltip) return;

    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(-5px)';
  }

  /**
   * Handles mouse move event to update tooltip position
   */
  function handleMouseMove(e) {
    if (!e.target.classList.contains('broker-link-with-tooltip')) return;
    if (!tooltip || tooltip.style.opacity === '0') return;

    positionTooltip(e);
  }

  /**
   * Positions the tooltip near the cursor
   */
  function positionTooltip(e) {
    if (!tooltip) return;

    const padding = 15;
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = e.clientX + padding;
    let top = e.clientY - tooltipRect.height - padding;

    // Adjust if tooltip goes off-screen to the right
    if (left + tooltipRect.width > window.innerWidth) {
      left = e.clientX - tooltipRect.width - padding;
    }

    // Adjust if tooltip goes off-screen at the top
    if (top < 0) {
      top = e.clientY + padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // Load brokers when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBrokers);
  } else {
    // DOM already loaded
    loadBrokers();
  }
})();

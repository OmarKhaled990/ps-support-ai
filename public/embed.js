// public/embed.js
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.PlayStationChatWidget) {
    return;
  }
  
  // Default configuration
  const defaultConfig = {
    apiEndpoint: null, // Will use the host's API
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899',
      companyName: 'PlayStation Support'
    },
    position: 'bottom-right',
    size: 'medium',
    welcomeMessage: '🎮 Welcome to PlayStation Support! How can I help you today?',
    placeholder: 'Ask about your PlayStation issue...',
    hostUrl: 'https://your-domain.com', // Replace with your actual domain
    enableAnalytics: true,
    zIndex: 9999
  };
  
  // Widget class
  class PlayStationChatWidget {
    constructor(userConfig = {}) {
      this.config = { ...defaultConfig, ...userConfig };
      this.isLoaded = false;
      this.iframe = null;
      this.container = null;
      
      this.init();
    }
    
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createWidget());
      } else {
        this.createWidget();
      }
      
      // Listen for messages from iframe
      window.addEventListener('message', (event) => this.handleMessage(event));
    }
    
    createWidget() {
      // Create container
      this.container = document.createElement('div');
      this.container.id = 'playstation-chat-widget-container';
      this.container.style.cssText = this.getContainerStyles();
      
      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.getIframeUrl();
      this.iframe.style.cssText = this.getIframeStyles();
      this.iframe.frameBorder = '0';
      this.iframe.allow = 'microphone';
      
      // Add loading state
      const loader = document.createElement('div');
      loader.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 16px;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid rgba(255,255,255,0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            "></div>
            <div style="font-size: 14px; font-weight: 500;">Loading PlayStation Support...</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      
      this.container.appendChild(loader);
      this.container.appendChild(this.iframe);
      
      // Hide iframe initially
      this.iframe.style.opacity = '0';
      
      // Show iframe when loaded
      this.iframe.onload = () => {
        setTimeout(() => {
          loader.style.display = 'none';
          this.iframe.style.opacity = '1';
          this.isLoaded = true;
          this.sendAnalytics('widget_loaded');
        }, 500);
      };
      
      document.body.appendChild(this.container);
      
      // Add CSS animations
      this.addStylesheet();
    }
    
    getContainerStyles() {
      const position = this.config.position || 'bottom-right';
      const size = this.config.size || 'medium';
      
      const sizes = {
        small: { width: '320px', height: '500px' },
        medium: { width: '384px', height: '600px' },
        large: { width: '448px', height: '700px' }
      };
      
      const positions = {
        'bottom-right': 'bottom: 16px; right: 16px;',
        'bottom-left': 'bottom: 16px; left: 16px;',
        'top-right': 'top: 16px; right: 16px;',
        'top-left': 'top: 16px; left: 16px;'
      };
      
      return `
        position: fixed;
        ${positions[position]}
        width: ${sizes[size].width};
        height: ${sizes[size].height};
        z-index: ${this.config.zIndex};
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
    }
    
    getIframeStyles() {
      return `
        width: 100%;
        height: 100%;
        border-radius: 16px;
        background: white;
        transition: opacity 0.3s ease;
      `;
    }
    
    getIframeUrl() {
      const configParam = encodeURIComponent(JSON.stringify(this.config));
      return `${this.config.hostUrl}/widget?config=${configParam}`;
    }
    
    handleMessage(event) {
      // Verify origin for security
      if (event.origin !== this.config.hostUrl) {
        return;
      }
      
      const { type, data } = event.data || {};
      
      switch (type) {
        case 'playstation-chat-feedback':
          this.sendAnalytics('feedback_given', data);
          break;
        case 'playstation-chat-minimize':
          this.minimize();
          break;
        case 'playstation-chat-resize':
          this.resize(data.width, data.height);
          break;
      }
    }
    
    minimize() {
      if (this.container) {
        this.container.style.transform = 'scale(0.8)';
        this.container.style.opacity = '0.9';
      }
    }
    
    maximize() {
      if (this.container) {
        this.container.style.transform = 'scale(1)';
        this.container.style.opacity = '1';
      }
    }
    
    resize(width, height) {
      if (this.container) {
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
      }
    }
    
    sendAnalytics(event, data = {}) {
      if (!this.config.enableAnalytics) return;
      
      // Send analytics to your endpoint
      fetch(`${this.config.hostUrl}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {}); // Silently fail
    }
    
    addStylesheet() {
      const style = document.createElement('style');
      style.textContent = `
        #playstation-chat-widget-container {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #playstation-chat-widget-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.35);
        }
        
        @media (max-width: 480px) {
          #playstation-chat-widget-container {
            width: calc(100vw - 32px) !important;
            height: calc(100vh - 32px) !important;
            max-width: 384px;
            max-height: 600px;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Public methods
    show() {
      if (this.container) {
        this.container.style.display = 'block';
      }
    }
    
    hide() {
      if (this.container) {
        this.container.style.display = 'none';
      }
    }
    
    destroy() {
      if (this.container) {
        this.container.remove();
        this.container = null;
        this.iframe = null;
      }
    }
    
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      // Reload iframe with new config
      if (this.iframe) {
        this.iframe.src = this.getIframeUrl();
      }
    }
  }
  
  // Auto-initialize with global config
  window.PlayStationChatWidget = PlayStationChatWidget;
  
  // Initialize if config is already available
  if (window.PlayStationChatConfig) {
    new PlayStationChatWidget(window.PlayStationChatConfig);
  }
  
  // Create convenience method for manual initialization
  window.initPlayStationChat = function(config) {
    return new PlayStationChatWidget(config);
  };
  
})();
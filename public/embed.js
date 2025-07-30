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
    hostUrl: 'https://ps-support-4w537ek5p-omar-khalafs-projects.vercel.app',
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
      this.isMinimized = true; // Start minimized as a bubble
      
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
      // Create floating bubble first
      this.createBubble();
    }
    
    createBubble() {
      // Create bubble container
      this.bubbleContainer = document.createElement('div');
      this.bubbleContainer.id = 'playstation-chat-bubble';
      this.bubbleContainer.style.cssText = this.getBubbleStyles();
      
      // Bubble content
      this.bubbleContainer.innerHTML = `
        <div class="bubble-icon">
          <div class="ps-logo">PS</div>
          <div class="notification-dot"></div>
        </div>
        <div class="bubble-text">
          <div class="bubble-title">PlayStation Support</div>
          <div class="bubble-subtitle">Need help? Click to chat!</div>
        </div>
      `;
      
      // Add click handler to open chat
      this.bubbleContainer.addEventListener('click', () => this.openChat());
      
      document.body.appendChild(this.bubbleContainer);
      
      // Add bubble styles
      this.addBubbleStyles();
      
      // Animate bubble in
      setTimeout(() => {
        this.bubbleContainer.style.transform = 'translateY(0) scale(1)';
        this.bubbleContainer.style.opacity = '1';
      }, 500);
    }
    
    getBubbleStyles() {
      const position = this.config.position || 'bottom-right';
      
      const positions = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;'
      };
      
      return `
        position: fixed;
        ${positions[position]}
        width: 280px;
        height: 80px;
        background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
        border-radius: 40px;
        box-shadow: 0 8px 32px rgba(0, 102, 204, 0.3);
        cursor: pointer;
        z-index: ${this.config.zIndex};
        display: flex;
        align-items: center;
        padding: 0 20px;
        gap: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(100px) scale(0.8);
        opacity: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    }
    
    addBubbleStyles() {
      if (document.getElementById('ps-bubble-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'ps-bubble-styles';
      style.textContent = `
        #playstation-chat-bubble:hover {
          transform: translateY(-5px) scale(1.02) !important;
          box-shadow: 0 12px 40px rgba(0, 102, 204, 0.4) !important;
        }
        
        .bubble-icon {
          position: relative;
          flex-shrink: 0;
        }
        
        .ps-logo {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          color: #0066cc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #ff6b35;
          border-radius: 50%;
          border: 3px solid white;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .bubble-text {
          color: white;
          flex: 1;
        }
        
        .bubble-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .bubble-subtitle {
          font-size: 13px;
          opacity: 0.9;
        }
        
        @media (max-width: 480px) {
          #playstation-chat-bubble {
            width: 240px !important;
            height: 70px !important;
            padding: 0 15px !important;
          }
          
          .ps-logo {
            width: 40px !important;
            height: 40px !important;
            font-size: 14px !important;
          }
          
          .bubble-title {
            font-size: 14px !important;
          }
          
          .bubble-subtitle {
            font-size: 12px !important;
          }
        }
        
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 384px;
          height: 600px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: ${this.config.zIndex + 1};
          background: white;
          transform: translateY(100%) scale(0.8);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .chat-widget-container.open {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        
        .chat-widget-container iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 16px;
        }
        
        @media (max-width: 480px) {
          .chat-widget-container {
            width: calc(100vw - 20px) !important;
            height: calc(100vh - 40px) !important;
            bottom: 10px !important;
            right: 10px !important;
            left: 10px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    openChat() {
      // Hide bubble
      this.bubbleContainer.style.display = 'none';
      
      // Create chat iframe if it doesn't exist
      if (!this.container) {
        this.createChatWidget();
      } else {
        // Show existing chat
        this.container.classList.add('open');
      }
      
      this.isMinimized = false;
      this.sendAnalytics('chat_opened');
    }
    
    createChatWidget() {
      // Create container
      this.container = document.createElement('div');
      this.container.className = 'chat-widget-container';
      
      // Create iframe
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.getIframeUrl();
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
          background: linear-gradient(135deg, #0066cc, #004499);
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
      
      // Trigger open animation
      setTimeout(() => {
        this.container.classList.add('open');
      }, 100);
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
        case 'playstation-chat-close':
          this.close();
          break;
      }
    }
    
    minimize() {
      if (this.container) {
        this.container.classList.remove('open');
        setTimeout(() => {
          this.bubbleContainer.style.display = 'flex';
        }, 400);
      }
      this.isMinimized = true;
    }
    
    close() {
      this.minimize();
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
    
    // Public methods
    show() {
      if (this.bubbleContainer) {
        this.bubbleContainer.style.display = 'flex';
      }
    }
    
    hide() {
      if (this.bubbleContainer) {
        this.bubbleContainer.style.display = 'none';
      }
      if (this.container) {
        this.container.classList.remove('open');
      }
    }
    
    destroy() {
      if (this.bubbleContainer) {
        this.bubbleContainer.remove();
      }
      if (this.container) {
        this.container.remove();
      }
      this.bubbleContainer = null;
      this.container = null;
      this.iframe = null;
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
  
  // Auto-initialize with default config if no config provided
  setTimeout(() => {
    if (!window.PlayStationChatWidget.instance) {
      window.PlayStationChatWidget.instance = new PlayStationChatWidget();
    }
  }, 1000);
  
})();
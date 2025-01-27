<!-- OKXConnect.vue -->
<template>
    <div class="okx-connect mt-12">
      <!-- Telegram User Info (if available) -->
      <div v-if="telegramUser" class="telegram-info">
        <img 
          :src="telegramUser.photo_url" 
          alt="Profile" 
          class="telegram-avatar"
          v-if="telegramUser.photo_url"
        >
        <span class="telegram-name">{{ telegramUser.username || telegramUser.first_name }}</span>
      </div>
  
      <!-- Connect Button -->
      <div v-if="!isConnected" class="connect-section mt-8">
        <button 
          @click="connectWallet"
          :disabled="isConnecting"
          class="connect-button"
        >
          <img 
            src="@/assets/images/okx.png" 
            alt="OKX Logo" 
            class="okx-logo"
            width="24" 
            height="24" 
          />
          {{ isConnecting ? 'Connecting...' : 'Connect OKX Wallet' }}
        </button>
        
        <!-- Error Message -->
        <div v-if="error" class="mx-auto">
          <p class="text-danger text-error">{{ error }}</p>
          <a 
            v-if="error.includes('install')"
            href="https://www.okx.com/web3"
            target="_blank"
            rel="noopener noreferrer"
            class="install-link text-center"
          >
            Install Wallet
          </a>
        </div>
      </div>
  
      <!-- Connected State -->
      <div v-else class="connected-state">
        <div class="wallet-info">
          <img 
            src="@/assets/images/okx.png" 
            alt="OKX Logo" 
            class="okx-logo-sm"
            width="20" 
            height="20" 
          />
          <span class="address">{{ truncatedAddress }}</span>
        </div>
        <button @click="disconnectWallet" class="disconnect-button">
          Disconnect
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { useWebApp } from 'vue-tg'
  
  export default {
    name: 'OKXConnect',
    data() {
      return {
        isConnected: false,
        isConnecting: false,
        address: '',
        error: '',
        chainId: '',
        telegramUser: null,
        isTelegramApp: false
      }
    },
    computed: {
      truncatedAddress() {
        if (!this.address) return ''
        return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`
      }
    },
    methods: {
      checkWalletInstalled() {
        if (typeof window === 'undefined') return false
        return Boolean(window.okxwallet)
      },
      async initTelegramData() {
        try {
          const webApp = useWebApp()
          if (webApp) {
            this.isTelegramApp = true
            // Get user data if available
            if (webApp.initData && webApp.initDataUnsafe.user) {
              this.telegramUser = webApp.initDataUnsafe.user
              // Emit telegram user data
              this.$emit('telegram-user', this.telegramUser)
            }
          }
        } catch (err) {
          console.log('Not in Telegram environment')
          this.isTelegramApp = false
        }
      },
      async connectWallet() {
        try {
          this.isConnecting = true
          this.error = ''
  
          if (!this.checkWalletInstalled()) {
            this.error = 'OKX Wallet not found. Please install OKX Wallet first.'
            return
          }
  
          // Request connection
          const accounts = await window.okxwallet.ton.connect()
          
          if (accounts && accounts.length > 0) {
            this.address = accounts[0]
            this.isConnected = true
            
            // Get chain ID
            const chainId = await window.okxwallet.ton.request({
              method: 'eth_chainId'
            })
            this.chainId = chainId
  
            // Emit connected event with additional telegram data if available
            this.$emit('wallet-connected', {
              address: this.address,
              chainId: this.chainId,
              telegramUser: this.telegramUser
            })
          } else {
            this.error = 'No accounts found. Please try again.'
          }
        } catch (err) {
          this.error = err.message || 'Failed to connect wallet'
          console.error('Wallet connection error:', err)
        } finally {
          this.isConnecting = false
        }
      },
      disconnectWallet() {
        this.isConnected = false
        this.address = ''
        this.chainId = ''
        this.error = ''
        
        // Emit disconnected event
        this.$emit('wallet-disconnected')
      },
      handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
          this.disconnectWallet()
        } else if (accounts[0] !== this.address) {
          this.address = accounts[0]
          
          // Emit account changed event with telegram data if available
          this.$emit('account-changed', {
            address: this.address,
            telegramUser: this.telegramUser
          })
        }
      },
      handleChainChanged(chainId) {
        this.chainId = chainId
        // Emit chain changed event
        this.$emit('chain-changed', chainId)
      }
    },
    async mounted() {
      // Initialize Telegram data if available
      await this.initTelegramData()
      
      if (this.checkWalletInstalled()) {
        // Set up event listeners
        window.okxwallet.ton.on('accountsChanged', this.handleAccountsChanged)
        window.okxwallet.ton.on('chainChanged', this.handleChainChanged)
      }
    },
    beforeDestroy() {
      if (this.checkWalletInstalled()) {
        // Clean up event listeners
        window.okxwallet.ton.removeListener('accountsChanged', this.handleAccountsChanged)
        window.okxwallet.ton.removeListener('chainChanged', this.handleChainChanged)
      }
    }
  }
  </script>
  
  <style scoped>
  .okx-connect {
    font-family: sans-serif;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .telegram-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 8px;

    border-radius: 8px;
  }
  
  .telegram-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .telegram-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .connect-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .connect-button {
    background-color: #000;
    border:1px solid #ddd;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }
  

  
  .connect-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  

  .okx-logo-sm {
    filter: none; /* Original logo color for connected state */
  }
  
  .error-message {
    color: #ff4d4f;
    font-size: 14px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  

  
  .install-link:hover {
    text-decoration: underline;
  }
  
  .connected-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 8px;
  }
  
  .wallet-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .address {
    font-family: monospace;
    font-size: 16px;
  }
  
  .disconnect-button {
    background-color: transparent;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .disconnect-button:hover {
    
  }
  </style>
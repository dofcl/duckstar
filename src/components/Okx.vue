<!-- OKXConnect.vue -->
<template>
    <div class="okx-connect">
      <!-- Connect Button -->
      <div v-if="!isConnected" class="connect-section">
        <button 
          @click="connectWallet"
          :disabled="isConnecting"
          class="connect-button"
        >
          {{ isConnecting ? 'Connecting...' : 'Connect OKX Wallet' }}
        </button>
        
        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
          <a 
            v-if="error.includes('install')"
            href="https://www.okx.com"
            target="_blank"
            rel="noopener noreferrer"
            class="install-link"
          >
            Install Wallet
          </a>
        </div>
      </div>
  
      <!-- Connected State -->
      <div v-else class="connected-state">
        <span class="address">{{ truncatedAddress }}</span>
        <button @click="disconnectWallet" class="disconnect-button">
          Disconnect
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OKXConnect',
    data() {
      return {
        isConnected: false,
        isConnecting: false,
        address: '',
        error: '',
        chainId: '',
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
  
            // Emit connected event
            this.$emit('wallet-connected', {
              address: this.address,
              chainId: this.chainId
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
          
          // Emit account changed event
          this.$emit('account-changed', this.address)
        }
      },
      handleChainChanged(chainId) {
        this.chainId = chainId
        // Emit chain changed event
        this.$emit('chain-changed', chainId)
      }
    },
    mounted() {
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
  
  .connect-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .connect-button {
    background-color: #1677ff;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  
  .connect-button:hover {
    background-color: #4096ff;
  }
  
  .connect-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #ff4d4f;
    font-size: 14px;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .install-link {
    color: #1677ff;
    text-decoration: none;
  }
  
  .install-link:hover {
    text-decoration: underline;
  }
  
  .connected-state {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 8px;
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
    background-color: #fff1f0;
  }
  </style>
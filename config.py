"""Configuration management for AI Profit Automation System"""

import os
from dotenv import load_dotenv
from typing import Dict, Any
import json

load_dotenv()

class Config:
    """Central configuration class"""
    
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
    
    # Trading Configuration
    BINANCE_API_KEY = os.getenv('BINANCE_API_KEY', '')
    BINANCE_SECRET_KEY = os.getenv('BINANCE_SECRET_KEY', '')
    ALPACA_API_KEY = os.getenv('ALPACA_API_KEY', '')
    ALPACA_SECRET_KEY = os.getenv('ALPACA_SECRET_KEY', '')
    
    # Trading Parameters
    TRADING_PAIRS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
    RISK_PER_TRADE = 0.02  # 2% risk per trade
    MAX_POSITIONS = 5
    STOP_LOSS_PERCENTAGE = 0.03  # 3% stop loss
    TAKE_PROFIT_PERCENTAGE = 0.06  # 6% take profit
    
    # Database
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # Notifications
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    DISCORD_WEBHOOK_URL = os.getenv('DISCORD_WEBHOOK_URL', '')
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')
    
    # Content Generation
    CONTENT_TOPICS = [
        'cryptocurrency', 'stock trading', 'AI technology',
        'passive income', 'online business', 'investing'
    ]
    
    # Arbitrage Settings
    ARBITRAGE_MIN_PROFIT = 0.005  # 0.5% minimum profit
    ARBITRAGE_EXCHANGES = ['binance', 'coinbase', 'kraken']
    
    # System Settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    TIMEZONE = 'UTC'
    UPDATE_INTERVAL = 60  # seconds
    
    @classmethod
    def get_trading_config(cls) -> Dict[str, Any]:
        """Get trading configuration"""
        return {
            'pairs': cls.TRADING_PAIRS,
            'risk_per_trade': cls.RISK_PER_TRADE,
            'max_positions': cls.MAX_POSITIONS,
            'stop_loss': cls.STOP_LOSS_PERCENTAGE,
            'take_profit': cls.TAKE_PROFIT_PERCENTAGE
        }
    
    @classmethod
    def validate(cls) -> bool:
        """Validate configuration"""
        required = ['OPENAI_API_KEY', 'BINANCE_API_KEY']
        for key in required:
            if not getattr(cls, key):
                print(f"Warning: {key} is not set")
                return False
        return True
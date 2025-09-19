"""AI-Powered Cryptocurrency Trading Bot"""

import ccxt
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio
import json
from typing import Dict, List, Tuple, Optional
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import talib
import yfinance as yf
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AITradingBot:
    """Advanced AI trading bot with multiple strategies"""
    
    def __init__(self):
        self.config = Config()
        self.exchange = None
        self.model = None
        self.scaler = StandardScaler()
        self.positions = {}
        self.performance_history = []
        self.initialize_exchange()
        
    def initialize_exchange(self):
        """Initialize cryptocurrency exchange"""
        try:
            self.exchange = ccxt.binance({
                'apiKey': self.config.BINANCE_API_KEY,
                'secret': self.config.BINANCE_SECRET_KEY,
                'enableRateLimit': True,
                'options': {'defaultType': 'spot'}
            })
            # Use testnet for safety
            self.exchange.set_sandbox_mode(True)
            logger.info("Exchange initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize exchange: {e}")
    
    def fetch_market_data(self, symbol: str, timeframe: str = '1h', limit: int = 500) -> pd.DataFrame:
        """Fetch OHLCV data from exchange"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('timestamp', inplace=True)
            return df
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return pd.DataFrame()
    
    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators for AI model"""
        # Moving averages
        df['sma_20'] = talib.SMA(df['close'], timeperiod=20)
        df['sma_50'] = talib.SMA(df['close'], timeperiod=50)
        df['ema_12'] = talib.EMA(df['close'], timeperiod=12)
        df['ema_26'] = talib.EMA(df['close'], timeperiod=26)
        
        # MACD
        df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
        
        # RSI
        df['rsi'] = talib.RSI(df['close'], timeperiod=14)
        
        # Bollinger Bands
        df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(df['close'])
        
        # Volume indicators
        df['obv'] = talib.OBV(df['close'], df['volume'])
        df['ad'] = talib.AD(df['high'], df['low'], df['close'], df['volume'])
        
        # Volatility
        df['atr'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
        
        # Pattern recognition
        df['cdl_doji'] = talib.CDLDOJI(df['open'], df['high'], df['low'], df['close'])
        df['cdl_hammer'] = talib.CDLHAMMER(df['open'], df['high'], df['low'], df['close'])
        
        # Price features
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['volatility'] = df['returns'].rolling(window=20).std()
        
        # Support and Resistance
        df['resistance'] = df['high'].rolling(window=20).max()
        df['support'] = df['low'].rolling(window=20).min()
        
        return df.dropna()
    
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for ML model"""
        feature_columns = [
            'open', 'high', 'low', 'close', 'volume',
            'sma_20', 'sma_50', 'ema_12', 'ema_26',
            'macd', 'macd_signal', 'macd_hist',
            'rsi', 'bb_upper', 'bb_middle', 'bb_lower',
            'obv', 'ad', 'atr', 'returns', 'volatility'
        ]
        
        features = df[feature_columns].values
        return self.scaler.fit_transform(features)
    
    def train_model(self, symbol: str):
        """Train AI model for price prediction"""
        logger.info(f"Training model for {symbol}")
        
        # Fetch historical data
        df = self.fetch_market_data(symbol, '1h', 1000)
        if df.empty:
            return
        
        # Calculate indicators
        df = self.calculate_technical_indicators(df)
        
        # Prepare features and target
        X = self.prepare_features(df[:-1])
        y = df['close'].shift(-1).dropna().values
        
        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Split data
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Fit model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        score = self.model.score(X_test, y_test)
        logger.info(f"Model R² score: {score:.4f}")
    
    def predict_price(self, symbol: str) -> Tuple[float, float]:
        """Predict next price movement"""
        if not self.model:
            self.train_model(symbol)
        
        # Get latest data
        df = self.fetch_market_data(symbol, '1h', 100)
        df = self.calculate_technical_indicators(df)
        
        # Prepare features
        X = self.prepare_features(df.iloc[-1:])
        
        # Predict
        predicted_price = self.model.predict(X)[0]
        current_price = df['close'].iloc[-1]
        
        return predicted_price, current_price
    
    def calculate_position_size(self, balance: float, risk_per_trade: float, stop_loss: float) -> float:
        """Calculate position size based on risk management"""
        risk_amount = balance * risk_per_trade
        position_size = risk_amount / stop_loss
        return position_size
    
    def generate_signals(self, symbol: str) -> Dict[str, Any]:
        """Generate trading signals using AI and technical analysis"""
        df = self.fetch_market_data(symbol, '15m', 100)
        df = self.calculate_technical_indicators(df)
        
        signals = {
            'symbol': symbol,
            'timestamp': datetime.now(),
            'action': 'HOLD',
            'strength': 0,
            'reasons': []
        }
        
        # AI Prediction
        predicted_price, current_price = self.predict_price(symbol)
        price_change_pct = (predicted_price - current_price) / current_price
        
        # Technical signals
        last_row = df.iloc[-1]
        
        # RSI Signal
        if last_row['rsi'] < 30:
            signals['action'] = 'BUY'
            signals['strength'] += 2
            signals['reasons'].append('RSI oversold')
        elif last_row['rsi'] > 70:
            signals['action'] = 'SELL'
            signals['strength'] += 2
            signals['reasons'].append('RSI overbought')
        
        # MACD Signal
        if last_row['macd'] > last_row['macd_signal']:
            if signals['action'] != 'SELL':
                signals['action'] = 'BUY'
                signals['strength'] += 1
                signals['reasons'].append('MACD bullish crossover')
        elif last_row['macd'] < last_row['macd_signal']:
            if signals['action'] != 'BUY':
                signals['action'] = 'SELL'
                signals['strength'] += 1
                signals['reasons'].append('MACD bearish crossover')
        
        # AI Signal
        if price_change_pct > 0.02:  # 2% predicted increase
            if signals['action'] != 'SELL':
                signals['action'] = 'BUY'
                signals['strength'] += 3
                signals['reasons'].append(f'AI predicts {price_change_pct:.2%} increase')
        elif price_change_pct < -0.02:  # 2% predicted decrease
            if signals['action'] != 'BUY':
                signals['action'] = 'SELL'
                signals['strength'] += 3
                signals['reasons'].append(f'AI predicts {price_change_pct:.2%} decrease')
        
        # Bollinger Bands
        if last_row['close'] < last_row['bb_lower']:
            if signals['action'] != 'SELL':
                signals['action'] = 'BUY'
                signals['strength'] += 1
                signals['reasons'].append('Price below lower Bollinger Band')
        elif last_row['close'] > last_row['bb_upper']:
            if signals['action'] != 'BUY':
                signals['action'] = 'SELL'
                signals['strength'] += 1
                signals['reasons'].append('Price above upper Bollinger Band')
        
        return signals
    
    async def execute_trade(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Execute trade based on signal"""
        try:
            symbol = signal['symbol']
            action = signal['action']
            
            if action == 'HOLD':
                return {'status': 'no_action', 'reason': 'Hold signal'}
            
            # Get account balance
            balance = self.exchange.fetch_balance()
            usdt_balance = balance['USDT']['free']
            
            if usdt_balance < 10:  # Minimum trade amount
                return {'status': 'insufficient_funds', 'balance': usdt_balance}
            
            # Calculate position size
            position_size = self.calculate_position_size(
                usdt_balance,
                self.config.RISK_PER_TRADE,
                self.config.STOP_LOSS_PERCENTAGE
            )
            
            # Get current price
            ticker = self.exchange.fetch_ticker(symbol)
            current_price = ticker['last']
            
            # Calculate order amount
            amount = min(position_size / current_price, usdt_balance * 0.95 / current_price)
            
            # Place order
            if action == 'BUY':
                order = self.exchange.create_market_buy_order(symbol, amount)
                
                # Set stop loss and take profit
                stop_loss_price = current_price * (1 - self.config.STOP_LOSS_PERCENTAGE)
                take_profit_price = current_price * (1 + self.config.TAKE_PROFIT_PERCENTAGE)
                
                self.positions[symbol] = {
                    'entry_price': current_price,
                    'amount': amount,
                    'stop_loss': stop_loss_price,
                    'take_profit': take_profit_price,
                    'timestamp': datetime.now()
                }
                
                return {
                    'status': 'success',
                    'action': 'BUY',
                    'symbol': symbol,
                    'amount': amount,
                    'price': current_price,
                    'order_id': order['id']
                }
                
            elif action == 'SELL' and symbol in self.positions:
                position = self.positions[symbol]
                order = self.exchange.create_market_sell_order(symbol, position['amount'])
                
                # Calculate profit
                profit = (current_price - position['entry_price']) * position['amount']
                profit_pct = (current_price - position['entry_price']) / position['entry_price'] * 100
                
                # Remove position
                del self.positions[symbol]
                
                return {
                    'status': 'success',
                    'action': 'SELL',
                    'symbol': symbol,
                    'amount': position['amount'],
                    'price': current_price,
                    'profit': profit,
                    'profit_pct': profit_pct,
                    'order_id': order['id']
                }
            
            return {'status': 'no_position', 'action': action}
            
        except Exception as e:
            logger.error(f"Trade execution error: {e}")
            return {'status': 'error', 'error': str(e)}
    
    async def monitor_positions(self):
        """Monitor open positions for stop loss and take profit"""
        while True:
            try:
                for symbol, position in list(self.positions.items()):
                    ticker = self.exchange.fetch_ticker(symbol)
                    current_price = ticker['last']
                    
                    # Check stop loss
                    if current_price <= position['stop_loss']:
                        logger.info(f"Stop loss triggered for {symbol}")
                        await self.execute_trade({
                            'symbol': symbol,
                            'action': 'SELL',
                            'reason': 'stop_loss'
                        })
                    
                    # Check take profit
                    elif current_price >= position['take_profit']:
                        logger.info(f"Take profit triggered for {symbol}")
                        await self.execute_trade({
                            'symbol': symbol,
                            'action': 'SELL',
                            'reason': 'take_profit'
                        })
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Position monitoring error: {e}")
                await asyncio.sleep(60)
    
    async def run_trading_loop(self):
        """Main trading loop"""
        logger.info("Starting AI Trading Bot")
        
        # Start position monitoring
        asyncio.create_task(self.monitor_positions())
        
        while True:
            try:
                for symbol in self.config.TRADING_PAIRS:
                    # Train/update model periodically
                    if np.random.random() < 0.1:  # 10% chance to retrain
                        self.train_model(symbol)
                    
                    # Generate signals
                    signal = self.generate_signals(symbol)
                    
                    # Log signal
                    logger.info(f"Signal for {symbol}: {signal['action']} "
                              f"(strength: {signal['strength']}, reasons: {signal['reasons']})")
                    
                    # Execute trade if signal is strong enough
                    if signal['strength'] >= 3:
                        result = await self.execute_trade(signal)
                        logger.info(f"Trade result: {result}")
                        
                        # Store performance
                        self.performance_history.append({
                            'timestamp': datetime.now(),
                            'signal': signal,
                            'result': result
                        })
                
                # Wait before next iteration
                await asyncio.sleep(self.config.UPDATE_INTERVAL)
                
            except Exception as e:
                logger.error(f"Trading loop error: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    bot = AITradingBot()
    asyncio.run(bot.run_trading_loop())
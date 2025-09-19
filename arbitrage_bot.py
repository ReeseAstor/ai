"""Arbitrage Opportunity Finder and Executor"""

import asyncio
import ccxt
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import Dict, List, Tuple, Optional
import aiohttp
import json
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArbitrageBot:
    """Find and execute arbitrage opportunities across multiple platforms"""
    
    def __init__(self):
        self.config = Config()
        self.exchanges = {}
        self.opportunities = []
        self.executed_trades = []
        self.initialize_exchanges()
        
    def initialize_exchanges(self):
        """Initialize multiple cryptocurrency exchanges"""
        exchange_configs = {
            'binance': {
                'apiKey': self.config.BINANCE_API_KEY,
                'secret': self.config.BINANCE_SECRET_KEY,
            },
            # Add more exchanges as needed
            'kraken': {},
            'coinbase': {},
            'bitfinex': {},
        }
        
        for exchange_name, config in exchange_configs.items():
            try:
                exchange_class = getattr(ccxt, exchange_name)
                exchange = exchange_class(config)
                exchange.load_markets()
                self.exchanges[exchange_name] = exchange
                logger.info(f"Initialized {exchange_name}")
            except Exception as e:
                logger.error(f"Failed to initialize {exchange_name}: {e}")
    
    async def fetch_prices(self, symbol: str) -> Dict[str, float]:
        """Fetch prices from all exchanges"""
        prices = {}
        
        for exchange_name, exchange in self.exchanges.items():
            try:
                ticker = exchange.fetch_ticker(symbol)
                prices[exchange_name] = {
                    'bid': ticker['bid'],
                    'ask': ticker['ask'],
                    'last': ticker['last'],
                    'volume': ticker['volume']
                }
            except Exception as e:
                logger.debug(f"Error fetching {symbol} from {exchange_name}: {e}")
        
        return prices
    
    def calculate_arbitrage_opportunity(self, prices: Dict[str, Dict]) -> Optional[Dict]:
        """Calculate arbitrage opportunity from price differences"""
        if len(prices) < 2:
            return None
        
        opportunities = []
        
        for buy_exchange, buy_price in prices.items():
            for sell_exchange, sell_price in prices.items():
                if buy_exchange == sell_exchange:
                    continue
                
                buy_cost = buy_price['ask']
                sell_revenue = sell_price['bid']
                
                if buy_cost and sell_revenue and sell_revenue > buy_cost:
                    profit_percentage = ((sell_revenue - buy_cost) / buy_cost) * 100
                    
                    # Account for fees (typically 0.1% per trade)
                    fees = 0.2  # 0.1% buy + 0.1% sell
                    net_profit = profit_percentage - fees
                    
                    if net_profit > self.config.ARBITRAGE_MIN_PROFIT * 100:
                        opportunities.append({
                            'buy_exchange': buy_exchange,
                            'sell_exchange': sell_exchange,
                            'buy_price': buy_cost,
                            'sell_price': sell_revenue,
                            'gross_profit_pct': profit_percentage,
                            'net_profit_pct': net_profit,
                            'timestamp': datetime.now()
                        })
        
        return max(opportunities, key=lambda x: x['net_profit_pct']) if opportunities else None
    
    async def find_crypto_arbitrage(self):
        """Find cryptocurrency arbitrage opportunities"""
        symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT']
        
        while True:
            try:
                for symbol in symbols:
                    prices = await self.fetch_prices(symbol)
                    opportunity = self.calculate_arbitrage_opportunity(prices)
                    
                    if opportunity:
                        opportunity['symbol'] = symbol
                        self.opportunities.append(opportunity)
                        logger.info(f"Arbitrage opportunity found: {symbol}")
                        logger.info(f"Buy on {opportunity['buy_exchange']} at ${opportunity['buy_price']:.2f}")
                        logger.info(f"Sell on {opportunity['sell_exchange']} at ${opportunity['sell_price']:.2f}")
                        logger.info(f"Net profit: {opportunity['net_profit_pct']:.2f}%")
                        
                        # Execute if profitable enough
                        if opportunity['net_profit_pct'] > 1.0:  # 1% threshold
                            await self.execute_arbitrage(opportunity)
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Arbitrage scanning error: {e}")
                await asyncio.sleep(30)
    
    async def execute_arbitrage(self, opportunity: Dict) -> bool:
        """Execute arbitrage trade"""
        try:
            symbol = opportunity['symbol']
            buy_exchange = self.exchanges[opportunity['buy_exchange']]
            sell_exchange = self.exchanges[opportunity['sell_exchange']]
            
            # Get balances
            buy_balance = buy_exchange.fetch_balance()
            sell_balance = sell_exchange.fetch_balance()
            
            # Calculate trade size (conservative approach)
            base_currency = symbol.split('/')[0]
            quote_currency = symbol.split('/')[1]
            
            available_quote = buy_balance[quote_currency]['free']
            available_base = sell_balance[base_currency]['free']
            
            # Determine trade amount (use smaller of the two)
            max_buy_amount = available_quote / opportunity['buy_price']
            trade_amount = min(max_buy_amount, available_base) * 0.95  # 95% to be safe
            
            if trade_amount < 0.001:  # Minimum trade size
                logger.warning("Insufficient balance for arbitrage")
                return False
            
            # Execute trades simultaneously
            buy_task = asyncio.create_task(
                self.place_order(buy_exchange, symbol, 'buy', trade_amount, opportunity['buy_price'])
            )
            sell_task = asyncio.create_task(
                self.place_order(sell_exchange, symbol, 'sell', trade_amount, opportunity['sell_price'])
            )
            
            buy_result, sell_result = await asyncio.gather(buy_task, sell_task)
            
            if buy_result and sell_result:
                profit = (opportunity['sell_price'] - opportunity['buy_price']) * trade_amount
                self.executed_trades.append({
                    'opportunity': opportunity,
                    'trade_amount': trade_amount,
                    'profit': profit,
                    'timestamp': datetime.now()
                })
                
                logger.info(f"Arbitrage executed successfully! Profit: ${profit:.2f}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Arbitrage execution error: {e}")
            return False
    
    async def place_order(self, exchange, symbol: str, side: str, amount: float, price: float) -> bool:
        """Place an order on exchange"""
        try:
            if side == 'buy':
                order = exchange.create_limit_buy_order(symbol, amount, price)
            else:
                order = exchange.create_limit_sell_order(symbol, amount, price)
            
            logger.info(f"Order placed: {side} {amount} {symbol} at {price} on {exchange.name}")
            return True
            
        except Exception as e:
            logger.error(f"Order placement error: {e}")
            return False
    
    async def find_dropshipping_arbitrage(self):
        """Find product arbitrage opportunities between suppliers and marketplaces"""
        # This would integrate with supplier APIs and marketplace APIs
        # Example: AliExpress -> Amazon/eBay arbitrage
        
        suppliers = ['aliexpress', 'alibaba', 'dhgate']
        marketplaces = ['amazon', 'ebay', 'shopify']
        
        while True:
            try:
                # Simulated product search
                products = await self.search_supplier_products()
                
                for product in products:
                    supplier_price = product['price']
                    
                    # Check marketplace prices
                    marketplace_prices = await self.check_marketplace_prices(product['title'])
                    
                    for marketplace, price in marketplace_prices.items():
                        profit_margin = ((price - supplier_price) / supplier_price) * 100
                        
                        if profit_margin > 30:  # 30% minimum margin
                            opportunity = {
                                'product': product['title'],
                                'supplier': product['supplier'],
                                'supplier_price': supplier_price,
                                'marketplace': marketplace,
                                'marketplace_price': price,
                                'profit_margin': profit_margin,
                                'estimated_profit': price - supplier_price,
                                'timestamp': datetime.now()
                            }
                            
                            self.opportunities.append(opportunity)
                            logger.info(f"Dropshipping opportunity: {product['title']}")
                            logger.info(f"Buy at ${supplier_price}, Sell at ${price} ({profit_margin:.1f}% margin)")
                
                await asyncio.sleep(3600)  # Check every hour
                
            except Exception as e:
                logger.error(f"Dropshipping arbitrage error: {e}")
                await asyncio.sleep(1800)
    
    async def search_supplier_products(self) -> List[Dict]:
        """Search for products from suppliers"""
        # Simulated data - would use real APIs in production
        products = [
            {'title': 'Wireless Earbuds Pro', 'price': 15.99, 'supplier': 'aliexpress'},
            {'title': 'Smart Watch Fitness Tracker', 'price': 25.50, 'supplier': 'alibaba'},
            {'title': 'LED Ring Light', 'price': 18.75, 'supplier': 'dhgate'},
            {'title': 'Phone Camera Lens Kit', 'price': 12.99, 'supplier': 'aliexpress'},
            {'title': 'Portable Power Bank 20000mAh', 'price': 22.00, 'supplier': 'alibaba'}
        ]
        return products
    
    async def check_marketplace_prices(self, product_title: str) -> Dict[str, float]:
        """Check product prices on marketplaces"""
        # Simulated data - would use real APIs in production
        base_price = np.random.uniform(30, 100)
        return {
            'amazon': base_price * np.random.uniform(0.9, 1.3),
            'ebay': base_price * np.random.uniform(0.85, 1.25),
            'shopify': base_price * np.random.uniform(0.95, 1.35)
        }
    
    async def find_domain_flipping_opportunities(self):
        """Find valuable domains for flipping"""
        keywords = ['ai', 'crypto', 'nft', 'meta', 'quantum', 'bio', 'green', 'solar']
        tlds = ['.com', '.io', '.ai', '.app', '.dev']
        
        while True:
            try:
                for keyword in keywords:
                    for tld in tlds:
                        domain = f"{keyword}-{np.random.choice(['tech', 'pro', 'hub', 'zone'])}{tld}"
                        
                        # Check domain availability (simulated)
                        is_available = np.random.random() > 0.8
                        
                        if is_available:
                            estimated_value = self.estimate_domain_value(domain)
                            
                            if estimated_value > 100:
                                opportunity = {
                                    'domain': domain,
                                    'registration_cost': 12.99,
                                    'estimated_value': estimated_value,
                                    'profit_potential': estimated_value - 12.99,
                                    'roi_percentage': ((estimated_value - 12.99) / 12.99) * 100,
                                    'timestamp': datetime.now()
                                }
                                
                                self.opportunities.append(opportunity)
                                logger.info(f"Domain opportunity: {domain}")
                                logger.info(f"Estimated value: ${estimated_value:.2f} (ROI: {opportunity['roi_percentage']:.1f}%)")
                
                await asyncio.sleep(7200)  # Check every 2 hours
                
            except Exception as e:
                logger.error(f"Domain flipping error: {e}")
                await asyncio.sleep(3600)
    
    def estimate_domain_value(self, domain: str) -> float:
        """Estimate domain value based on various factors"""
        base_value = 50
        
        # Premium keywords
        if any(kw in domain for kw in ['ai', 'crypto', 'nft']):
            base_value *= 3
        
        # Short domain bonus
        if len(domain.split('.')[0]) < 10:
            base_value *= 1.5
        
        # Premium TLD
        if domain.endswith('.ai') or domain.endswith('.io'):
            base_value *= 2
        
        # Add random market factor
        base_value *= np.random.uniform(0.5, 2.0)
        
        return round(base_value, 2)
    
    async def run_all_arbitrage_bots(self):
        """Run all arbitrage finding bots simultaneously"""
        tasks = [
            self.find_crypto_arbitrage(),
            self.find_dropshipping_arbitrage(),
            self.find_domain_flipping_opportunities()
        ]
        
        await asyncio.gather(*tasks)
    
    def get_opportunity_summary(self) -> Dict[str, Any]:
        """Get summary of all opportunities found"""
        if not self.opportunities:
            return {'message': 'No opportunities found yet'}
        
        crypto_ops = [op for op in self.opportunities if 'symbol' in op]
        dropship_ops = [op for op in self.opportunities if 'product' in op]
        domain_ops = [op for op in self.opportunities if 'domain' in op]
        
        total_potential_profit = sum(
            op.get('profit', 0) or op.get('estimated_profit', 0) or op.get('profit_potential', 0)
            for op in self.opportunities
        )
        
        return {
            'total_opportunities': len(self.opportunities),
            'crypto_arbitrage': len(crypto_ops),
            'dropshipping': len(dropship_ops),
            'domains': len(domain_ops),
            'total_potential_profit': total_potential_profit,
            'best_opportunity': max(self.opportunities, 
                                   key=lambda x: x.get('net_profit_pct', 0) or x.get('profit_margin', 0) or x.get('roi_percentage', 0))
            if self.opportunities else None
        }

if __name__ == "__main__":
    bot = ArbitrageBot()
    asyncio.run(bot.run_all_arbitrage_bots())
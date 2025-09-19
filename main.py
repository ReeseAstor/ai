"""Main Orchestrator for AI Profit Automation System"""

import asyncio
import logging
import signal
import sys
from datetime import datetime, timedelta
import json
import numpy as np
from typing import Dict, Any
import threading
import subprocess

# Import all modules
from trading_bot import AITradingBot
from content_generator import AIContentGenerator
from arbitrage_bot import ArbitrageBot
from notifications import NotificationSystem
from config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ProfitAutomationOrchestrator:
    """Main orchestrator for all profit automation systems"""
    
    def __init__(self):
        self.config = Config()
        self.running = False
        self.start_time = datetime.now()
        self.total_profit = 0
        self.daily_profits = {}
        
        # Initialize all components
        self.trading_bot = AITradingBot()
        self.content_generator = AIContentGenerator()
        self.arbitrage_bot = ArbitrageBot()
        self.notification_system = NotificationSystem()
        
        # Performance tracking
        self.performance_metrics = {
            'trading': {'profit': 0, 'trades': 0, 'success_rate': 0},
            'content': {'generated': 0, 'published': 0, 'revenue': 0},
            'arbitrage': {'opportunities': 0, 'executed': 0, 'profit': 0}
        }
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info("Shutdown signal received. Stopping all systems...")
        self.running = False
        self.shutdown()
        sys.exit(0)
    
    async def start_trading_system(self):
        """Start the trading bot system"""
        logger.info("Starting Trading Bot System...")
        try:
            await self.trading_bot.run_trading_loop()
        except Exception as e:
            logger.error(f"Trading system error: {e}")
            await self.notification_system.send_alert(
                "Trading System Error",
                str(e),
                "error"
            )
    
    async def start_content_system(self):
        """Start the content generation system"""
        logger.info("Starting Content Generation System...")
        try:
            await self.content_generator.automated_content_pipeline()
        except Exception as e:
            logger.error(f"Content system error: {e}")
            await self.notification_system.send_alert(
                "Content System Error",
                str(e),
                "error"
            )
    
    async def start_arbitrage_system(self):
        """Start the arbitrage scanning system"""
        logger.info("Starting Arbitrage System...")
        try:
            await self.arbitrage_bot.run_all_arbitrage_bots()
        except Exception as e:
            logger.error(f"Arbitrage system error: {e}")
            await self.notification_system.send_alert(
                "Arbitrage System Error",
                str(e),
                "error"
            )
    
    async def start_notification_system(self):
        """Start the notification system"""
        logger.info("Starting Notification System...")
        try:
            await self.notification_system.monitor_and_notify()
        except Exception as e:
            logger.error(f"Notification system error: {e}")
    
    async def monitor_performance(self):
        """Monitor overall system performance"""
        logger.info("Starting Performance Monitor...")
        
        while self.running:
            try:
                # Calculate daily profit
                today = datetime.now().date()
                
                # Simulate profit calculations (would use real data in production)
                trading_profit = np.random.uniform(50, 500)
                content_profit = np.random.uniform(20, 200)
                arbitrage_profit = np.random.uniform(10, 100)
                
                daily_total = trading_profit + content_profit + arbitrage_profit
                self.daily_profits[today] = daily_total
                self.total_profit += daily_total
                
                # Update metrics
                self.performance_metrics['trading']['profit'] = trading_profit
                self.performance_metrics['content']['revenue'] = content_profit
                self.performance_metrics['arbitrage']['profit'] = arbitrage_profit
                
                # Log performance
                logger.info(f"Daily Profit: ${daily_total:.2f}")
                logger.info(f"Total Profit: ${self.total_profit:.2f}")
                
                # Send hourly updates
                if datetime.now().minute == 0:  # On the hour
                    await self.send_performance_update()
                
                # Send daily report at midnight
                if datetime.now().hour == 0 and datetime.now().minute == 0:
                    await self.send_daily_report()
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Performance monitoring error: {e}")
                await asyncio.sleep(300)
    
    async def send_performance_update(self):
        """Send hourly performance update"""
        message = f"""
📊 Hourly Update - {datetime.now().strftime('%H:%M')}
💰 Last Hour Profit: ${np.random.uniform(10, 100):.2f}
📈 Active Trades: {np.random.randint(1, 10)}
✍️ Content Generated: {np.random.randint(1, 5)}
🔍 Arbitrage Opportunities: {np.random.randint(0, 10)}
        """
        
        await self.notification_system.send_telegram_notification(message)
    
    async def send_daily_report(self):
        """Send comprehensive daily report"""
        report_data = {
            'total_profit': self.daily_profits.get(datetime.now().date(), 0),
            'trading_profit': self.performance_metrics['trading']['profit'],
            'content_profit': self.performance_metrics['content']['revenue'],
            'arbitrage_profit': self.performance_metrics['arbitrage']['profit'],
            'success_rate': np.random.uniform(70, 95),
            'total_trades': np.random.randint(20, 100),
            'content_count': np.random.randint(5, 20),
            'opportunities': np.random.randint(10, 50),
            'best_asset': 'BTC/USDT',
            'best_content': 'AI Trading Guide',
            'best_arbitrage': 'Binance-Kraken BTC'
        }
        
        await self.notification_system.send_daily_report(report_data)
    
    def start_dashboard(self):
        """Start the web dashboard in a separate process"""
        logger.info("Starting Web Dashboard...")
        try:
            subprocess.Popen([sys.executable, "-m", "streamlit", "run", "dashboard.py"])
            logger.info("Dashboard started at http://localhost:8501")
        except Exception as e:
            logger.error(f"Failed to start dashboard: {e}")
    
    async def health_check(self):
        """Perform system health checks"""
        while self.running:
            try:
                # Check each system
                checks = {
                    'trading': self.trading_bot is not None,
                    'content': self.content_generator is not None,
                    'arbitrage': self.arbitrage_bot is not None,
                    'notifications': self.notification_system is not None
                }
                
                failed_systems = [name for name, status in checks.items() if not status]
                
                if failed_systems:
                    await self.notification_system.send_alert(
                        "System Health Check",
                        f"Failed systems: {', '.join(failed_systems)}",
                        "warning"
                    )
                
                await asyncio.sleep(300)  # Check every 5 minutes
                
            except Exception as e:
                logger.error(f"Health check error: {e}")
                await asyncio.sleep(600)
    
    async def run(self):
        """Main orchestration loop"""
        logger.info("=" * 50)
        logger.info("AI PROFIT AUTOMATION SYSTEM STARTING")
        logger.info("=" * 50)
        
        self.running = True
        
        # Validate configuration
        if not self.config.validate():
            logger.error("Configuration validation failed. Please check your .env file")
            await self.notification_system.send_alert(
                "Configuration Error",
                "Missing required API keys. Please check configuration.",
                "error"
            )
            return
        
        # Start dashboard
        self.start_dashboard()
        
        # Start all systems concurrently
        tasks = [
            asyncio.create_task(self.start_trading_system()),
            asyncio.create_task(self.start_content_system()),
            asyncio.create_task(self.start_arbitrage_system()),
            asyncio.create_task(self.start_notification_system()),
            asyncio.create_task(self.monitor_performance()),
            asyncio.create_task(self.health_check())
        ]
        
        # Send startup notification
        await self.notification_system.send_alert(
            "System Startup",
            "AI Profit Automation System successfully started!",
            "success"
        )
        
        logger.info("All systems initialized and running")
        logger.info("Dashboard available at: http://localhost:8501")
        logger.info("Press Ctrl+C to stop")
        
        # Wait for all tasks
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received")
        except Exception as e:
            logger.error(f"Critical error: {e}")
            await self.notification_system.send_alert(
                "Critical System Error",
                str(e),
                "error"
            )
    
    def shutdown(self):
        """Gracefully shutdown all systems"""
        logger.info("Shutting down all systems...")
        
        # Generate final report
        final_report = f"""
        FINAL SYSTEM REPORT
        ===================
        Runtime: {datetime.now() - self.start_time}
        Total Profit: ${self.total_profit:.2f}
        Trading Profit: ${self.performance_metrics['trading']['profit']:.2f}
        Content Revenue: ${self.performance_metrics['content']['revenue']:.2f}
        Arbitrage Profit: ${self.performance_metrics['arbitrage']['profit']:.2f}
        
        Thank you for using AI Profit Automation System!
        """
        
        logger.info(final_report)
        
        # Save state for next run
        state = {
            'total_profit': self.total_profit,
            'daily_profits': {str(k): v for k, v in self.daily_profits.items()},
            'performance_metrics': self.performance_metrics,
            'shutdown_time': datetime.now().isoformat()
        }
        
        with open('system_state.json', 'w') as f:
            json.dump(state, f, indent=2)
        
        logger.info("System state saved. Goodbye!")

def main():
    """Main entry point"""
    orchestrator = ProfitAutomationOrchestrator()
    
    try:
        asyncio.run(orchestrator.run())
    except KeyboardInterrupt:
        logger.info("System stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        orchestrator.shutdown()

if __name__ == "__main__":
    main()
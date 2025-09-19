"""Notification System for Profit Alerts"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationSystem:
    """Multi-channel notification system for profit alerts"""
    
    def __init__(self):
        self.config = Config()
        self.notification_queue = []
        self.profit_threshold = 100  # Default threshold
        
    async def send_telegram_notification(self, message: str):
        """Send notification via Telegram"""
        try:
            # Would use python-telegram-bot in production
            logger.info(f"Telegram notification: {message}")
            return True
        except Exception as e:
            logger.error(f"Telegram notification error: {e}")
            return False
    
    async def send_discord_notification(self, message: str, webhook_url: str = None):
        """Send notification via Discord webhook"""
        try:
            webhook_url = webhook_url or self.config.DISCORD_WEBHOOK_URL
            # Would use discord webhook API in production
            logger.info(f"Discord notification: {message}")
            return True
        except Exception as e:
            logger.error(f"Discord notification error: {e}")
            return False
    
    async def send_email_notification(self, subject: str, body: str, to_email: str):
        """Send email notification"""
        try:
            # Would use SMTP in production
            logger.info(f"Email notification: {subject} - {body[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Email notification error: {e}")
            return False
    
    async def send_sms_notification(self, message: str, to_phone: str):
        """Send SMS notification via Twilio"""
        try:
            # Would use Twilio API in production
            logger.info(f"SMS notification to {to_phone}: {message}")
            return True
        except Exception as e:
            logger.error(f"SMS notification error: {e}")
            return False
    
    async def notify_trade_executed(self, trade_data: Dict[str, Any]):
        """Notify about executed trade"""
        if trade_data.get('profit', 0) > self.profit_threshold:
            message = f"""
🚀 TRADE EXECUTED
Symbol: {trade_data.get('symbol')}
Action: {trade_data.get('action')}
Profit: ${trade_data.get('profit', 0):.2f}
ROI: {trade_data.get('profit_pct', 0):.2f}%
Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}
            """
            
            await self.send_telegram_notification(message)
            await self.send_discord_notification(message)
    
    async def notify_arbitrage_opportunity(self, opportunity: Dict[str, Any]):
        """Notify about arbitrage opportunity"""
        if opportunity.get('net_profit_pct', 0) > 1.0:
            message = f"""
💰 ARBITRAGE OPPORTUNITY
Type: {opportunity.get('type', 'Unknown')}
Profit: {opportunity.get('net_profit_pct', 0):.2f}%
Details: {opportunity.get('details', 'N/A')}
Action Required: {opportunity.get('action', 'Review')}
            """
            
            await self.send_telegram_notification(message)
            
            if opportunity.get('net_profit_pct', 0) > 3.0:
                # High-value opportunity - send to all channels
                await self.send_discord_notification(message)
                await self.send_email_notification(
                    "High-Value Arbitrage Opportunity",
                    message,
                    "user@example.com"
                )
    
    async def notify_content_published(self, content_data: Dict[str, Any]):
        """Notify about published content"""
        message = f"""
📝 CONTENT PUBLISHED
Topic: {content_data.get('topic')}
Platform: {content_data.get('platform')}
Estimated Revenue: ${content_data.get('estimated_revenue', 0):.2f}
URL: {content_data.get('url', 'N/A')}
            """
            
        await self.send_telegram_notification(message)
    
    async def send_daily_report(self, report_data: Dict[str, Any]):
        """Send daily profit report"""
        message = f"""
📊 DAILY PROFIT REPORT - {datetime.now().strftime('%Y-%m-%d')}

💰 Total Profit: ${report_data.get('total_profit', 0):.2f}
📈 Trading: ${report_data.get('trading_profit', 0):.2f}
✍️ Content: ${report_data.get('content_profit', 0):.2f}
💱 Arbitrage: ${report_data.get('arbitrage_profit', 0):.2f}

🎯 Success Rate: {report_data.get('success_rate', 0):.1f}%
📊 Total Trades: {report_data.get('total_trades', 0)}
📝 Content Generated: {report_data.get('content_count', 0)}
🔍 Opportunities Found: {report_data.get('opportunities', 0)}

Best Performing:
- Asset: {report_data.get('best_asset', 'N/A')}
- Content: {report_data.get('best_content', 'N/A')}
- Arbitrage: {report_data.get('best_arbitrage', 'N/A')}

Keep up the great work! 🚀
            """
        
        # Send to all channels
        await self.send_telegram_notification(message)
        await self.send_discord_notification(message)
        await self.send_email_notification(
            f"Daily Report - ${report_data.get('total_profit', 0):.2f} Profit",
            message,
            "user@example.com"
        )
    
    async def send_alert(self, alert_type: str, message: str, severity: str = "info"):
        """Send general alert"""
        emoji = {"info": "ℹ️", "warning": "⚠️", "error": "🚨", "success": "✅"}
        
        formatted_message = f"""
{emoji.get(severity, 'ℹ️')} {alert_type.upper()}
{message}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}
            """
        
        if severity in ["error", "warning"]:
            # High priority - send to all channels
            await self.send_telegram_notification(formatted_message)
            await self.send_discord_notification(formatted_message)
            
            if severity == "error":
                await self.send_sms_notification(
                    f"URGENT: {alert_type} - {message[:100]}",
                    "+1234567890"
                )
        else:
            # Normal priority
            await self.send_telegram_notification(formatted_message)
    
    async def monitor_and_notify(self):
        """Main notification monitoring loop"""
        logger.info("Starting notification system")
        
        while True:
            try:
                # Process notification queue
                while self.notification_queue:
                    notification = self.notification_queue.pop(0)
                    await self.process_notification(notification)
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Notification monitoring error: {e}")
                await asyncio.sleep(30)
    
    async def process_notification(self, notification: Dict[str, Any]):
        """Process a single notification"""
        notification_type = notification.get('type')
        
        if notification_type == 'trade':
            await self.notify_trade_executed(notification.get('data', {}))
        elif notification_type == 'arbitrage':
            await self.notify_arbitrage_opportunity(notification.get('data', {}))
        elif notification_type == 'content':
            await self.notify_content_published(notification.get('data', {}))
        elif notification_type == 'alert':
            await self.send_alert(
                notification.get('alert_type', 'General'),
                notification.get('message', ''),
                notification.get('severity', 'info')
            )
    
    def add_notification(self, notification_type: str, data: Dict[str, Any]):
        """Add notification to queue"""
        self.notification_queue.append({
            'type': notification_type,
            'data': data,
            'timestamp': datetime.now()
        })

if __name__ == "__main__":
    notifier = NotificationSystem()
    asyncio.run(notifier.monitor_and_notify())
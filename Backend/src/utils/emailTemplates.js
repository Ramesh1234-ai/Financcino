/**
 * Email Templates - HTML email designs for all notification types
 * Production-ready templates with modern design (Stripe/Notion style)
 */

const baseStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background-color: #f7fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #1a202c;
    }
    .stat-box {
      background-color: #f7fafc;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
    }
    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a202c;
    }
    .alert-box {
      background-color: #fff5f5;
      border: 1px solid #feb2b2;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .alert-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .success-box {
      background-color: #f0fff4;
      border: 1px solid #9ae6b4;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 20px;
      border: none;
      cursor: pointer;
    }
    .button:hover {
      opacity: 0.9;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 30px 0;
    }
    .footer {
      background-color: #f7fafc;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #718096;
      border-top: 1px solid #e2e8f0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
    }
    .category-badge {
      display: inline-block;
      background-color: #edf2f7;
      color: #2d3748;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
  </style>
`;

/**
 * Budget Alert Template (75% threshold)
 */
export const budgetAlertTemplate = ({
  userName,
  categoryName,
  spent,
  limit,
  percentage,
  currency = '₹',
}) => {
  const percentageText =
    percentage >= 100 ? 'EXCEEDED' : 'APPROACHING';
  const bgColor = percentage >= 100 ? '#fff5f5' : '#fffaf0';
  const borderColor = percentage >= 100 ? '#feb2b2' : '#fed7d7';
  const emoji = percentage >= 100 ? '🚨' : '⚠️';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${emoji} Budget Alert</h1>
          <p>Your ${categoryName} spending has ${percentageText} the limit</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Your spending in <strong>${categoryName}</strong> has reached <strong>${percentage}%</strong> of your monthly budget.</p>
          
          <div class="alert-box" style="background-color: ${bgColor}; border-color: ${borderColor};">
            <div class="stat-label">Spending Status</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
              <div>
                <div class="stat-label">Spent</div>
                <div class="stat-value">${currency}${spent.toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div class="stat-label">Budget Limit</div>
                <div class="stat-value">${currency}${limit.toLocaleString()}</div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <div style="text-align: right; margin-top: 8px; font-size: 12px; color: #4a5568;">
              ${percentage}% spent
            </div>
          </div>
          
          <p><strong>Recommended Actions:</strong></p>
          <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Review your recent transactions in ${categoryName}</li>
            <li>Consider reducing spending in this category</li>
            <li>Check if any charges are unexpected</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/dashboard" class="button">View Dashboard</a>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you have budget alerts enabled.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/settings/notifications" class="footer-link">Manage Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `🚨 ${categoryName} Budget Alert: ${percentage}% Spent`,
    html,
  };
};

/**
 * Receipt Confirmation Template
 */
export const receiptConfirmationTemplate = ({
  userName,
  merchant,
  amount,
  category,
  currency = '₹',
  date,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Receipt Processed</h1>
          <p>Your receipt has been successfully uploaded and analyzed</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Your receipt from <strong>${merchant}</strong> has been processed and added to your expense tracker.</p>
          
          <div class="success-box">
            <div class="stat-label">Transaction Details</div>
            <div style="margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #c6f6d5;">
                <span style="color: #4a5568;">Merchant</span>
                <strong>${merchant}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #c6f6d5;">
                <span style="color: #4a5568;">Amount</span>
                <strong style="font-size: 18px; color: #667eea;">${currency}${amount.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #c6f6d5;">
                <span style="color: #4a5568;">Category</span>
                <span class="category-badge">${category}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #4a5568;">Date</span>
                <span>${formattedDate}</span>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <p><strong>What's next?</strong></p>
          <ul style="margin-left: 20px; margin-top: 10px;">
            <li>The expense has been added to your ${category} category</li>
            <li>Your budget and analytics are automatically updated</li>
            <li>You can view, edit, or delete this transaction anytime</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/dashboard" class="button">View All Receipts</a>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/settings/notifications" class="footer-link">Manage Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `✅ Receipt Confirmed: ${merchant} - ${currency}${amount.toLocaleString()}`,
    html,
  };
};

/**
 * Weekly Digest Template
 */
export const weeklyDigestTemplate = ({
  userName,
  totalSpent,
  topCategory,
  topCategoryAmount,
  savingsGoal,
  currentSavings,
  transactionCount,
  currency = '₹',
  weekStartDate,
}) => {
  const savingsPercentage = savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;
  const weekEndDate = new Date(new Date(weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000);
  const formattedWeek = `${new Date(weekStartDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${weekEndDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Weekly Summary</h1>
          <p>${formattedWeek}</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Here's a summary of your spending and savings this week:</p>
          
          <div class="stat-box">
            <div class="stat-label">Total Spent</div>
            <div class="stat-value">${currency}${totalSpent.toLocaleString()}</div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Top Spending Category</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span class="category-badge">${topCategory}</span>
              <span class="stat-value" style="font-size: 20px;">${currency}${topCategoryAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="stat-box">
            <div class="stat-label">Transactions</div>
            <div class="stat-value">${transactionCount}</div>
          </div>
          
          ${
            savingsGoal > 0
              ? `
          <div class="stat-box" style="border-left-color: #48bb78;">
            <div class="stat-label">Savings Goal Progress</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
              <div>
                <div class="stat-value" style="font-size: 20px;">${currency}${currentSavings.toLocaleString()}</div>
                <div style="font-size: 12px; color: #718096; margin-top: 4px;">of ${currency}${savingsGoal.toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div class="stat-value" style="font-size: 20px; color: #48bb78;">${savingsPercentage.toFixed(1)}%</div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="background: linear-gradient(90deg, #48bb78 0%, #38a169 100%); width: ${Math.min(savingsPercentage, 100)}%"></div>
            </div>
          </div>
            `
              : ''
          }
          
          <div class="divider"></div>
          
          <p><strong>Quick Tips:</strong></p>
          <ul style="margin-left: 20px; margin-top: 10px;">
            <li>Keep tracking receipts to maintain accurate spending records</li>
            <li>Review your top spending category to find savings opportunities</li>
            <li>Set budgets for categories to control spending</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/dashboard/analytics" class="button">View Detailed Analytics</a>
        </div>
        
        <div class="footer">
          <p>This is your weekly summary email.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/settings/notifications" class="footer-link">Manage Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `📊 Weekly Summary: You spent ${currency}${totalSpent.toLocaleString()} this week`,
    html,
  };
};

/**
 * AI Insight Template
 */
export const aiInsightTemplate = ({
  userName,
  insight,
  category,
  recommendation,
  impact,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💡 AI Insight</h1>
          <p>We found something interesting in your spending patterns</p>
        </div>
        
        <div class="content">
          <p>Hi ${userName},</p>
          
          <div class="success-box">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
              ${insight}
            </div>
            <span class="category-badge">${category}</span>
          </div>
          
          <div style="background-color: #edf2f7; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <div class="stat-label">💬 Recommendation</div>
            <p style="margin-top: 12px; color: #2d3748; font-size: 14px;">
              ${recommendation}
            </p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #48bb78;">
            <div class="stat-label">📈 Potential Impact</div>
            <p style="margin-top: 12px; color: #2d3748; font-size: 14px;">
              ${impact}
            </p>
          </div>
          
          <p><strong>Start optimizing your spending today!</strong></p>
          
          <a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/dashboard/insights" class="button">Explore More Insights</a>
        </div>
        
        <div class="footer">
          <p>Insights are powered by machine learning analysis of your spending patterns.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://kharcha.app'}/settings/notifications" class="footer-link">Manage Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `💡 AI Insight: ${insight.substring(0, 50)}...`,
    html,
  };
};

export default {
  budgetAlertTemplate,
  receiptConfirmationTemplate,
  weeklyDigestTemplate,
  aiInsightTemplate,
};

export const otpEmailHtml = `
        <!doctype html>
<html style='background-color: #FAF5EF;'>
<body style="margin:0; padding:0; background-color:#f5f5f5;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; background-color: #ffffff; padding: 48px 24px; color: #000000; max-width: 480px; margin: 0 auto;">

    <img src="https://assets.madeinvikhroli.com/website-assets/miv-logo-horizontal.png" alt="Made In Vikhroli" width="150" height="32" style="display: inline-block; border: 0; outline: none; text-decoration: none;" />

    <p style="font-size: 13px; color: #666666; margin: 32px 0 16px 0;">Your verification code</p>

    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto; background-color: #111111; border-radius: 8px;">
      <tr>
        <td style="padding: 16px 28px;">
          <span style="font-family: 'SF Mono', 'Roboto Mono', Consolas, Menlo, monospace; font-size: 26px; font-weight: 600; letter-spacing: 6px; color: #ffffff; user-select: all;">{spacedOTP}</span>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #999999; margin: 0 0 56px 0;">
      This code can only be used once. It expires in 2 minutes.
    </p>

    <div style="font-size: 11px; color: #999999; padding-top: 20px; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0 0 8px 0;">&copy; Made In Vikhroli</p>
      <a href="https://madeinvikhroli.com/terms-n-conditions" style="color: #666666; text-decoration: none;">Terms & Conditions</a>
    </div>

  </div>
</body>
</html>
      `;

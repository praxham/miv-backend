export const deliverableEmailHtml = `<!doctype html>
<html style="background-color: #FAF5EF;">
<body style="margin:0; padding:0; background-color:#f5f5f5;">
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; background-color: #ffffff; padding: 48px 24px; color: #000000; max-width: 480px; margin: 0 auto;">

    <img src="https://assets.madeinvikhroli.com/website-assets/miv-logo-horizontal.png" alt="Made In Vikhroli" width="150" height="32" style="display: inline-block; border: 0; outline: none; text-decoration: none;" />

    <h1 style="font-size: 20px; font-weight: 600; color: #111111; margin: 32px 0 16px 0;">Payment Confirmed</h1>

    <p style="font-size: 14px; color: #444444; line-height: 1.6; margin: 0 0 32px 0;">
      Great news! <strong>{artist_username}</strong> has successfully confirmed your payment of <strong>₹{amount}</strong> (UTR: {utr}). Your purchased artifact, "<strong>{artifact_title}</strong>", is now ready for you to download.
    </p>

    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto; background-color: #111111; border-radius: 8px;">
      <tr>
        <td style="padding: 16px 28px; text-align: center;">
          <a href="{artifact_deliverable_url}" style="font-family: 'SF Mono', 'Roboto Mono', Consolas, Menlo, monospace; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block;">
            Download Artifact
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #999999; margin: 0 0 56px 0;">
      You can also access this content anytime by visiting the <a href="https://madeinvikhroli.com/profile/placed-orders" style="color: #666666; text-decoration: underline;">Orders page</a> in your profile.
    </p>

    <div style="font-size: 11px; color: #999999; padding-top: 20px; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0 0 8px 0;">&copy; Made In Vikhroli</p>
      <a href="https://madeinvikhroli.com/terms-n-conditions" style="color: #666666; text-decoration: none;">Terms & Conditions</a>
    </div>

  </div>
</body>
</html>`;

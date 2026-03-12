# Deploy with Custom Domain on Lovable

This guide explains how to deploy your Cyber Sentinel website on Lovable using your own custom domain.

## Prerequisites

- Lovable account (sign up at [lovable.dev](https://lovable.dev))
- Custom domain (purchased from any registrar like GoDaddy, Namecheap, etc.)
- GitHub repository connected to Lovable
- All environment variables configured

## Step 1: Deploy to Lovable

### Connect Your Repository to Lovable

1. Go to [lovable.dev](https://lovable.dev)
2. Click **New Project**
3. Select **Connect GitHub Repository**
4. Choose `cyber-sentinel-notes`
5. Click **Create Project**

Lovable will automatically:
- Build your project with `npm run build`
- Deploy to `https://your-project.lovable.app`
- Enable auto-deploy on every GitHub push

### Configure Environment Variables

In your Lovable Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables:

```
Frontend Variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://your-api-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key

App Configuration:
NODE_ENV=production
VITE_APP_NAME=Cyber Sentinel
```

3. Click **Save**

Your app is now live at: `https://your-project.lovable.app`

---

## Step 2: Add Custom Domain on Lovable

### Configure Domain in Lovable

1. In your Lovable Project Dashboard, go to **Settings** → **Domains**
2. Click **Add Custom Domain**
3. Enter your custom domain (e.g., `yourdomain.com`)
4. Click **Add Domain**

Lovable will provide you with:
- **CNAME record** value (e.g., `cname.lovable.app`)
- **Verification status**

### Configure DNS Records

Go to your domain registrar (GoDaddy, Namecheap, etc.):

1. Open **DNS Settings / DNS Management**
2. Find the **CNAME Records** section
3. Create a new CNAME record:
   ```
   Name: yourdomain.com (or leave blank for root)
   Type: CNAME
   Value: [CNAME value from Lovable]
   TTL: 3600 (or auto)
   ```

4. **For www subdomain** (optional but recommended):
   ```
   Name: www
   Type: CNAME
   Value: [CNAME value from Lovable]
   TTL: 3600
   ```

5. Save the DNS changes

**Note:** DNS changes can take 5-48 hours to propagate globally.

### Verify Domain Connection

In your Lovable Dashboard:

1. Go to **Settings** → **Domains**
2. Check the status of your domain
3. Once verified (checkmark appears):
   - Lovable automatically issues an SSL certificate
   - Your site is accessible at `https://yourdomain.com`

---

## Step 3: Update Backend API URL (if self-hosted)

If you have a backend API running on a separate server:

1. In Lovable **Environment Variables**, update:
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```

2. Or use a backend platform like Vercel:
   ```bash
   cd server
   vercel --prod
   ```

3. Update `VITE_API_URL` in Lovable with your backend URL

---

## Step 4: SSL Certificate (HTTPS)

Lovable automatically provides:
- ✅ Free SSL/TLS certificates (via Cloudflare)
- ✅ Automatic renewal
- ✅ HTTPS on both `yourdomain.com` and `www.yourdomain.com`

**No action needed!** Just wait for DNS propagation.

---

## Step 5: Test Your Deployment

### Test Domain Access

```bash
# Test domain resolution
nslookup yourdomain.com

# Test HTTPS connection
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

### Verify in Browser

1. Visit `https://yourdomain.com`
2. Check browser address bar for 🔒 lock icon
3. Click lock → **Certificate** should show your domain
4. Verify all functionality works

---

## Troubleshooting

### Domain Not Resolving

**Problem:** `ERR_NAME_NOT_RESOLVED` or domain not found

**Solutions:**
1. Check CNAME record is correct in your DNS provider
2. Wait 24-48 hours for DNS propagation
3. Clear local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache

   # Windows (PowerShell as Admin)
   Clear-DnsClientCache

   # Linux
   sudo systemctl restart systemd-resolved
   ```

### SSL Certificate Not Working

**Problem:** `SSL_ERR_BAD_CERT_DOMAIN` or "Not Secure"

**Solutions:**
1. Verify domain is set in Lovable Settings
2. Ensure DNS is pointing to Lovable (check DNS records)
3. Wait for SSL certificate issuance (usually 5-30 minutes)
4. Hard refresh browser (Ctrl+Shift+R)

### Site Returns 404

**Problem:** Domain works but shows Lovable default page

**Solutions:**
1. Verify project is deployed and built successfully
2. Check build logs in Lovable Dashboard
3. Ensure environment variables are set
4. Check `vercel.json` configuration is correct

### Subdomain Issues

**Problem:** Subdomains (api.yourdomain.com) not working

**Solutions:**
1. Create separate CNAME for subdomain:
   ```
   Name: api
   Type: CNAME
   Value: [Your backend provider's CNAME]
   ```
2. Deploy backend to Vercel/Railway/Fly
3. Use their provided domain

---

## Best Practices

### 1. Configure Both Root and WWW

```dns
yourdomain.com     → CNAME → cname.lovable.app
www.yourdomain.com → CNAME → cname.lovable.app
```

### 2. Set Email Forwarding

If your domain uses email:
1. Keep MX records in DNS (don't delete)
2. Lovable only requires CNAME for web hosting
3. Email and web can coexist

### 3. Enable Page Rules (Optional)

In Lovable Settings → Security:
- Enable automatic HTTPS redirect
- Set security headers (already configured in `vercel.json`)

### 4. Monitor Performance

Use Lovable Dashboard:
- **Analytics** → View traffic and performance
- **Logs** → Check for errors
- **Deployments** → Track deployment history

---

## Advanced: Multiple Environments

Deploy to multiple environments:

```
Production:  yourdomain.com     → Lovable
Staging:     staging.yourdomain.com → Lovable (different project)
Development: dev.yourdomain.com → localhost or separate project
```

**Setup:**
1. Create multiple Lovable projects
2. Configure each with different domain
3. Use environment variables for each

---

## Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Lovable project created and connected
- [ ] Environment variables configured in Lovable
- [ ] Domain purchased and accessible
- [ ] CNAME record added to DNS
- [ ] DNS changes propagated (test with `nslookup`)
- [ ] Domain verified in Lovable Settings
- [ ] SSL certificate issued (green lock icon)
- [ ] Site accessible at `https://yourdomain.com`
- [ ] All functionality tested (login, uploads, API calls)
- [ ] Backend API URL configured
- [ ] Analytics/monitoring enabled
- [ ] Email alerts configured (optional)

---

## Support & Resources

### Lovable
- [Lovable Documentation](https://docs.lovable.dev)
- [Lovable Community](https://lovable.dev/discord)

### DNS & Domains
- [DNS Propagation Checker](https://www.whatsmydns.net)
- [SSL Certificate Checker](https://www.sslshopper.com/ssl-checker.html)
- [CNAME Lookup Tool](https://mxtoolbox.com/cname.aspx)

### Domain Registrars Help
- [GoDaddy DNS Setup](https://www.godaddy.com/help)
- [Namecheap DNS Setup](https://www.namecheap.com/support/)
- [Cloudflare DNS](https://www.cloudflare.com/dns/)

---

## Next Steps

After deploying with a custom domain:

1. ✅ [Add your own favicon](./public/FAVICON_INSTRUCTIONS.md)
2. ✅ [Configure email notifications](./DEPLOYMENT.md#monitoring--logs)
3. ✅ [Set up monitoring & analytics](./DEPLOYMENT.md)
4. ✅ [Deploy and scale your backend](#step-3-update-backend-api-url-if-self-hosted)
5. ✅ [Configure backup strategy](#step-4-ssl-certificate-https)

---

**Need more help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete documentation.

---

**Made with ❤️ for Cyber Sentinel**  
**Version**: 1.0.0

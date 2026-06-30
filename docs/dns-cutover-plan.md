# Herbalisti DNS Cutover Plan

Generated: 2026-06-30T19:16:12.162Z

Status: needs-dns-cutover

Reads public DNS records and local launch contracts, then optionally writes docs/dns-cutover-plan files. It does not call Cloudflare APIs, change nameservers, mutate DNS, deploy, create resources, set secrets, call paid APIs, or print secret values.

## Current DNS

- Domain: herbalisti.com
- Nameserver provider: external-or-registrar
- Cloudflare zone ready: false
- Apex record present: true
- CAA ready for Cloudflare certificate: true
- Nameservers: dns1.registrar-servers.com, dns2.registrar-servers.com
- A records: 192.64.119.134
- AAAA records: none observed
- CNAME records: none observed

## Target

- Cloudflare Pages project: herbalisti
- Apex domain: herbalisti.com
- Requirement: For a Cloudflare Pages apex domain, the domain must be a zone in the same Cloudflare account as the Pages project, with nameservers delegated to Cloudflare before custom-domain activation.
- Source: https://developers.cloudflare.com/pages/configuration/custom-domains/

Canonical redirects:

- http://herbalisti.com -> https://herbalisti.com/
- https://www.herbalisti.com -> https://herbalisti.com/

## Checks

- pass: Production contract domain is herbalisti.com.
- pass: Observed 2 nameserver record(s).
- pending: Apex domain is not yet delegated to Cloudflare nameservers.
- pass: No CAA records are present, so no CAA restriction was detected.
- pass: Cloudflare Pages custom-domain source URL is recorded.

## Operator Sequence

### confirm-cloudflare-zone-route

Side effect: approval-required-dns-provider-decision

Use Cloudflare Pages custom-domain setup for the apex domain. Cloudflare documentation says an apex Pages domain must be a Cloudflare zone in the same account as the Pages project.

### delegate-nameservers

Side effect: mutates-public-dns

At the registrar, replace the current nameservers with the two nameservers assigned by Cloudflare for herbalisti.com.

### attach-pages-custom-domain

Side effect: mutates-cloudflare-pages-domain

In Workers & Pages, open the herbalisti Pages project, add herbalisti.com as a custom domain, and let Cloudflare create or validate the required DNS record.

### configure-www-canonical-route

Side effect: mutates-cloudflare-dns-or-redirects

Add www.herbalisti.com only as a redirect/canonical route to the apex domain, keeping herbalisti.com as the public canonical URL.

### verify-live-domain

Side effect: none

```bash
npm run verify:dns-cutover
npm run verify:live-readiness -- --strict
```

## Next Actions

- Prepare Cloudflare zone delegation for herbalisti.com.
- Capture the Cloudflare-assigned nameservers during approved setup.
- Change registrar nameservers only after approval for public DNS mutation.
- Attach herbalisti.com as a Cloudflare Pages custom domain after the Pages project exists.

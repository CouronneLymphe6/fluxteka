/**
 * Test sitemaps Make & Zapier pour extraire les URLs de templates
 */
async function test(label: string, url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fluxteka/1.0; +https://fluxteka.com/bot)' }
    });
    const body = await res.text();
    const preview = body.substring(0, 400).replace(/\n/g, ' ');
    console.log(`${res.ok ? '✅' : '❌'} [${res.status}] ${label}`);
    // Count template URLs if XML
    const templateMatches = body.match(/templates\/[\w-]+/g) || [];
    if (templateMatches.length > 0) {
      console.log(`   📋 ${templateMatches.length} templates trouvés!`);
      console.log(`   Exemple: ${templateMatches.slice(0, 3).join(', ')}`);
    } else {
      console.log(`   ${preview.substring(0, 150)}`);
    }
    console.log();
  } catch (e) {
    console.log(`💥 ${label} → ${e}\n`);
  }
}

async function main() {
  console.log('🗺️  Test Sitemaps\n');
  
  console.log('── MAKE ─────────────────────');
  await test('Make sitemap index', 'https://www.make.com/sitemap.xml');
  await test('Make templates sitemap', 'https://www.make.com/sitemap-templates.xml');
  await test('Make en sitemap', 'https://www.make.com/en/sitemap.xml');

  console.log('── ZAPIER ───────────────────');
  await test('Zapier sitemap index', 'https://zapier.com/sitemap.xml');
  await test('Zapier templates sitemap', 'https://zapier.com/sitemap_templates.xml');
  await test('Zapier apps sitemap', 'https://zapier.com/sitemap_apps.xml');
}

main();

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "HotelsYME", "src");
const DEST_DIR = path.join(__dirname, "hotel-frontend");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Copy lib files
ensureDir(path.join(DEST_DIR, "lib"));
const libFiles = fs.readdirSync(path.join(SRC_DIR, "lib"));
for (const file of libFiles) {
  const srcPath = path.join(SRC_DIR, "lib", file);
  if (fs.statSync(srcPath).isFile()) {
    const destPath = path.join(DEST_DIR, "lib", file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to lib/`);
  }
}

// 2. Copy components (root components)
ensureDir(path.join(DEST_DIR, "components"));
const componentsFiles = fs.readdirSync(path.join(SRC_DIR, "components"));
for (const file of componentsFiles) {
  const srcPath = path.join(SRC_DIR, "components", file);
  if (fs.statSync(srcPath).isFile()) {
    const destPath = path.join(DEST_DIR, "components", file);
    let content = fs.readFileSync(srcPath, "utf8");
    if (!content.trim().startsWith('"use client"') && !content.trim().startsWith("'use client'")) {
      content = '"use client";\n\n' + content;
    }
    content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link"');
    content = content.replace(/import\s+.*\s+from\s+['"]react-router-dom['"]/g, (match) => {
      if (match.includes("Link")) {
        return 'import Link from "next/link";';
      }
      return 'import { useRouter, useParams, useSearchParams } from "next/navigation";';
    });
    content = content.replace(/to=/g, "href=");
    content = content.replace(/const\s+\[searchParams\]\s*=\s*useSearchParams\(\)/g, "const searchParams = useSearchParams()");
    fs.writeFileSync(destPath, content, "utf8");
    console.log(`Copied and processed component: ${file}`);
  }
}

// 3. Copy layout files
ensureDir(path.join(DEST_DIR, "components", "layout"));
const layoutFiles = fs.readdirSync(path.join(SRC_DIR, "components", "layout"));
for (const file of layoutFiles) {
  const srcPath = path.join(SRC_DIR, "components", "layout", file);
  if (fs.statSync(srcPath).isFile()) {
    const destPath = path.join(DEST_DIR, "components", "layout", file);
    let content = fs.readFileSync(srcPath, "utf8");
    if (!content.trim().startsWith('"use client"') && !content.trim().startsWith("'use client'")) {
      content = '"use client";\n\n' + content;
    }
    content = content.replace(/import\s+\{\s*Link\s*,\s*Outlet\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link";\nimport { Outlet } from "@/components/layout/Outlet";');
    content = content.replace(/import\s+.*\s+from\s+['"]react-router-dom['"]/g, (match) => {
      if (match.includes("Link")) {
        return 'import Link from "next/link";';
      }
      return 'import { useRouter, useParams, useSearchParams } from "next/navigation";';
    });
    content = content.replace(/to=/g, "href=");
    content = content.replace(/const\s+\[searchParams\]\s*=\s*useSearchParams\(\)/g, "const searchParams = useSearchParams()");
    fs.writeFileSync(destPath, content, "utf8");
    console.log(`Copied and processed layout: ${file}`);
  }
}

// Custom layout modifications to support children instead of Outlet
const appLayoutPath = path.join(DEST_DIR, "components", "layout", "AppLayout.tsx");
let appLayoutContent = fs.readFileSync(appLayoutPath, "utf8");
appLayoutContent = appLayoutContent.replace("<Outlet />", "{children}").replace("export default function AppLayout()", "export default function AppLayout({ children }: { children: React.ReactNode })");
// Fix the missing useLocation in original react-router imports if any
appLayoutContent = appLayoutContent.replace(/import\s+\{\s*Link\s*,\s*Outlet\s*,\s*useLocation\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link";\nimport { usePathname } from "next/navigation";');
appLayoutContent = appLayoutContent.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n  const location = { pathname };");
fs.writeFileSync(appLayoutPath, appLayoutContent, "utf8");

const dbLayoutPath = path.join(DEST_DIR, "components", "layout", "DashboardLayout.tsx");
let dbLayoutContent = fs.readFileSync(dbLayoutPath, "utf8");
dbLayoutContent = dbLayoutContent.replace("<Outlet key={activeHotel?._id || 'portfolio'} />", "{children}").replace("export default function DashboardLayout()", "export default function DashboardLayout({ children }: { children: React.ReactNode })");
dbLayoutContent = dbLayoutContent.replace(/import\s+\{\s*Link\s*,\s*Outlet\s*,\s*useLocation\s*,\s*useNavigate\s*\}\s+from\s+['"]react-router-dom['"]/g, 'import Link from "next/link";\nimport { usePathname, useRouter } from "next/navigation";');
dbLayoutContent = dbLayoutContent.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n  const location = { pathname };");
dbLayoutContent = dbLayoutContent.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, "const router = useRouter();\n  const navigate = (path) => router.push(path);");
fs.writeFileSync(dbLayoutPath, dbLayoutContent, "utf8");

// 4. Map pages to App Router
const pageMappings = {
  "Home.tsx": "app/page.tsx",
  "SearchResults.tsx": "app/search/page.tsx",
  "Categories.tsx": "app/categories/page.tsx",
  "About.tsx": "app/about/page.tsx",
  "Contact.tsx": "app/contact/page.tsx",
  "News.tsx": "app/news/page.tsx",
  "PublicOffers.tsx": "app/offers/page.tsx",
  "HotelDetails.tsx": "app/hotel/[slug]/page.tsx",
};

for (const [srcFile, destRelative] of Object.entries(pageMappings)) {
  const srcPath = path.join(SRC_DIR, "pages", srcFile);
  const destPath = path.join(DEST_DIR, destRelative);
  ensureDir(path.dirname(destPath));

  let content = fs.readFileSync(srcPath, "utf8");
  if (!content.trim().startsWith('"use client"') && !content.trim().startsWith("'use client'")) {
    content = '"use client";\n\n' + content;
  }
  
  // Replace react-router-dom hooks and elements
  content = content.replace(/import\s+.*\s+from\s+['"]react-router-dom['"]/g, (match) => {
    return 'import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";\nimport Link from "next/link";';
  });

  content = content.replace(/useNavigate\(\)/g, "useRouter()");
  content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, "const router = useRouter()");
  content = content.replace(/navigate\(/g, "router.push(");
  content = content.replace(/to=/g, "href=");
  content = content.replace(/const\s+\{\s*slug\s*\}\s*=\s*useParams\(\)/g, "const params = useParams();\n  const slug = params.slug as string;");
  content = content.replace(/const\s+\[searchParams\]\s*=\s*useSearchParams\(\)/g, "const searchParams = useSearchParams()");
  content = content.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n  const location = { pathname, hash: typeof window !== 'undefined' ? window.location.hash : '' };");
  content = content.replace(/localStorage\.getItem\('hasSeenBidInfo'\)\s*!==\s*['"]true['"]/g, "(typeof window !== 'undefined' ? localStorage.getItem('hasSeenBidInfo') !== 'true' : false)");
  
  // Replace relative paths with aliases
  content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
  content = content.replace(/['"]\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
  content = content.replace(/['"]\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
  content = content.replace(/['"]\.\.\/\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
  content = content.replace(/['"]\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
  content = content.replace(/['"]\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');

  // Determine component name from default export
  const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  const componentName = exportMatch ? exportMatch[1] : srcFile.replace(".tsx", "");
  
  // Rename default export to local function
  content = content.replace(/export\s+default\s+function\s+(\w+)/, "function $1");
  
  // Add AppLayout wrapper
  content += `\n\nimport AppLayout from "@/components/layout/AppLayout";\n`;
  content += `export default function PageWrapper(props: any) {\n`;
  content += `  return (\n`;
  content += `    <AppLayout>\n`;
  content += `      <${componentName} {...props} />\n`;
  content += `    </AppLayout>\n`;
  content += `  );\n`;
  content += `}\n`;

  fs.writeFileSync(destPath, content, "utf8");
  console.log(`Mapped page: ${srcFile} -> ${destRelative}`);
}

// 5. Copy all dashboard files directly to app/dashboard as auxiliary components
const dashboardPages = fs.readdirSync(path.join(SRC_DIR, "pages", "dashboard"));
for (const file of dashboardPages) {
  const srcPath = path.join(SRC_DIR, "pages", "dashboard", file);
  if (fs.statSync(srcPath).isFile()) {
    const destPath = path.join(DEST_DIR, "app", "dashboard", file);
    let content = fs.readFileSync(srcPath, "utf8");
    if (!content.trim().startsWith('"use client"') && !content.trim().startsWith("'use client'")) {
      content = '"use client";\n\n' + content;
    }
    content = content.replace(/import\s+.*\s+from\s+['"]react-router-dom['"]/g, (match) => {
      return 'import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";\nimport Link from "next/link";';
    });
    content = content.replace(/useNavigate\(\)/g, "useRouter()");
    content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, "const router = useRouter()");
    content = content.replace(/navigate\(/g, "router.push(");
    content = content.replace(/to=/g, "href=");
    content = content.replace(/const\s+\[searchParams\]\s*=\s*useSearchParams\(\)/g, "const searchParams = useSearchParams()");
    content = content.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n    const location = { pathname, hash: typeof window !== 'undefined' ? window.location.hash : '' };");
    content = content.replace(/localStorage\.getItem\('hasSeenBidInfo'\)\s*!==\s*['"]true['"]/g, "(typeof window !== 'undefined' ? localStorage.getItem('hasSeenBidInfo') !== 'true' : false)");
    
    // Replace relative paths with aliases
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
    content = content.replace(/['"]\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
    
    fs.writeFileSync(destPath, content, "utf8");
  }
}

// 6. Map dashboard pages to subfolders with wrappers
for (const file of dashboardPages) {
  const srcPath = path.join(SRC_DIR, "pages", "dashboard", file);
  if (fs.statSync(srcPath).isFile()) {
    let destSubPath = "";
    if (file === "DashboardHome.tsx") {
      destSubPath = "app/dashboard/page.tsx";
    } else {
      const folderName = file.replace(".tsx", "").replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
      let finalFolderName = folderName;
      if (folderName === "partner-guest-requests") finalFolderName = "guest-requests";
      if (folderName === "admin-news") finalFolderName = "news-updates";
      destSubPath = `app/dashboard/${finalFolderName}/page.tsx`;
    }

    const destPath = path.join(DEST_DIR, destSubPath);
    ensureDir(path.dirname(destPath));

    let content = fs.readFileSync(srcPath, "utf8");
    if (!content.trim().startsWith('"use client"') && !content.trim().startsWith("'use client'")) {
      content = '"use client";\n\n' + content;
    }

    content = content.replace(/import\s+.*\s+from\s+['"]react-router-dom['"]/g, (match) => {
      return 'import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";\nimport Link from "next/link";';
    });

    content = content.replace(/useNavigate\(\)/g, "useRouter()");
    content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, "const router = useRouter()");
    content = content.replace(/navigate\(/g, "router.push(");
    content = content.replace(/to=/g, "href=");
    content = content.replace(/const\s+\[searchParams\]\s*=\s*useSearchParams\(\)/g, "const searchParams = useSearchParams()");
    content = content.replace(/const\s+location\s*=\s*useLocation\(\)/g, "const pathname = usePathname();\n    const location = { pathname, hash: typeof window !== 'undefined' ? window.location.hash : '' };");
    content = content.replace(/localStorage\.getItem\('hasSeenBidInfo'\)\s*!==\s*['"]true['"]/g, "(typeof window !== 'undefined' ? localStorage.getItem('hasSeenBidInfo') !== 'true' : false)");

    // Replace relative paths with aliases
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/components\/(.*?)['"]/g, '"@/components/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
    content = content.replace(/['"]\.\.\/\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');
    content = content.replace(/['"]\.\.\/lib\/(.*?)['"]/g, '"@/lib/$1"');

    // Determine component name from default export
    const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
    const componentName = exportMatch ? exportMatch[1] : file.replace(".tsx", "");
    
    // Rename default export to local function
    content = content.replace(/export\s+default\s+function\s+(\w+)/, "function $1");
    
    // Add DashboardLayout wrapper
    content += `\n\nimport DashboardLayout from "@/components/layout/DashboardLayout";\n`;
    content += `export default function PageWrapper(props: any) {\n`;
    content += `  return (\n`;
    content += `    <DashboardLayout>\n`;
    content += `      <${componentName} {...props} />\n`;
    content += `    </DashboardLayout>\n`;
    content += `  );\n`;
    content += `}\n`;

    fs.writeFileSync(destPath, content, "utf8");
    console.log(`Mapped dashboard page: ${file} -> ${destSubPath}`);
  }
}

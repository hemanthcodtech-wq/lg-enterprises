const fs = require('fs');

const filesToFix = [
  'src/pages/admin/AdminWithdrawals.jsx',
  'src/pages/admin/AdminUserDetails.jsx',
  'src/pages/admin/AdminPromos.jsx',
  'src/pages/admin/AdminProducts.jsx',
  'src/pages/admin/AdminOrders.jsx',
  'src/pages/admin/AdminCategories.jsx',
  'src/pages/admin/AdminCarousel.jsx',
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.split("`x-auth-token'").join("'x-auth-token'");
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed auth token quotes in:', file);
  }
});

#!/usr/bin/env bash

# Clean Clerk API key from git history
# This script removes the exposed API key from all commits

cd "c:\Users\DELL\Desktop\Kharcha-core\BrokTok"

# Create a file with patterns to remove
cat > /tmp/filter-patterns.txt << EOF
pk_test_c3VwcmVtZS1sYWJyYWRvci01Ni5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_
EOF

echo "⚠️  WARNING: This will rewrite git history!"
echo "All commits will have new hashes."
echo ""
echo "Steps to complete:"
echo "1. Run: git-filter-repo --replace-text /tmp/filter-patterns.txt --force"
echo "2. Force push: git push origin --force"
echo "3. Rotate Clerk key at https://dashboard.clerk.com"
echo ""

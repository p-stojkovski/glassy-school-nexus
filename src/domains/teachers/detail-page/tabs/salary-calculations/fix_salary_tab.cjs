const fs = require('fs');

// Read backup
let content = fs.readFileSync('SalaryCalculationsTab.tsx.backup', 'utf8');

// 1. Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport { useParams, useNavigate } from 'react-router-dom';"
);

// 2. Remove SalaryCalculationDetailDialog from imports
content = content.replace(
  /,\s*SalaryCalculationDetailDialog,/,
  ','
);

// 3. Add navigate and teacherId hooks after toast
content = content.replace(
  "const { toast } = useToast();",
  "const { toast } = useToast();\n  const navigate = useNavigate();\n  const { teacherId } = useParams<{ teacherId: string }>();"
);

// 4. Remove detailDialogOpen state
content = content.replace(
  /const \[detailDialogOpen, setDetailDialogOpen\] = useState\(false\);[\s\n]*/,
  ''
);

// 5. Replace handleViewDetails implementation
content = content.replace(
  /const handleViewDetails = \(calculation: SalaryCalculation\) => \{[\s\S]*?setDetailDialogOpen\(true\);[\s\n]*\};/,
  "const handleViewDetails = (calculation: SalaryCalculation) => {\n    navigate(`/teachers/\${teacherId}/salary-calculations/\${calculation.id}`);\n  };"
);

// 6. Remove SalaryCalculationDetailDialog JSX
content = content.replace(
  /<SalaryCalculationDetailDialog[\s\S]*?\/>/,
  ''
);

// Write result
fs.writeFileSync('SalaryCalculationsTab.tsx', content, 'utf8');
console.log('Fixed SalaryCalculationsTab.tsx');

const fs = require('fs');

// Read the backup
const original = fs.readFileSync('SalaryCalculationsTab.tsx.backup', 'utf8');

// Single comprehensive replace operation
let fixed = original
  // 1. Add import after the useState line
  .replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { useParams, useNavigate } from 'react-router-dom';"
  )
  // 2. Remove SalaryCalculationDetailDialog from imports (preserve line structure)
  .replace(/  SalaryCalculationDetailDialog,\n/, '')
  // 3. Add hooks after toast
  .replace(
    'const { toast } = useToast();',
    'const { toast } = useToast();\n  const navigate = useNavigate();\n  const { teacherId } = useParams<{ teacherId: string }>();'
  )
  // 4. Remove detailDialogOpen state
  .replace(/  const \[detailDialogOpen, setDetailDialogOpen\] = useState\(false\);\n/, '')
  //5. Replace handleViewDetails function body
  .replace(
    /const handleViewDetails = \(calculation: SalaryCalculation\) => \{\n    setSelectedCalculation\(calculation\);\n    setDetailDialogOpen\(true\);\n  \};/,
    'const handleViewDetails = (calculation: SalaryCalculation) => {\n    navigate(`/teachers/${teacherId}/salary-calculations/${calculation.id}`);\n  };'
  )
  // 6. Remove the SalaryCalculationDetailDialog JSX block
  .replace(
    /\n\n      <SalaryCalculationDetailDialog[\s\S]*?onSuccess=\{handleDialogSuccess\}\n      \/>/,
    ''
  );

fs.writeFileSync('SalaryCalculationsTab.tsx', fixed, 'utf8');
console.log('Successfully fixed SalaryCalculationsTab.tsx');

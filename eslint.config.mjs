import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 🔽 Add this override for the generated Prisma file
  {
  files: ["src/**/*.{js,ts,tsx}"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off", 
    "@typescript-eslint/no-unused-expressions": "off",
    " @typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",    
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-require-imports": "off",
     "@typescript-eslint/no-empty-object-type": "off",

  },
  },
];

export default eslintConfig;

import os
import json

structure = {
    "apps/web": {
        "package.json": {
            "name": "web",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "echo 'Web Client dev stub'",
                "build": "echo 'Web Client build stub'"
            }
        },
        "README.md": "# Client Web Application (web)\n\nКлієнтський веб-портал для студентів, викладачів та роботодавців."
    },
    "apps/admin": {
        "package.json": {
            "name": "admin",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "echo 'Admin Portal dev stub'",
                "build": "echo 'Admin Portal build stub'"
            }
        },
        "README.md": "# Administrative CMS & CRM Panel (admin)\n\nАдміністративна панель для управління контентом, курсами та аудиту компетентностей."
    },
    "apps/api": {
        "package.json": {
            "name": "api",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "echo 'Backend API dev stub'",
                "build": "echo 'Backend API build stub'"
            }
        },
        "README.md": "# NestJS Backend API (api)\n\nЯдро серверної логіки, авторизація, інтеграція з базою даних, BKT-двигун та LLM Judge."
    },
    "packages/database": {
        "package.json": {
            "name": "@sbc/database",
            "version": "0.1.0",
            "private": True
        },
        "README.md": "# Prisma Database Package (database)\n\nСпільний пакет для роботи з базою даних, Prisma схеми та міграції."
    },
    "packages/types": {
        "package.json": {
            "name": "@sbc/types",
            "version": "0.1.0",
            "private": True
        },
        "README.md": "# Shared TypeScript Types (types)\n\nНаскрізні TypeScript інтерфейси та DTO для забезпечення E2E Type Safety."
    },
    "packages/contracts": {
        "package.json": {
            "name": "@sbc/contracts",
            "version": "0.1.0",
            "private": True
        },
        "README.md": "# Web3 Smart Contracts (contracts)\n\nСмарт-контракти Solidity (Foundry/Hardhat) для випуску dNFT та Soulbound-токенів."
    }
}

for path, files in structure.items():
    os.makedirs(path, exist_ok=True)
    for filename, content in files.items():
        filepath = os.path.join(path, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            if filename.endswith(".json"):
                json.dump(content, f, indent=2, ensure_ascii=False)
            else:
                f.write(content)
        print(f"Created: {filepath}")
